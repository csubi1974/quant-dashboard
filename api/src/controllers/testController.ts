import { Request, Response } from 'express';
import axios from 'axios';
import { TradierService } from '../services/tradierService';

const TRADIER_API_KEY = process.env.TRADIER_API_KEY || 'UeZpmeGNuZSu78TeCfQkGce9UbTq';
const tradierService = new TradierService(TRADIER_API_KEY);

// Endpoint de prueba para verificar conexión con datos reales
export const testRealData = async (req: Request, res: Response) => {
  try {
    console.log('Testing real data connection...');
    
    // Probar con SPY que suele tener más datos disponibles
    const symbol = 'SPY';
    
    // Obtener quote real - endpoint más básico
    const quoteResponse = await axios.get(`https://api.tradier.com/v1/markets/quotes`, {
      headers: {
        'Authorization': `Bearer ${TRADIER_API_KEY}`,
        'Accept': 'application/json'
      },
      params: { symbols: symbol }
    });
    
    console.log('Real quote response:', JSON.stringify(quoteResponse.data, null, 2));
    
    res.json({
      success: true,
      message: 'Datos reales obtenidos exitosamente',
      rawQuote: quoteResponse.data,
      apiKey: TRADIER_API_KEY.substring(0, 8) + '...'
    });
    
  } catch (error) {
    console.error('Error testing real data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error obteniendo datos reales',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiKey: TRADIER_API_KEY.substring(0, 8) + '...'
    });
  }
};

// Endpoint para obtener datos de un símbolo específico
export const getSymbolData = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Símbolo requerido' });
    }
    
    console.log(`Fetching real data for symbol: ${symbol}`);
    
    const quote = await tradierService.getMarketQuote(symbol);
    
    res.json({
      symbol,
      quote: quote,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`Error fetching data for ${req.params.symbol}:`, error);
    res.status(500).json({ 
      error: 'Error obteniendo datos del símbolo',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};