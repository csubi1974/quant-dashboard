import express from 'express';
import { 
  getMarketQuote, 
  getOptionsChain, 
  getMarketMetrics, 
  getGEXAnalysis, 
  getIntradayHistory,
  getMarketStatus
} from '../controllers/marketController.js';

const router = express.Router();

// Rutas de mercado
router.get('/status', getMarketStatus);
router.get('/quote/:symbol', getMarketQuote);
router.get('/options/:symbol', getOptionsChain);
router.get('/metrics/:symbol', getMarketMetrics);
router.get('/gex/:symbol', getGEXAnalysis);
router.get('/history/:symbol', getIntradayHistory);

export default router;