import { create } from 'zustand';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_spin',
    title: 'Roulette Pioneer',
    description: 'Placed your first bet on the 3D European Wheel',
    icon: '🎡',
  },
  {
    id: 'first_deal',
    title: 'Andar Bahar Initiate',
    description: 'Played your first round of Live Andar Bahar Classic',
    icon: '🃏',
  },
  {
    id: 'big_win',
    title: 'High Roller Strike',
    description: 'Won over 500 coins in a single round',
    icon: '💰',
  },
  {
    id: 'probability_scholar',
    title: 'Probability Scholar',
    description: 'Predicted win probabilities within 5% error margin',
    icon: '🎓',
  },
  {
    id: 'simulation_master',
    title: 'Monte Carlo Maestro',
    description: 'Ran a 10,000+ spin computer simulation',
    icon: '💻',
  },
];

export interface SharedGameState {
  balance: number;
  selectedChip: number;
  xp: number;
  level: number;
  achievements: Record<string, string>; // id -> unlocked date
  accountModalOpen: boolean;
  requestCoinsModalOpen: boolean;

  // Actions
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
  resetBalance: (amount?: number) => void;
  setSelectedChip: (chip: number) => void;
  addXp: (amount: number, reason?: string) => void;
  unlockAchievement: (id: string) => void;
  toggleAccountModal: (open?: boolean) => void;
  toggleRequestCoinsModal: (open?: boolean) => void;
}

const STORAGE_KEY_BALANCE = 'probability_playground_balance';
const STORAGE_KEY_XP = 'probability_playground_xp';
const STORAGE_KEY_ACHIEVEMENTS = 'probability_playground_achievements';

function getInitialBalance(): number {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_BALANCE) || localStorage.getItem('roulette_balance');
    if (saved && !isNaN(Number(saved))) {
      return Number(saved);
    }
  }
  return 2500;
}

function getInitialXp(): number {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_XP) || localStorage.getItem('roulette_player_xp');
    if (saved && !isNaN(Number(saved))) {
      return Number(saved);
    }
  }
  return 0;
}

function getInitialAchievements(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
  }
  return {};
}

export const useGameStore = create<SharedGameState>((set, get) => {
  const initXp = getInitialXp();

  return {
    balance: getInitialBalance(),
    selectedChip: 100,
    xp: initXp,
    level: Math.floor(initXp / 100) + 1,
    achievements: getInitialAchievements(),
    accountModalOpen: false,
    requestCoinsModalOpen: false,

    addBalance: (amount: number) => {
      const newBal = get().balance + amount;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BALANCE, String(newBal));
        localStorage.setItem('roulette_balance', String(newBal));
      }
      set({ balance: newBal });
    },

    deductBalance: (amount: number) => {
      const { balance } = get();
      if (balance < amount) return false;
      const newBal = balance - amount;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BALANCE, String(newBal));
        localStorage.setItem('roulette_balance', String(newBal));
      }
      set({ balance: newBal });
      return true;
    },

    resetBalance: (amount: number = 2500) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BALANCE, String(amount));
        localStorage.setItem('roulette_balance', String(amount));
      }
      set({ balance: amount });
    },

    setSelectedChip: (chip: number) => {
      set({ selectedChip: chip });
    },

    addXp: (amount: number) => {
      const newXp = get().xp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_XP, String(newXp));
        localStorage.setItem('roulette_player_xp', String(newXp));
      }
      set({ xp: newXp, level: newLevel });
    },

    unlockAchievement: (id: string) => {
      const { achievements } = get();
      if (achievements[id]) return;
      const updated = { ...achievements, [id]: new Date().toISOString() };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(updated));
      }
      set({ achievements: updated });
    },

    toggleAccountModal: (open?: boolean) => {
      set((s) => ({ accountModalOpen: open !== undefined ? open : !s.accountModalOpen }));
    },

    toggleRequestCoinsModal: (open?: boolean) => {
      set((s) => ({ requestCoinsModalOpen: open !== undefined ? open : !s.requestCoinsModalOpen }));
    },
  };
});
