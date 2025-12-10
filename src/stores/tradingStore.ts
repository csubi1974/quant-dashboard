import { create } from 'zustand';

export interface TradingMetrics {
  profitable: number;
  totalTrades: number;
  winRate: number;
  otm: number;
  itm: number;
  ntm: number;
}

interface TradingStore {
  // Estado
  metrics: TradingMetrics;
  
  // Acciones
  setMetrics: (metrics: TradingMetrics) => void;
  updateMetrics: (updates: Partial<TradingMetrics>) => void;
  resetMetrics: () => void;
}

const initialMetrics: TradingMetrics = {
  profitable: 0,
  totalTrades: 0,
  winRate: 0,
  otm: 0,
  itm: 0,
  ntm: 0
};

export const useTradingStore = create<TradingStore>((set) => ({
  // Estado inicial
  metrics: initialMetrics,

  // Acciones
  setMetrics: (metrics) => set({ metrics }),
  
  updateMetrics: (updates) => set((state) => ({
    metrics: { ...state.metrics, ...updates }
  })),
  
  resetMetrics: () => set({ metrics: initialMetrics })
}));