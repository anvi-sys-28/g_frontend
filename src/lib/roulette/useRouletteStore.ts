import { create } from 'zustand';
import {
  BetType,
  PlacedBet,
  SpinResult,
  WheelType,
  evaluateSpin,
  getRandomWinningNumber,
  EUROPEAN_NUMBERS,
} from './rouletteEngine';
import { soundEffects } from './soundEffects';

export interface RouletteStoreState {
  // Financial State
  balance: number;
  selectedChip: number; // 10, 50, 100, 250, 500, 1000
  bets: Record<string, PlacedBet>;
  betHistoryStack: Array<{ betId: string; chipValue: number }>;
  lastRoundBets: Record<string, PlacedBet>;

  // Game Engine & Wheel State
  spinState: 'idle' | 'spinning' | 'settled';
  winningNumber: number | null;
  spinResult: SpinResult | null;
  recentNumbers: number[];
  wheelType: WheelType;
  fastSpin: boolean;

  // 3D Animation targets
  targetWinningPocketIndex: number; // index in EUROPEAN_NUMBERS
  spinStartTime: number;

  // Audio & Settings
  isSoundMuted: boolean;
  statsOpen: boolean;
  settingsOpen: boolean;

  // Gamification & University Probability Lab
  predictMode: boolean;
  userPrediction: number; // e.g. estimated probability 0-100
  playerXp: number;
  playerLevel: number;
  spinCount: number;

  // Actions
  setSelectedChip: (chip: number) => void;
  placeBet: (id: string, type: BetType, label: string, numbers: number[]) => boolean;
  undoBet: () => void;
  clearAllBets: () => void;
  repeatBets: () => void;
  spin: () => Promise<number | null>;
  onSpinComplete: () => void;
  toggleSound: () => void;
  toggleStats: (open?: boolean) => void;
  toggleSettings: (open?: boolean) => void;
  setWheelType: (wheelType: WheelType) => void;
  setFastSpin: (fast: boolean) => void;
  setPredictMode: (enabled: boolean) => void;
  setUserPrediction: (p: number) => void;
  addBalance: (amount: number) => void;
  resetBalance: (amount?: number) => void;
}

const STORAGE_KEY_BALANCE = 'roulette_balance';
const STORAGE_KEY_XP = 'roulette_player_xp';
const STORAGE_KEY_RECENT = 'roulette_recent_numbers';

function getInitialBalance(): number {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_BALANCE);
    if (saved && !isNaN(Number(saved))) {
      return Number(saved);
    }
  }
  return 2500;
}

function getInitialRecentNumbers(): number[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_RECENT);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
  }
  // Default matching screenshot reference
  return [32, 15, 7, 28, 12, 4, 21, 2, 25, 17];
}

function getInitialXp(): { xp: number; level: number } {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_XP);
    if (saved && !isNaN(Number(saved))) {
      const xp = Number(saved);
      return { xp, level: Math.floor(xp / 100) + 1 };
    }
  }
  return { xp: 0, level: 1 };
}

export const useRouletteStore = create<RouletteStoreState>((set, get) => {
  const initXp = getInitialXp();

  return {
    balance: getInitialBalance(),
    selectedChip: 100,
    bets: {},
    betHistoryStack: [],
    lastRoundBets: {},

    spinState: 'idle',
    winningNumber: null,
    spinResult: null,
    recentNumbers: getInitialRecentNumbers(),
    wheelType: 'european',
    fastSpin: false,

    targetWinningPocketIndex: 0,
    spinStartTime: 0,

    isSoundMuted: false,
    statsOpen: false,
    settingsOpen: false,

    predictMode: false,
    userPrediction: 50,
    playerXp: initXp.xp,
    playerLevel: initXp.level,
    spinCount: 0,

    setSelectedChip: (chip: number) => {
      soundEffects.triggerHaptic(8);
      set({ selectedChip: chip });
    },

    placeBet: (id: string, type: BetType, label: string, numbers: number[]) => {
      const { balance, selectedChip, bets, betHistoryStack, spinState } = get();

      if (spinState === 'spinning') return false;
      if (balance < selectedChip) {
        // Insufficient funds
        soundEffects.triggerHaptic([30, 30]);
        return false;
      }

      soundEffects.playChipSound();

      const existingBet = bets[id];
      const updatedChips = existingBet ? { ...existingBet.chips } : {};
      updatedChips[selectedChip] = (updatedChips[selectedChip] || 0) + 1;

      const newBet: PlacedBet = {
        id,
        type,
        label,
        numbers,
        amount: (existingBet ? existingBet.amount : 0) + selectedChip,
        chips: updatedChips,
      };

      const newBalance = balance - selectedChip;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BALANCE, String(newBalance));
      }

      set({
        balance: newBalance,
        bets: { ...bets, [id]: newBet },
        betHistoryStack: [...betHistoryStack, { betId: id, chipValue: selectedChip }],
      });

      return true;
    },

    undoBet: () => {
      const { bets, betHistoryStack, balance, spinState } = get();
      if (spinState === 'spinning' || betHistoryStack.length === 0) return;

      const lastAction = betHistoryStack[betHistoryStack.length - 1];
      const targetBet = bets[lastAction.betId];
      if (!targetBet) return;

      soundEffects.playClearSound();

      const newBalance = balance + lastAction.chipValue;
      const updatedBets = { ...bets };

      const remainingAmount = targetBet.amount - lastAction.chipValue;
      if (remainingAmount <= 0) {
        delete updatedBets[lastAction.betId];
      } else {
        const updatedChips = { ...targetBet.chips };
        if (updatedChips[lastAction.chipValue] > 1) {
          updatedChips[lastAction.chipValue] -= 1;
        } else {
          delete updatedChips[lastAction.chipValue];
        }

        updatedBets[lastAction.betId] = {
          ...targetBet,
          amount: remainingAmount,
          chips: updatedChips,
        };
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BALANCE, String(newBalance));
      }

      set({
        balance: newBalance,
        bets: updatedBets,
        betHistoryStack: betHistoryStack.slice(0, -1),
      });
    },

    clearAllBets: () => {
      const { bets, balance, spinState } = get();
      if (spinState === 'spinning') return;

      const totalBetAmount = Object.values(bets).reduce((acc, b) => acc + b.amount, 0);
      if (totalBetAmount === 0) return;

      soundEffects.playClearSound();

      const newBalance = balance + totalBetAmount;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BALANCE, String(newBalance));
      }

      set({
        balance: newBalance,
        bets: {},
        betHistoryStack: [],
      });
    },

    repeatBets: () => {
      const { lastRoundBets, balance, spinState } = get();
      if (spinState === 'spinning') return;

      const totalNeeded = Object.values(lastRoundBets).reduce((acc, b) => acc + b.amount, 0);
      if (totalNeeded === 0 || balance < totalNeeded) {
        soundEffects.triggerHaptic([30, 30]);
        return;
      }

      soundEffects.playChipSound();

      const newBalance = balance - totalNeeded;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BALANCE, String(newBalance));
      }

      const newStack: Array<{ betId: string; chipValue: number }> = [];
      Object.values(lastRoundBets).forEach((b) => {
        Object.entries(b.chips).forEach(([chipStr, count]) => {
          const chipVal = Number(chipStr);
          for (let i = 0; i < count; i++) {
            newStack.push({ betId: b.id, chipValue: chipVal });
          }
        });
      });

      set({
        balance: newBalance,
        bets: { ...lastRoundBets },
        betHistoryStack: newStack,
      });
    },

    spin: async () => {
      const { bets, spinState, wheelType, fastSpin, predictMode, userPrediction } = get();
      if (spinState === 'spinning') return null;

      const activeBetsList = Object.values(bets);
      if (activeBetsList.length === 0) {
        // Can't spin with no bets
        soundEffects.triggerHaptic([20, 20]);
        return null;
      }

      // 1. Determine Winning Number cryptographically
      const winningNumber = getRandomWinningNumber(wheelType);
      const pocketIndex = EUROPEAN_NUMBERS.indexOf(winningNumber);

      const duration = fastSpin ? 2.5 : 6.0;
      soundEffects.startBallSpinLoop(duration);

      set({
        spinState: 'spinning',
        winningNumber,
        targetWinningPocketIndex: pocketIndex >= 0 ? pocketIndex : 0,
        spinStartTime: Date.now(),
        lastRoundBets: { ...bets },
        spinResult: null,
      });

      // Award XP if in predict mode
      if (predictMode) {
        const coveredCount = new Set(activeBetsList.flatMap((b) => b.numbers)).size;
        const trueProb = (coveredCount / 37) * 100;
        const diff = Math.abs(trueProb - userPrediction);
        const earnedXp = Math.max(10, Math.round(100 - diff * 2));
        const newXp = get().playerXp + earnedXp;
        const newLevel = Math.floor(newXp / 100) + 1;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_XP, String(newXp));
        }
        set({ playerXp: newXp, playerLevel: newLevel });
      }

      return winningNumber;
    },

    onSpinComplete: () => {
      const { winningNumber, bets, balance, recentNumbers, spinCount } = get();
      if (winningNumber === null) return;

      const activeBetsList = Object.values(bets);
      const result = evaluateSpin(winningNumber, activeBetsList);

      const newBalance = balance + result.totalPayout;
      const updatedRecent = [winningNumber, ...recentNumbers.slice(0, 19)];

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BALANCE, String(newBalance));
        localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updatedRecent));
      }

      if (result.totalPayout > 0) {
        soundEffects.playWinFanfare();
      } else {
        soundEffects.playBallBounceSound(0.8);
      }

      set({
        spinState: 'settled',
        spinResult: result,
        balance: newBalance,
        recentNumbers: updatedRecent,
        spinCount: spinCount + 1,
      });
    },

    toggleSound: () => {
      const next = !get().isSoundMuted;
      soundEffects.setMuted(next);
      set({ isSoundMuted: next });
    },

    toggleStats: (open?: boolean) => {
      set((state) => ({ statsOpen: open !== undefined ? open : !state.statsOpen }));
    },

    toggleSettings: (open?: boolean) => {
      set((state) => ({ settingsOpen: open !== undefined ? open : !state.settingsOpen }));
    },

    setWheelType: (wheelType: WheelType) => set({ wheelType }),
    setFastSpin: (fast: boolean) => set({ fastSpin: fast }),
    setPredictMode: (enabled: boolean) => set({ predictMode: enabled }),
    setUserPrediction: (p: number) => set({ userPrediction: p }),

    addBalance: (amount: number) => {
      const newBal = get().balance + amount;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BALANCE, String(newBal));
      }
      set({ balance: newBal });
    },

    resetBalance: (amount: number = 2500) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BALANCE, String(amount));
      }
      set({ balance: amount, bets: {}, betHistoryStack: [] });
    },
  };
});
