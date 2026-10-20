import { create } from 'zustand';
import {
  BetType,
  PlacedBet,
  SpinResult,
  WheelType,
  evaluateSpin,
  EUROPEAN_NUMBERS,
} from './rouletteEngine';
import {
  getLiveRoundState,
  computeLeastChosenWinningNumber,
  RoomPlayerBet,
} from './liveRouletteSync';
import { soundEffects } from './soundEffects';
import { useGameStore } from '../shared/useGameStore';

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
  spinDuration: number; // 9.5s for realistic suspense

  // Live Multiplayer Synchronized Engine
  isLiveMode: boolean;
  liveRoundId: number;
  livePhase: 'betting' | 'spinning' | 'settled';
  liveTimeRemaining: number;
  livePhaseProgress: number;
  activePlayersCount: number;
  roomBets: RoomPlayerBet[];
  numberBetCounts: Record<number, number>;
  leastChosenNumbers: number[];
  syncOffsetMs: number;

  // Audio & Settings
  isSoundMuted: boolean;
  statsOpen: boolean;
  settingsOpen: boolean;

  // Gamification & University Probability Lab
  predictMode: boolean;
  userPrediction: number; // estimated probability 0-100
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
  syncLiveTick: (nowMs?: number) => void;
  setLiveMode: (live: boolean) => void;
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

function persistBalance(bal: number) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_BALANCE, String(bal));
    localStorage.setItem('probability_playground_balance', String(bal));
    localStorage.setItem('playin_user_coins', String(bal));
    localStorage.setItem('playin_coins', String(bal));
    window.dispatchEvent(new Event('playin_auth_changed'));
  }
}

function getInitialBalance(): number {
  if (typeof window !== 'undefined') {
    const userCoins =
      localStorage.getItem('playin_user_coins') ||
      localStorage.getItem('playin_coins');
    if (userCoins && !isNaN(Number(userCoins))) {
      return Number(userCoins);
    }
    const saved =
      localStorage.getItem('probability_playground_balance') ||
      localStorage.getItem(STORAGE_KEY_BALANCE);
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
  const initialLive = getLiveRoundState(Date.now(), []);

  return {
    balance: getInitialBalance(),
    selectedChip: 100,
    bets: {},
    betHistoryStack: [],
    lastRoundBets: {},

    spinState: initialLive.phase === 'spinning' ? 'spinning' : initialLive.phase === 'settled' ? 'settled' : 'idle',
    winningNumber: initialLive.phase !== 'betting' ? initialLive.winningNumber : null,
    spinResult: null,
    recentNumbers: getInitialRecentNumbers(),
    wheelType: 'european',
    fastSpin: false,

    targetWinningPocketIndex: initialLive.winningPocketIndex,
    spinStartTime: Date.now() - (initialLive.elapsedInPhase * 1000),
    spinDuration: 9.5,

    // Live Synchronized Defaults
    isLiveMode: true,
    liveRoundId: initialLive.roundId,
    livePhase: initialLive.phase,
    liveTimeRemaining: initialLive.timeRemaining,
    livePhaseProgress: initialLive.phaseProgress,
    activePlayersCount: initialLive.activePlayersCount,
    roomBets: initialLive.roomBets,
    numberBetCounts: initialLive.numberBetCounts,
    leastChosenNumbers: initialLive.leastChosenNumbers,
    syncOffsetMs: 0,

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
      const { balance, selectedChip, bets, betHistoryStack, spinState, isLiveMode, livePhase } = get();

      // In Live Mode: betting board is strictly locked after 5 seconds!
      if (isLiveMode && livePhase !== 'betting') {
        soundEffects.triggerHaptic([25, 25]);
        return false;
      }

      if (spinState === 'spinning') return false;
      if (balance < selectedChip) {
        soundEffects.triggerHaptic([30, 30]);
        return false;
      }

      soundEffects.playChipSound();

      // If previous round was settled, start new round cleanly
      const baseBets = spinState === 'settled' ? {} : bets;
      const baseStack = spinState === 'settled' ? [] : betHistoryStack;

      const existingBet = baseBets[id];
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
      persistBalance(newBalance);

      set({
        spinState: 'idle',
        winningNumber: null,
        spinResult: null,
        balance: newBalance,
        bets: { ...baseBets, [id]: newBet },
        betHistoryStack: [...baseStack, { betId: id, chipValue: selectedChip }],
      });

      return true;
    },

    undoBet: () => {
      const { bets, betHistoryStack, balance, spinState, isLiveMode, livePhase } = get();
      if (isLiveMode && livePhase !== 'betting') return;
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

      persistBalance(newBalance);

      set({
        balance: newBalance,
        bets: updatedBets,
        betHistoryStack: betHistoryStack.slice(0, -1),
      });
    },

    clearAllBets: () => {
      const { bets, balance, spinState, isLiveMode, livePhase } = get();
      if (isLiveMode && livePhase !== 'betting') return;
      if (spinState === 'spinning') return;

      if (spinState === 'settled') {
        set({
          spinState: 'idle',
          winningNumber: null,
          spinResult: null,
          bets: {},
          betHistoryStack: [],
        });
        return;
      }

      const totalBetAmount = Object.values(bets).reduce((acc, b) => acc + b.amount, 0);
      if (totalBetAmount === 0) return;

      soundEffects.playClearSound();

      const newBalance = balance + totalBetAmount;
      persistBalance(newBalance);

      set({
        balance: newBalance,
        bets: {},
        betHistoryStack: [],
      });
    },

    repeatBets: () => {
      const { lastRoundBets, balance, spinState, isLiveMode, livePhase } = get();
      if (isLiveMode && livePhase !== 'betting') return;
      if (spinState === 'spinning') return;

      const totalNeeded = Object.values(lastRoundBets).reduce((acc, b) => acc + b.amount, 0);
      if (totalNeeded === 0 || balance < totalNeeded) {
        soundEffects.triggerHaptic([30, 30]);
        return;
      }

      soundEffects.playChipSound();

      const newBalance = balance - totalNeeded;
      persistBalance(newBalance);

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
        spinState: 'idle',
        winningNumber: null,
        spinResult: null,
        balance: newBalance,
        bets: { ...lastRoundBets },
        betHistoryStack: newStack,
      });
    },

    syncLiveTick: (nowMs: number = Date.now()) => {
      const {
        isLiveMode,
        livePhase: currentPhase,
        liveRoundId: currentRoundId,
        bets,
        balance,
        recentNumbers,
        spinCount,
        syncOffsetMs,
      } = get();

      if (!isLiveMode) return;

      const adjustedNow = nowMs + syncOffsetMs;
      const activeBetsList = Object.values(bets);
      const liveState = getLiveRoundState(adjustedNow, activeBetsList);

      // 1. Check for Round rollover
      if (liveState.roundId !== currentRoundId) {
        const lastBets = Object.keys(bets).length > 0 ? { ...bets } : get().lastRoundBets;
        set({
          liveRoundId: liveState.roundId,
          livePhase: liveState.phase,
          liveTimeRemaining: liveState.timeRemaining,
          livePhaseProgress: liveState.phaseProgress,
          activePlayersCount: liveState.activePlayersCount,
          roomBets: liveState.roomBets,
          numberBetCounts: liveState.numberBetCounts,
          leastChosenNumbers: liveState.leastChosenNumbers,
          bets: {},
          betHistoryStack: [],
          lastRoundBets: lastBets,
          winningNumber: null,
          spinResult: null,
          spinState: 'idle',
        });
        return;
      }

      // 2. Check for Phase transition within current round
      if (liveState.phase !== currentPhase) {
        if (liveState.phase === 'spinning') {
          // Transition: Betting (5s) -> Spinning (9.5s)
          // Table locks automatically!
          const targetNum = liveState.winningNumber;
          const pocketIndex = liveState.winningPocketIndex;
          soundEffects.startBallSpinLoop(9.5);

          set({
            livePhase: 'spinning',
            spinState: 'spinning',
            liveTimeRemaining: liveState.timeRemaining,
            livePhaseProgress: liveState.phaseProgress,
            winningNumber: targetNum,
            targetWinningPocketIndex: pocketIndex,
            spinStartTime: adjustedNow - (liveState.elapsedInPhase * 1000),
            spinDuration: 9.5,
            lastRoundBets: { ...bets },
            roomBets: liveState.roomBets,
            numberBetCounts: liveState.numberBetCounts,
            leastChosenNumbers: liveState.leastChosenNumbers,
          });

          // Post bets to live backend asynchronously
          if (activeBetsList.length > 0 && typeof window !== 'undefined') {
            const userId = localStorage.getItem('playin_user_id') || 'local_vip';
            fetch('/api/casino/roulette/live', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roundId: liveState.roundId,
                userId,
                playerName: userId,
                bets: activeBetsList.map((b) => ({
                  numbers: b.numbers,
                  amount: b.amount,
                  label: b.label,
                })),
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data?.newBalance !== undefined) {
                  persistBalance(data.newBalance);
                  useGameStore.getState().resetBalance(data.newBalance);
                  set({ balance: data.newBalance });
                }
              })
              .catch(() => {});
          }
          return;
        } else if (liveState.phase === 'settled') {
          // Transition: Spinning -> Settled
          const winningNum = liveState.winningNumber;
          const settlement = evaluateSpin(winningNum, activeBetsList);
          const newBal = balance + settlement.totalPayout;
          const updatedRecent = [winningNum, ...recentNumbers.slice(0, 19)];

          persistBalance(newBal);
          useGameStore.getState().resetBalance(newBal);

          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updatedRecent));
            const userId = localStorage.getItem('playin_user_id') || 'local_vip';

            // Settle with server API to persist real coins in database/store!
            fetch('/api/casino/roulette/settle', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roundId: liveState.roundId,
                userId,
                playerName: userId,
                winningNumber: winningNum,
                payout: settlement.totalPayout,
                won: settlement.totalPayout > 0,
                details: {
                  totalWager: settlement.totalWager,
                  winningBets: settlement.winningBets.map((wb) => ({
                    label: wb.label,
                    amount: wb.wager,
                    payout: wb.payout,
                  })),
                },
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data?.newBalance !== undefined) {
                  persistBalance(data.newBalance);
                  useGameStore.getState().resetBalance(data.newBalance);
                  set({ balance: data.newBalance });
                }
              })
              .catch(() => {});
          }

          if (settlement.totalPayout > 0) {
            soundEffects.playWinFanfare();
          } else {
            soundEffects.playBallBounceSound(0.8);
          }

          set({
            livePhase: 'settled',
            spinState: 'settled',
            liveTimeRemaining: liveState.timeRemaining,
            livePhaseProgress: liveState.phaseProgress,
            balance: newBal,
            spinResult: settlement,
            recentNumbers: updatedRecent,
            spinCount: spinCount + 1,
            roomBets: liveState.roomBets,
            lastRoundBets: { ...bets },
            bets: {},
            betHistoryStack: [],
          });
          return;
        } else if (liveState.phase === 'betting') {
          // Transition: Settled -> Betting (New 5s betting window!)
          set({
            livePhase: 'betting',
            spinState: 'idle',
            liveTimeRemaining: liveState.timeRemaining,
            livePhaseProgress: liveState.phaseProgress,
            bets: {},
            betHistoryStack: [],
            winningNumber: null,
            spinResult: null,
            roomBets: liveState.roomBets,
            numberBetCounts: liveState.numberBetCounts,
            leastChosenNumbers: liveState.leastChosenNumbers,
          });
          return;
        }
      }

      // Continuous tick update within current phase
      set({
        liveTimeRemaining: liveState.timeRemaining,
        livePhaseProgress: liveState.phaseProgress,
        activePlayersCount: liveState.activePlayersCount,
        roomBets: liveState.roomBets,
        numberBetCounts: liveState.numberBetCounts,
        leastChosenNumbers: liveState.leastChosenNumbers,
      });
    },

    setLiveMode: (live: boolean) => set({ isLiveMode: live }),

    spin: async () => {
      // In live mode, spinning is driven synchronously by the live clock!
      const { isLiveMode } = get();
      if (isLiveMode) return null;

      // Manual fallback
      const { bets, spinState, wheelType } = get();
      if (spinState === 'spinning') return null;
      const activeBetsList = Object.values(bets);
      if (activeBetsList.length === 0) return null;

      const outcome = computeLeastChosenWinningNumber(Date.now(), activeBetsList);
      const winningNumber = outcome.winningNumber;
      const pocketIndex = EUROPEAN_NUMBERS.indexOf(winningNumber);

      soundEffects.startBallSpinLoop(9.5);

      set({
        spinState: 'spinning',
        winningNumber,
        targetWinningPocketIndex: pocketIndex >= 0 ? pocketIndex : 0,
        spinStartTime: Date.now(),
        spinDuration: 9.5,
        lastRoundBets: { ...bets },
        spinResult: null,
      });

      return winningNumber;
    },

    onSpinComplete: () => {
      const { winningNumber, bets, balance, recentNumbers, spinCount, spinState } = get();
      if (spinState !== 'spinning' || winningNumber === null) return;

      const activeBetsList = Object.values(bets);
      const result = evaluateSpin(winningNumber, activeBetsList);

      const newBalance = balance + result.totalPayout;
      const updatedRecent = [winningNumber, ...recentNumbers.slice(0, 19)];

      persistBalance(newBalance);
      if (typeof window !== 'undefined') {
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
        lastRoundBets: { ...bets },
        bets: {},
        betHistoryStack: [],
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
      persistBalance(newBal);
      set({ balance: newBal });
    },

    resetBalance: (amount: number = 2500) => {
      persistBalance(amount);
      set({ balance: amount, bets: {}, betHistoryStack: [] });
    },
  };
});
