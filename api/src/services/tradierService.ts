import axios from 'axios';
import { MarketQuote, OptionsChain, GEXCalculation, MarketMetrics } from '../types/tradier';

export class TradierService {
  private baseURL = 'https://api.tradier.com/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  async getMarketQuote(symbol: string): Promise<MarketQuote> {
    try {
      const response = await axios.get(`${this.baseURL}/markets/quotes`, {
        headers: this.getHeaders(),
        params: { symbols: symbol }
      });
      
      // Manejar diferentes formatos de respuesta
      const quoteData = response.data.quotes.quote;
      if (Array.isArray(quoteData)) {
        return quoteData[0];
      }
      return quoteData;
    } catch (error) {
      console.error('Error fetching market quote:', error);
      throw error;
    }
  }

  async getOptionsChain(symbol: string, expiration?: string): Promise<OptionsChain> {
    try {
      const params: any = { symbol, greeks: true };
      
      const response = await axios.get(`${this.baseURL}/markets/options/chains`, {
        headers: this.getHeaders(),
        params
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching options chain:', error.message);
      
      // Si el mercado está cerrado o no hay datos de opciones, devolver estructura vacía
      if (error.response?.status === 404 || error.response?.status === 400) {
        return {
          symbol: '',
          status: 'error',
          underlying: {
            symbol: symbol,
            last: 0,
            change: 0,
            delta: 0
          },
          options: {
            option: []
          }
        };
      }
      
      throw error;
    }
  }

  async getMarketHistory(symbol: string, interval = '1min', start?: string, end?: string) {
    try {
      const params: any = { symbol, interval };
      if (start) params.start = start;
      if (end) params.end = end;

      const response = await axios.get(`${this.baseURL}/markets/history`, {
        headers: this.getHeaders(),
        params
      });
      
      return response.data.history.day;
    } catch (error) {
      console.error('Error fetching market history:', error);
      throw error;
    }
  }

  calculateGEX(optionsChain: OptionsChain): GEXCalculation[] {
    // Si no hay opciones disponibles (mercado cerrado), devolver datos vacíos
    if (!optionsChain?.options?.option || optionsChain.options.option.length === 0) {
      return [];
    }

    const strikes = new Map<number, {
      call_gex: number;
      put_gex: number;
      call_oi: number;
      put_oi: number;
      call_volume: number;
      put_volume: number;
      call_iv: number;
      put_iv: number;
      call_count: number;
      put_count: number;
    }>();

    optionsChain.options.option.forEach(option => {
      const strike = option.strike;
      const gamma = option.greeks?.gamma || 0;
      const openInterest = option.openinterest || 0;
      const volume = option.volume || 0;
      const iv = option.greeks?.mid_iv || option.greeks?.bid_iv || option.greeks?.ask_iv || 0.25;
      
      if (!strikes.has(strike)) {
        strikes.set(strike, {
          call_gex: 0,
          put_gex: 0,
          call_oi: 0,
          put_oi: 0,
          call_volume: 0,
          put_volume: 0,
          call_iv: 0,
          put_iv: 0,
          call_count: 0,
          put_count: 0
        });
      }

      const strikeData = strikes.get(strike)!;
      const gex = gamma * openInterest * 100; // Multiplicar por tamaño del contrato

      if (option.option_type === 'call') {
        strikeData.call_gex += gex;
        strikeData.call_oi += openInterest;
        strikeData.call_volume += volume;
        strikeData.call_iv += iv;
        strikeData.call_count += 1;
      } else {
        strikeData.put_gex += gex;
        strikeData.put_oi += openInterest;
        strikeData.put_volume += volume;
        strikeData.put_iv += iv;
        strikeData.put_count += 1;
      }
    });

    return Array.from(strikes.entries()).map(([strike, data]) => {
      const avg_call_iv = data.call_count > 0 ? data.call_iv / data.call_count : 0;
      const avg_put_iv = data.put_count > 0 ? data.put_iv / data.put_count : 0;
      const avg_iv = (avg_call_iv + avg_put_iv) / 2;
      
      return {
        strike,
        call_gex: data.call_gex,
        put_gex: data.put_gex,
        total_gex: data.call_gex + data.put_gex,
        call_oi: data.call_oi,
        put_oi: data.put_oi,
        call_volume: data.call_volume,
        put_volume: data.put_volume,
        call_iv: avg_call_iv,
        put_iv: avg_put_iv,
        avg_iv: avg_iv || 0.25
      };
    }).sort((a, b) => a.strike - b.strike);
  }

  // Calcular volatilidad implícita ponderada por volumen
  private calculateWeightedIV(gexData: GEXCalculation[]): number {
    let totalVolume = 0;
    let weightedIV = 0;
    
    gexData.forEach(strike => {
      const volume = strike.call_volume + strike.put_volume;
      const avgIV = strike.avg_iv || 0.25;
      
      if (volume > 0 && avgIV > 0) {
        weightedIV += avgIV * volume;
        totalVolume += volume;
      }
    });
    
    return totalVolume > 0 ? weightedIV / totalVolume : 0.25; // 25% por defecto
  }

  // Calcular movimiento esperado usando volatilidad implícita
  private calculateExpectedMove(spotPrice: number, daysToExpiry: number, gexData: GEXCalculation[]): number {
    if (gexData.length === 0) {
      // Fallback profesional: usar volatilidad de mercado promedio
      const marketVolatility = 0.25; // 25% anual típico
      const timeFactor = Math.sqrt(daysToExpiry / 365);
      return spotPrice * marketVolatility * timeFactor / spotPrice; // Retornar como porcentaje
    }
    
    // Obtener volatilidad implícita ponderada por volumen
    const weightedIV = this.calculateWeightedIV(gexData);
    
    // Calcular días hasta expiración más cercana (asumir 7 días por defecto)
    const timeToExpiry = daysToExpiry || 7;
    const timeFactor = Math.sqrt(timeToExpiry / 365);
    
    // Movimiento esperado en dólares
    const expectedMoveDollars = spotPrice * weightedIV * timeFactor;
    
    // Convertir a porcentaje del precio spot
    return expectedMoveDollars / spotPrice;
  }

  calculateMarketMetrics(symbol: string, quote: MarketQuote, gexData: GEXCalculation[]): MarketMetrics {
    // Manejar caso cuando no hay datos GEX (mercado cerrado)
    const totalGEX = gexData.length > 0 ? gexData.reduce((sum, strike) => sum + strike.total_gex, 0) : 0;
    
    const spot = quote.last;
    
    // Calcular PG (Punto de Gravedad) como promedio ponderado por Open Interest total
    let pgPoint = spot;
    if (gexData.length > 0) {
      const totalOI = gexData.reduce((sum, strike) => sum + strike.call_oi + strike.put_oi, 0);
      if (totalOI > 0) {
        pgPoint = gexData.reduce((sum, strike) => {
          const weight = (strike.call_oi + strike.put_oi) / totalOI;
          return sum + (strike.strike * weight);
        }, 0);
      }
    }
    
    const distPgS = spot - pgPoint;
    const distPgN = (distPgS / spot) * 100;
    
    // Calcular movimiento esperado usando volatilidad implícita
    const expectedMove = this.calculateExpectedMove(spot, 7, gexData);
    
    // Determinar tendencia
    let trend: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
    if (quote.change > 0) trend = 'UP';
    else if (quote.change < 0) trend = 'DOWN';
    
    // Calcular score basado en múltiples factores
    const gexScore = gexData.length > 0 ? 
      Math.sign(totalGEX) * Math.min(Math.abs(totalGEX) / 1000000, 1) : 0;
    const priceScore = quote.change_percentage / 5; // Normalizar
    const pgScore = -Math.sign(distPgS) * Math.min(Math.abs(distPgN) / 2, 1);
    
    const score = (gexScore * 0.4 + priceScore * 0.4 + pgScore * 0.2) / 3;

    return {
      spot,
      dist_pg_s: distPgS,
      dist_pg_n: distPgN,
      expected_move: Math.round(expectedMove * 1000) / 1000, // Redondear a 3 decimales
      trend,
      score: Math.round(score * 1000) / 1000, // Redondear a 3 decimales
      timestamp: new Date().toISOString()
    };
  }

  async getMarketMetrics(symbol: string): Promise<MarketMetrics> {
    const quote = await this.getMarketQuote(symbol);
    const optionsChain = await this.getOptionsChain(symbol);
    const gexData = this.calculateGEX(optionsChain);
    
    return this.calculateMarketMetrics(symbol, quote, gexData);
  }
}