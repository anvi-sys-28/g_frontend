import { create } from 'zustand';
import {
  BetSide,
  Card,
  DealtCardStep,
  RoundResult,
  AndarBaharConfig,
  DEFAULT_CONFIG,
} from './andarBaharEngine';
import {
  getLiveAndarBaharState,
  RoomAndarBaharBet,
} from './liveAndarBaharSync';
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

  // Live Synchronized State
  isLiveMode: boolean;
  liveRoundId: number;
  livePhase: 'betting' | 'dealing' | 'settled';
  liveTimeRemaining: number;
  livePhaseProgress: number;
  activePlayersCount: number;
  roomBets: RoomAndarBaharBet[];
  andarTotalWager: number;
  baharTotalWager: number;
  leastChosenSide: BetSide;

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
  setLiveMode: (live: boolean) => void;
  dealRound: () => Promise<void>;
  resetRound: () => void;
  syncLiveTick: (nowMs?: number) => void;
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
  const initialLive = getLiveAndarBaharState(Date.now());

  return {
    selectedSide: 'ANDAR',
    selectedChip: 100,
    gameState: initialLive.phase === 'dealing' ? 'dealing' : initialLive.phase === 'settled' ? 'round_settled' : 'idle',

    // Live Multiplayer Synchronous Defaults
    isLiveMode: true,
    liveRoundId: initialLive.roundId,
    livePhase: initialLive.phase,
    liveTimeRemaining: initialLive.timeRemaining,
    livePhaseProgress: initialLive.phaseProgress,
    activePlayersCount: initialLive.activePlayersCount,
    roomBets: initialLive.roomBets,
    andarTotalWager: initialLive.andarTotalWager,
    baharTotalWager: initialLive.baharTotalWager,
    leastChosenSide: initialLive.leastChosenSide,

    openingCard: initialLive.phase !== 'betting' ? initialLive.openingCard : null,
    dealtSteps: initialLive.dealtSteps,
    currentStepIndex: initialLive.currentStepIndex,
    andarCards: initialLive.andarCards,
    baharCards: initialLive.baharCards,
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
      const { isLiveMode, livePhase } = get();
      if (isLiveMode && livePhase !== 'betting') {
        andarBaharAudio.triggerHaptic([25, 25]);
        return;
      }
      andarBaharAudio.playChipClick();
      set({ selectedSide: side });
    },

    setSelectedChip: (chip: number) => {
      const { isLiveMode, livePhase } = get();
      if (isLiveMode && livePhase !== 'betting') {
        andarBaharAudio.triggerHaptic([25, 25]);
        return;
      }
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
    setLiveMode: (live: boolean) => set({ isLiveMode: live }),

    syncLiveTick: (nowMs: number = Date.now()) => {
      const {
        isLiveMode,
        livePhase: currentPhase,
        liveRoundId: currentRoundId,
        selectedSide,
        selectedChip,
        config,
        recentResults,
      } = get();

      if (!isLiveMode) return;

      const sharedStore = useGameStore.getState();
      const localBet = { side: selectedSide, amount: selectedChip };
      const liveState = getLiveAndarBaharState(nowMs, localBet);

      // 1. Check for Round rollover
      if (liveState.roundId !== currentRoundId) {
        set({
          liveRoundId: liveState.roundId,
          livePhase: liveState.phase,
          liveTimeRemaining: liveState.timeRemaining,
          livePhaseProgress: liveState.phaseProgress,
          activePlayersCount: liveState.activePlayersCount,
          roomBets: liveState.roomBets,
          andarTotalWager: liveState.andarTotalWager,
          baharTotalWager: liveState.baharTotalWager,
          leastChosenSide: liveState.leastChosenSide,
          openingCard: liveState.phase === 'betting' ? null : liveState.openingCard,
          dealtSteps: liveState.dealtSteps,
          currentStepIndex: liveState.phase === 'betting' ? 0 : liveState.currentStepIndex,
          andarCards: liveState.phase === 'betting' ? [] : liveState.andarCards,
          baharCards: liveState.phase === 'betting' ? [] : liveState.baharCards,
          roundResult: null,
          firstSideNotice: null,
          gameState:
            liveState.phase === 'dealing'
              ? 'dealing'
              : liveState.phase === 'settled'
              ? 'round_settled'
              : 'idle',
        });
        return;
      }

      // 2. Check for Phase transition within current round
      if (liveState.phase !== currentPhase) {
        if (liveState.phase === 'dealing') {
          // Transition: Betting (5s) -> Dealing (10s suspense)
          // Automatically deduct bet if user has balance
          if (sharedStore.balance >= selectedChip) {
            sharedStore.deductBalance(selectedChip);
          }
          andarBaharAudio.playShuffle();

          set({
            livePhase: 'dealing',
            gameState: 'dealing',
            liveTimeRemaining: liveState.timeRemaining,
            livePhaseProgress: liveState.phaseProgress,
            openingCard: liveState.openingCard,
            dealtSteps: liveState.dealtSteps,
            currentStepIndex: liveState.currentStepIndex,
            andarCards: liveState.andarCards,
            baharCards: liveState.baharCards,
            firstSideNotice: 'Andar deals first',
            roomBets: liveState.roomBets,
            andarTotalWager: liveState.andarTotalWager,
            baharTotalWager: liveState.baharTotalWager,
            leastChosenSide: liveState.leastChosenSide,
          });

          // Post live bet asynchronously to API
          if (typeof window !== 'undefined') {
            const userId = localStorage.getItem('playin_user_id') || 'local_vip';
            fetch('/api/casino/andar-bahar/live', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roundId: liveState.roundId,
                userId,
                playerName: userId,
                side: selectedSide,
                amount: selectedChip,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data?.newBalance !== undefined) {
                  sharedStore.resetBalance(data.newBalance);
                  try {
                    localStorage.setItem('playin_user_coins', String(data.newBalance));
                  } catch {}
                }
              })
              .catch(() => {});
          }
          return;
        } else if (liveState.phase === 'settled') {
          // Transition: Dealing -> Settled
          const isUserWinner = selectedSide === liveState.winningSide;
          const payout = isUserWinner ? Math.round(selectedChip * config.payoutMultiplier) : 0;
          const netProfit = isUserWinner ? payout - selectedChip : -selectedChip;

          if (isUserWinner && payout > 0) {
            sharedStore.addBalance(payout);
            andarBaharAudio.playWinChime();
          } else {
            andarBaharAudio.playCardFlip();
          }

          const updatedRecent: RecentRoundEntry[] = [
            { card: liveState.matchingCard, winningSide: liveState.winningSide },
            ...recentResults.slice(0, 14),
          ];

          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_RECENT_AB, JSON.stringify(updatedRecent));
            const userId = localStorage.getItem('playin_user_id') || 'local_vip';

            // Settle with server API to persist real coins in database/store!
            fetch('/api/casino/andar-bahar/settle', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roundId: liveState.roundId,
                userId,
                playerName: userId,
                winningSide: liveState.winningSide,
                betSide: selectedSide,
                wager: selectedChip,
                payout,
                won: isUserWinner,
                details: {
                  openingCard: liveState.openingCard,
                  matchingCard: liveState.matchingCard,
                  totalCardsDealt: liveState.dealtSteps.length,
                },
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data?.newBalance !== undefined) {
                  sharedStore.resetBalance(data.newBalance);
                  try {
                    localStorage.setItem('playin_user_coins', String(data.newBalance));
                  } catch {}
                }
              })
              .catch(() => {});
          }

          const result: RoundResult = {
            openingCard: liveState.openingCard,
            firstSide: 'ANDAR',
            dealtCards: liveState.dealtSteps,
            andarCards: liveState.andarCards,
            baharCards: liveState.baharCards,
            winningSide: liveState.winningSide,
            matchingCard: liveState.matchingCard,
            totalCardsDealt: liveState.dealtSteps.length,
            userBetSide: selectedSide,
            betAmount: selectedChip,
            won: isUserWinner,
            payout,
            netProfit,
          };

          set({
            livePhase: 'settled',
            gameState: 'round_settled',
            liveTimeRemaining: liveState.timeRemaining,
            livePhaseProgress: liveState.phaseProgress,
            roundResult: result,
            recentResults: updatedRecent,
            andarCards: liveState.andarCards,
            baharCards: liveState.baharCards,
            currentStepIndex: liveState.dealtSteps.length,
            firstSideNotice: null,
            roomBets: liveState.roomBets,
          });
          return;
        } else if (liveState.phase === 'betting') {
          // Transition: Settled -> Betting (New round opens!)
          set({
            livePhase: 'betting',
            gameState: 'idle',
            liveTimeRemaining: liveState.timeRemaining,
            livePhaseProgress: liveState.phaseProgress,
            openingCard: null,
            andarCards: [],
            baharCards: [],
            currentStepIndex: 0,
            roundResult: null,
            firstSideNotice: null,
            roomBets: liveState.roomBets,
            andarTotalWager: liveState.andarTotalWager,
            baharTotalWager: liveState.baharTotalWager,
            leastChosenSide: liveState.leastChosenSide,
          });
          return;
        }
      }

      // During dealing phase, update incremental dealt cards and trigger slide audio
      if (liveState.phase === 'dealing') {
        const prevIndex = get().currentStepIndex;
        if (liveState.currentStepIndex > prevIndex) {
          andarBaharAudio.playCardSlide();
        }
      }

      // Continuous tick update within current phase
      set({
        liveTimeRemaining: liveState.timeRemaining,
        livePhaseProgress: liveState.phaseProgress,
        activePlayersCount: liveState.activePlayersCount,
        currentStepIndex: liveState.currentStepIndex,
        andarCards: liveState.andarCards,
        baharCards: liveState.baharCards,
        roomBets: liveState.roomBets,
        andarTotalWager: liveState.andarTotalWager,
        baharTotalWager: liveState.baharTotalWager,
        leastChosenSide: liveState.leastChosenSide,
      });
    },

    dealRound: async () => {
      // In live mode, dealing is driven synchronously by the live clock!
      const { isLiveMode } = get();
      if (isLiveMode) return;
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
