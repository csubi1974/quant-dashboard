import axios from 'axios';
import { MarketMetrics, GEXData, IntradayData, ChartDataPoint } from '../types/market';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const marketApi = {
  // Obtener estado del mercado
  async getMarketStatus(): Promise<{
    isMarketOpen: boolean;
    statusMessage: string;
    isWeekend: boolean;
    currentTime: string;
    marketHours: { open: string; close: string };
  }> {
    const response = await api.get('/market/status');
    return response.data;
  },

  // Obtener métricas principales del mercado
  async getMarketMetrics(symbol: string): Promise<MarketMetrics> {
    const response = await api.get(`/market/metrics/${symbol}`);
    return response.data;
  },

  // Obtener análisis GEX
  async getGEXAnalysis(symbol: string): Promise<{
    gex_data: GEXData[];
    total_gex: number;
    max_gex_strike: GEXData;
  }> {
    const response = await api.get(`/market/gex/${symbol}`);
    return response.data;
  },

  // Obtener datos históricos intradía
  async getIntradayHistory(symbol: string, hours = 6): Promise<IntradayData[]> {
    const response = await api.get(`/market/history/${symbol}`, {
      params: { hours }
    });
    
    // Transformar datos para el frontend
    return response.data.map((item: any) => {
      const price = item.close || item.price || 0;
      return {
        timestamp: item.timestamp || item.time,
        price: price,
        pg_point: item.pg_point || price,
        strikes_oi: item.strikes_oi || 0,
        strikes_volume: item.strikes_volume || item.volume || 0,
        strikes_gex: item.strikes_gex || 0,
        pred_oi_gex: item.pred_oi_gex || price,
        pred_delta_neutral: item.pred_delta_neutral || price,
        pred_volume: item.pred_volume || price,
        trend: item.trend || 'NEUTRAL',
        score: item.score || 0,
      };
    });
  },

  // Obtener datos para gráficos principales
  async getChartData(symbol: string): Promise<ChartDataPoint[]> {
    const [metrics, gexData, history] = await Promise.all([
      this.getMarketMetrics(symbol),
      this.getGEXAnalysis(symbol),
      this.getIntradayHistory(symbol)
    ]);

    // Combinar datos para crear puntos del gráfico
    return history.map((item, index) => ({
      time: new Date(item.timestamp).toLocaleTimeString(),
      price: item.price,
      gex: index < gexData.gex_data.length ? gexData.gex_data[index].total_gex : 0,
      oi: item.strikes_oi,
      delta_neutral: item.pred_delta_neutral,
      volume: item.strikes_volume,
      score: item.score
    }));
  },

  // Datos simulados para desarrollo
  getMockData() {
    const now = new Date();
    const mockHistory: IntradayData[] = [];
    
    for (let i = 0; i < 60; i++) {
      const time = new Date(now.getTime() - (59 - i) * 60000); // Cada minuto
      const basePrice = 6840;
      const price = basePrice + Math.sin(i * 0.1) * 20 + Math.random() * 10 - 5;
      
      mockHistory.push({
        timestamp: time.toISOString(),
        price: Math.round(price * 100) / 100,
        pg_point: Math.round((price + Math.random() * 20 - 10) * 100) / 100,
        strikes_oi: Math.floor(Math.random() * 10000) + 5000,
        strikes_volume: Math.floor(Math.random() * 5000) + 1000,
        strikes_gex: Math.floor(Math.random() * 1000000) - 500000,
        pred_oi_gex: Math.round((price + Math.random() * 15 - 7.5) * 100) / 100,
        pred_delta_neutral: Math.round((price + Math.random() * 25 - 12.5) * 100) / 100,
        pred_volume: Math.round((price + Math.random() * 30 - 15) * 100) / 100,
        trend: i > 30 ? 'DOWN' : 'UP',
        score: Math.round((Math.random() * 0.4 - 0.2) * 1000) / 1000
      });
    }

    const mockMetrics: MarketMetrics = {
      spot: 6840.54,
      dist_pg_s: -8.18,
      dist_pg_n: -0.12,
      expected_move: 0.74,
      trend: 'DOWN',
      score: -0.105,
      timestamp: now.toISOString()
    };

    const mockGEX: GEXData[] = [];
    for (let i = 0; i < 20; i++) {
      const strike = 6800 + i * 10;
      mockGEX.push({
        strike,
        call_gex: Math.floor(Math.random() * 500000),
        put_gex: Math.floor(Math.random() * 500000),
        total_gex: Math.floor(Math.random() * 1000000) - 500000,
        call_oi: Math.floor(Math.random() * 10000),
        put_oi: Math.floor(Math.random() * 10000),
        call_volume: Math.floor(Math.random() * 5000),
        put_volume: Math.floor(Math.random() * 5000)
      });
    }

    return {
      metrics: mockMetrics,
      history: mockHistory,
      gexData: mockGEX
    };
  }
};