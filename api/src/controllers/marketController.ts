import { Request, Response } from 'express';
import { TradierService } from '../services/tradierService';

const TRADIER_API_KEY = process.env.TRADIER_API_KEY || 'coGsj0jBfyTpftB7EOcZhydoaJtM';
const tradierService = new TradierService(TRADIER_API_KEY);

export const getMarketQuote = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const quote = await tradierService.getMarketQuote(symbol);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching market quote' });
  }
};

export const getOptionsChain = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { expiration } = req.query;
    
    const optionsChain = await tradierService.getOptionsChain(
      symbol, 
      expiration as string
    );
    
    const gexData = tradierService.calculateGEX(optionsChain);
    
    res.json({
      ...optionsChain,
      gex_analysis: gexData
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching options chain' });
  }
};

export const getMarketMetrics = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    // Primero obtener quote real
    const quote = await tradierService.getMarketQuote(symbol);
    
    // Si no hay options chain disponible, usar datos calculados con el quote real
    try {
      const optionsChain = await tradierService.getOptionsChain(symbol);
      const gexData = tradierService.calculateGEX(optionsChain);
      const metrics = tradierService.calculateMarketMetrics(symbol, quote, gexData);
      res.json(metrics);
    } catch (optionsError) {
      console.log('Options chain not available, using quote-only metrics');
      // Usar solo datos del quote con valores predeterminados
      const mockGexData = [{
        strike: quote.last,
        call_gex: 0,
        put_gex: 0,
        total_gex: 0,
        call_oi: 0,
        put_oi: 0,
        call_volume: 0,
        put_volume: 0
      }];
      
      const metrics = tradierService.calculateMarketMetrics(symbol, quote, mockGexData);
      res.json(metrics);
    }
    
  } catch (error) {
    console.error('Error in getMarketMetrics:', error);
    res.status(500).json({ error: 'Error calculating market metrics' });
  }
};

export const getGEXAnalysis = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const optionsChain = await tradierService.getOptionsChain(symbol);
    const gexData = tradierService.calculateGEX(optionsChain);
    
    // Calcular PG (Punto de Gravedad) como promedio ponderado por Open Interest total
    const quote = await tradierService.getMarketQuote(symbol);
    const spot = quote.last;
    
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
    
    // Calcular volatilidad implícita ponderada
    let weightedIV = 0.25; // Valor por defecto
    let totalVolume = 0;
    let weightedIVSum = 0;
    
    if (gexData.length > 0) {
      gexData.forEach(strike => {
        const volume = strike.call_volume + strike.put_volume;
        const avgIV = strike.avg_iv || 0.25;
        
        if (volume > 0 && avgIV > 0) {
          weightedIVSum += avgIV * volume;
          totalVolume += volume;
        }
      });
      
      if (totalVolume > 0) {
        weightedIV = weightedIVSum / totalVolume;
      }
    }
    
    // Calcular movimiento esperado profesional
    const daysToExpiry = 7; // Asumir 7 días por defecto
    const timeFactor = Math.sqrt(daysToExpiry / 365);
    const expectedMoveDollars = spot * weightedIV * timeFactor;
    const expectedMovePercent = expectedMoveDollars / spot;
    
    // Encontrar strike con máximo GEX
    const maxGEXStrike = gexData.length > 0 ? 
      gexData.reduce((max, strike) => strike.total_gex > max.total_gex ? strike : max, gexData[0]) : 
      null;
    
    res.json({
      symbol,
      gex_data: gexData,
      total_gex: gexData.reduce((sum, strike) => sum + strike.total_gex, 0),
      max_gex_strike: maxGEXStrike,
      pg_point: pgPoint,
      pg_distance_s: distPgS,
      pg_distance_n: distPgN,
      spot_price: spot,
      weighted_iv: Math.round(weightedIV * 1000) / 1000,
      expected_move_dollars: Math.round(expectedMoveDollars * 100) / 100,
      expected_move_percent: Math.round(expectedMovePercent * 1000) / 1000,
      days_to_expiry: daysToExpiry
    });
  } catch (error) {
    res.status(500).json({ error: 'Error calculating GEX analysis' });
  }
};

export const getMarketStatus = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Verificar si es fin de semana
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Horario del mercado: 9:30 AM - 4:00 PM ET (13:30 - 20:00 UTC)
    const marketOpenHour = 13; // 1 PM UTC = 9 AM ET
    const marketOpenMinute = 30;
    const marketCloseHour = 20; // 8 PM UTC = 4 PM ET
    const marketCloseMinute = 0;
    
    let isMarketOpen = false;
    let statusMessage = '';
    
    if (isWeekend) {
      statusMessage = 'El mercado está cerrado - Fin de semana';
    } else {
      const currentTimeInMinutes = hour * 60 + minute;
      const marketOpenTimeInMinutes = marketOpenHour * 60 + marketOpenMinute;
      const marketCloseTimeInMinutes = marketCloseHour * 60 + marketCloseMinute;
      
      if (currentTimeInMinutes >= marketOpenTimeInMinutes && currentTimeInMinutes < marketCloseTimeInMinutes) {
        isMarketOpen = true;
        statusMessage = 'El mercado está abierto';
      } else if (currentTimeInMinutes < marketOpenTimeInMinutes) {
        statusMessage = 'El mercado está cerrado - Aún no ha abierto';
      } else {
        statusMessage = 'El mercado está cerrado - Ya ha cerrado';
      }
    }
    
    res.json({
      isMarketOpen,
      statusMessage,
      isWeekend,
      currentTime: now.toISOString(),
      marketHours: {
        open: `${marketOpenHour.toString().padStart(2, '0')}:${marketOpenMinute.toString().padStart(2, '0')} UTC`,
        close: `${marketCloseHour.toString().padStart(2, '0')}:${marketCloseMinute.toString().padStart(2, '0')} UTC`
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching market status' });
  }
};

export const getIntradayHistory = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { interval = '1min', hours = '6' } = req.query;
    
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - parseInt(hours as string) * 60 * 60 * 1000);
    
    try {
      const history = await tradierService.getMarketHistory(
        symbol,
        interval as string,
        startTime.toISOString(),
        endTime.toISOString()
      );
      
      // Si hay datos históricos, devolverlos
      if (history && history.length > 0) {
        res.json(history);
      } else {
        // Si no hay datos históricos (mercado cerrado), crear datos sintéticos con el precio actual
        const quote = await tradierService.getMarketQuote(symbol);
        const currentPrice = quote.last || quote.close || 0;
        
        // Crear datos históricos sintéticos basados en el precio actual
        const syntheticHistory = [];
        const points = parseInt(hours as string) * 60; // Minutos en el rango
        
        for (let i = 0; i < Math.min(points, 60); i++) { // Máximo 60 puntos
          const time = new Date(endTime.getTime() - (points - i) * 60000);
          const variation = (Math.random() - 0.5) * 20; // Variación aleatoria de ±$10
          const price = currentPrice + variation;
          
          syntheticHistory.push({
            timestamp: time.toISOString(),
            open: price - Math.random() * 2,
            high: price + Math.random() * 3,
            low: price - Math.random() * 3,
            close: price,
            volume: Math.floor(Math.random() * 1000000) + 100000
          });
        }
        
        res.json(syntheticHistory);
      }
    } catch (historyError) {
      console.error('Error fetching market history:', historyError);
      // Si hay error al obtener historial, crear datos básicos con el precio actual
      const quote = await tradierService.getMarketQuote(symbol);
      const currentPrice = quote.last || quote.close || 0;
      
      const fallbackHistory = [{
        timestamp: endTime.toISOString(),
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice,
        volume: 0
      }];
      
      res.json(fallbackHistory);
    }
  } catch (error) {
    console.error('Error in getIntradayHistory:', error);
    res.status(500).json({ error: 'Error fetching intraday history' });
  }
};