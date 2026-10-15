import { create } from 'zustand';
import {
  BetSide,
  Card,
  DealtCardStep,
  RoundResult,
  AndarBaharConfig,
  DEFAULT_CONFIG,
  playAndarBaharRound,
} from './andarBaharEngine';
import { andarBaharAudio } from './andarBaharAudio';
import { useGameStore } from '../shared/useGameStore';

export interface RecentRoundEntry {
  card: Card;
  winningSide: BetSide;
}

export interface AndarBaharState {
  // Gameplay State
  selectedSide: BetSide;
  selectedChip: number; // 50, 100, 250, 500, 1000
  gameState: 'idle' | 'dealing' | 'round_settled';

  // Current Round Dealing Data
  openingCard: Card | null;
  dealtSteps: DealtCardStep[];
  currentStepIndex: number;
  andarCards: Card[];
  baharCards: Card[];
  roundResult: RoundResult | null;
  firstSideNotice: string | null;

  // History & Results
  recentResults: RecentRoundEntry[];
  config: AndarBaharConfig;
  skipAnimation: boolean;

  // Modals & Panels
  statsOpen: boolean;
  settingsOpen: boolean;
  predictMode: boolean;
  userPrediction: number; // 0-100%

  // Actions
  setSelectedSide: (side: BetSide) => void;
  setSelectedChip: (chip: number) => void;
  setSkipAnimation: (skip: boolean) => void;
  setFirstSideRule: (rule: AndarBaharConfig['firstSideRule']) => void;
  setPayoutMultiplier: (multiplier: number) => void;
  toggleStats: (open?: boolean) => void;
  toggleSettings: (open?: boolean) => void;
  setPredictMode: (enabled: boolean) => void;
  setUserPrediction: (pred: number) => void;
  dealRound: () => Promise<void>;
  resetRound: () => void;
}

const STORAGE_KEY_RECENT_AB = 'andar_bahar_recent_cards';

function getInitialRecentCards(): RecentRoundEntry[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_RECENT_AB);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
  }
  // Realistic initial cards matching reference
  return [
    { card: { id: 'K_H', rank: 'K', suit: '♥', color: 'red' }, winningSide: 'ANDAR' },
    { card: { id: '8_S', rank: '8', suit: '♠', color: 'black' }, winningSide: 'BAHAR' },
    { card: { id: 'J_D', rank: 'J', suit: '♦', color: 'red' }, winningSide: 'ANDAR' },
    { card: { id: '4_C', rank: '4', suit: '♣', color: 'black' }, winningSide: 'BAHAR' },
    { card: { id: 'A_S', rank: 'A', suit: '♠', color: 'black' }, winningSide: 'ANDAR' },
    { card: { id: '9_H', rank: '9', suit: '♥', color: 'red' }, winningSide: 'ANDAR' },
    { card: { id: 'Q_C', rank: 'Q', suit: '♣', color: 'black' }, winningSide: 'BAHAR' },
    { card: { id: '7_D', rank: '7', suit: '♦', color: 'red' }, winningSide: 'ANDAR' },
  ];
}

export const useAndarBaharStore = create<AndarBaharState>((set, get) => {
  return {
    selectedSide: 'ANDAR',
    selectedChip: 100,
    gameState: 'idle',

    openingCard: null,
    dealtSteps: [],
    currentStepIndex: 0,
    andarCards: [],
    baharCards: [],
    roundResult: null,
    firstSideNotice: null,

    recentResults: getInitialRecentCards(),
    config: DEFAULT_CONFIG,
    skipAnimation: false,

    statsOpen: false,
    settingsOpen: false,
    predictMode: false,
    userPrediction: 50,

    setSelectedSide: (side: BetSide) => {
      andarBaharAudio.playChipClick();
      set({ selectedSide: side });
    },

    setSelectedChip: (chip: number) => {
      andarBaharAudio.playChipClick();
      set({ selectedChip: chip });
      useGameStore.getState().setSelectedChip(chip);
    },

    setSkipAnimation: (skip: boolean) => set({ skipAnimation: skip }),
    setFirstSideRule: (rule) => set((s) => ({ config: { ...s.config, firstSideRule: rule } })),
    setPayoutMultiplier: (m) => set((s) => ({ config: { ...s.config, payoutMultiplier: m } })),
    toggleStats: (open) => set((s) => ({ statsOpen: open !== undefined ? open : !s.statsOpen })),
    toggleSettings: (open) => set((s) => ({ settingsOpen: open !== undefined ? open : !s.settingsOpen })),
    setPredictMode: (enabled) => set({ predictMode: enabled }),
    setUserPrediction: (pred) => set({ userPrediction: pred }),

    dealRound: async () => {
      const { selectedSide, selectedChip, gameState, config, skipAnimation, predictMode, userPrediction } = get();
      if (gameState === 'dealing') return;

      const sharedStore = useGameStore.getState();
      if (sharedStore.balance < selectedChip) {
        andarBaharAudio.triggerHaptic([30, 30]);
        return;
      }

      // Deduct bet amount from shared wallet
      sharedStore.deductBalance(selectedChip);
      andarBaharAudio.playShuffle();

      // Resolve round mathematically
      const result = playAndarBaharRound(selectedSide, selectedChip, config);

      // Award XP in Predict Mode
      if (predictMode) {
        const trueProb = 50.0;
        const diff = Math.abs(trueProb - userPrediction);
        const earnedXp = Math.max(10, Math.round(100 - diff * 2));
        sharedStore.addXp(earnedXp);
      }

      // First deal announcement
      const firstNotice = result.firstSide === 'ANDAR' ? 'Andar deals first' : 'Bahar deals first';

      set({
        gameState: 'dealing',
        openingCard: result.openingCard,
        dealtSteps: result.dealtCards,
        currentStepIndex: 0,
        andarCards: [],
        baharCards: [],
        roundResult: result,
        firstSideNotice: firstNotice,
      });

      if (skipAnimation) {
        // Instant settlement
        const updatedRecent = [
          { card: result.matchingCard, winningSide: result.winningSide },
          ...get().recentResults.slice(0, 14),
        ];

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_RECENT_AB, JSON.stringify(updatedRecent));
        }

        if (result.won && result.payout) {
          sharedStore.addBalance(result.payout);
          andarBaharAudio.playWinChime();
          sharedStore.unlockAchievement('first_deal');
          if (result.payout >= 500) sharedStore.unlockAchievement('big_win');
        }

        set({
          gameState: 'round_settled',
          andarCards: result.andarCards,
          baharCards: result.baharCards,
          currentStepIndex: result.dealtCards.length,
          recentResults: updatedRecent,
          firstSideNotice: null,
        });
        return;
      }

      // Animated dealing sequence (cards deal alternately)
      const totalSteps = result.dealtCards.length;
      let currentIdx = 0;

      const dealNextCard = () => {
        if (currentIdx >= totalSteps) {
          // Finished dealing
          const updatedRecent = [
            { card: result.matchingCard, winningSide: result.winningSide },
            ...get().recentResults.slice(0, 14),
          ];

          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_RECENT_AB, JSON.stringify(updatedRecent));
          }

          if (result.won && result.payout) {
            sharedStore.addBalance(result.payout);
            andarBaharAudio.playWinChime();
            sharedStore.unlockAchievement('first_deal');
            if (result.payout >= 500) sharedStore.unlockAchievement('big_win');
          } else {
            andarBaharAudio.playCardFlip();
          }

          set({
            gameState: 'round_settled',
            currentStepIndex: totalSteps,
            recentResults: updatedRecent,
            firstSideNotice: null,
          });
          return;
        }

        const step = result.dealtCards[currentIdx];
        andarBaharAudio.playCardSlide();

        set((state) => {
          const nextAndar = step.side === 'ANDAR' ? [...state.andarCards, step.card] : state.andarCards;
          const nextBahar = step.side === 'BAHAR' ? [...state.baharCards, step.card] : state.baharCards;
          return {
            andarCards: nextAndar,
            baharCards: nextBahar,
            currentStepIndex: currentIdx + 1,
          };
        });

        currentIdx++;

        // Deal speed: 320ms for first 10 cards, accelerating to 180ms for long runs
        const delay = currentIdx > 10 ? 180 : 320;
        setTimeout(dealNextCard, delay);
      };

      // Start after opening card flip & toast
      setTimeout(dealNextCard, 800);
    },

    resetRound: () => {
      set({
        gameState: 'idle',
        openingCard: null,
        dealtSteps: [],
        currentStepIndex: 0,
        andarCards: [],
        baharCards: [],
        roundResult: null,
        firstSideNotice: null,
      });
    },
  };
});
