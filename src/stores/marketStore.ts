import { create } from 'zustand';
import { MarketMetrics, GEXData, IntradayData, ChartDataPoint } from '../types/market';
import { marketApi } from '../services/api';

interface MarketStore {
  // Estado
  symbol: string;
  selectedDate: string;
  metrics: MarketMetrics | null;
  gexData: GEXData[];
  intradayData: IntradayData[];
  chartData: ChartDataPoint[];
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  setSymbol: (symbol: string) => void;
  setSelectedDate: (date: string) => void;
  fetchMarketData: () => Promise<void>;
  fetchGEXData: () => Promise<void>;
  fetchIntradayData: () => Promise<void>;
  fetchChartData: () => Promise<void>;
  fetchAllData: () => Promise<void>;
}

export const useMarketStore = create<MarketStore>((set, get) => ({
  // Estado inicial
  symbol: 'SPY', // Usar SPY que tiene más datos disponibles
  selectedDate: new Date().toISOString().split('T')[0],
  metrics: null,
  gexData: [],
  intradayData: [],
  chartData: [],
  isLoading: false,
  error: null,

  // Acciones
  setSymbol: (symbol) => set({ symbol }),
  
  setSelectedDate: (date) => set({ selectedDate: date }),

  fetchMarketData: async () => {
    const { symbol } = get();
    set({ isLoading: true, error: null });
    
    try {
      const metrics = await marketApi.getMarketMetrics(symbol);
      set({ metrics, isLoading: false });
    } catch (error) {
      console.error('Error fetching market metrics:', error);
      // Usar datos simulados en caso de error
      const mockData = marketApi.getMockData();
      set({ metrics: mockData.metrics, isLoading: false });
    }
  },

  fetchGEXData: async () => {
    const { symbol } = get();
    set({ isLoading: true, error: null });
    
    try {
      const gexAnalysis = await marketApi.getGEXAnalysis(symbol);
      set({ gexData: gexAnalysis.gex_data, isLoading: false });
    } catch (error) {
      console.error('Error fetching GEX data:', error);
      // Usar datos simulados
      const mockData = marketApi.getMockData();
      set({ gexData: mockData.gexData, isLoading: false });
    }
  },

  fetchIntradayData: async () => {
    const { symbol } = get();
    set({ isLoading: true, error: null });
    
    try {
      const data = await marketApi.getIntradayHistory(symbol);
      set({ intradayData: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching intraday data:', error);
      // Usar datos simulados
      const mockData = marketApi.getMockData();
      set({ intradayData: mockData.history, isLoading: false });
    }
  },

  fetchChartData: async () => {
    const { symbol } = get();
    set({ isLoading: true, error: null });
    
    try {
      const data = await marketApi.getChartData(symbol);
      set({ chartData: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Usar datos simulados
      const mockData = marketApi.getMockData();
      const chartData = mockData.history.map((item, index) => ({
        time: new Date(item.timestamp).toLocaleTimeString(),
        price: item.price,
        gex: mockData.gexData[index % mockData.gexData.length]?.total_gex || 0,
        oi: item.strikes_oi,
        delta_neutral: item.pred_delta_neutral,
        volume: item.strikes_volume,
        score: item.score
      }));
      set({ chartData, isLoading: false });
    }
  },

  fetchAllData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await Promise.all([
        get().fetchMarketData(),
        get().fetchGEXData(),
        get().fetchIntradayData(),
        get().fetchChartData()
      ]);
    } catch (error) {
      set({ error: 'Error fetching data', isLoading: false });
    }
  },
}));