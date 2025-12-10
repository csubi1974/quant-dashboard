import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { 
  getMarketQuote, 
  getOptionsChain, 
  getMarketMetrics, 
  getGEXAnalysis,
  getIntradayHistory 
} from './controllers/marketController';
import { testRealData, getSymbolData } from './controllers/testController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rutas API
app.get('/api/market/quote/:symbol', getMarketQuote);
app.get('/api/market/options/:symbol', getOptionsChain);
app.get('/api/market/metrics/:symbol', getMarketMetrics);
app.get('/api/market/gex/:symbol', getGEXAnalysis);
app.get('/api/market/history/:symbol', getIntradayHistory);

// Rutas de prueba para datos reales
app.get('/api/test/real-data', testRealData);
app.get('/api/test/symbol/:symbol', getSymbolData);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Key configured: ${process.env.TRADIER_API_KEY ? 'Yes' : 'No'}`);
});