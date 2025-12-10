import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, TrendingUp, TrendingDown, DollarSign, Target, AlertCircle } from 'lucide-react';
import { useMarketStore } from '../stores/marketStore';
import { useTradingStore } from '../stores/tradingStore';
import { marketApi } from '../services/api';
import MetricCards from './MetricCards';

interface TradingIdea {
  id: string;
  timestamp: string;
  side: 'CALL' | 'PUT';
  strategy: 'Put Credit Spread' | 'Call Debit Spread';
  strikes: string;
  shortStrike: number;
  longStrike: number;
  credit: number;
  delta: number;
  pcsDistance: number;
  pdsDistance: number;
  status: 'OTM' | 'ITM';
  pnl: number;
  trendScore: number;
  expiration: string;
}



const TradingIdeas: React.FC = () => {
  const { symbol, metrics } = useMarketStore();
  const { metrics: tradingMetrics, setMetrics } = useTradingStore();
  const [ideas, setIdeas] = useState<TradingIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [trendConfidence, setTrendConfidence] = useState<'waiting' | 'low' | 'defined'>('waiting');
  const [marketOpenTime, setMarketOpenTime] = useState<Date | null>(null);

  // Generar ideas basadas en datos reales del mercado
  const generateIdeas = async () => {
    setIsLoading(true);
    
    try {
      // Obtener datos del mercado
      const marketMetrics = await marketApi.getMarketMetrics(symbol);
      
      // Determinar confianza de la tendencia
      const trendScore = marketMetrics.score;
      const absScore = Math.abs(trendScore);
      
      // Verificar si es hora de mercado (9:30 AM - 4:00 PM ET)
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      const marketOpenMinute = currentHour * 60 + currentMinute;
      const marketOpenStart = 9 * 60 + 30; // 9:30 AM
      const marketOpenEnd = 16 * 60; // 4:00 PM
      const market10AM = 10 * 60; // 10:00 AM
      
      // Calcular minutos desde apertura
      const minutesSinceOpen = marketOpenMinute - marketOpenStart;
      
      // Determinar confianza de tendencia
      if (marketOpenMinute < market10AM) {
        // Antes de las 10:00 AM - esperar claridad
        setTrendConfidence('waiting');
        setIsLoading(false);
        return; // No generar ideas hasta las 10:00 AM
      } else if (absScore < 0.2) {
        // Después de las 10:00 AM pero tendencia débil
        setTrendConfidence('low');
        setIsLoading(false);
        return; // Esperar tendencia más definida
      } else {
        // Después de las 10:00 AM con tendencia definida
        setTrendConfidence('defined');
      }
      
      // Intentar obtener datos reales de opciones
      let optionsData = null;
      try {
        // Por ahora usaremos datos simulados ya que getOptionsChain no está disponible
        console.log('Intentando obtener datos de opciones reales...');
        // Simular que no hay datos disponibles hasta que implementemos la función
        throw new Error('Función getOptionsChain no implementada aún');
      } catch (optionsError) {
        console.log('Usando datos simulados para opciones');
        optionsData = null;
      }
      
      const isBullish = trendScore > 0.2; // Aumentado umbral para mayor confianza
      const isBearish = trendScore < -0.2;
      
      // Generar ideas según tendencia
      const newIdeas: TradingIdea[] = [];
      const expiration = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 día
      
      if (optionsData) {
        // **MERCADO ABIERTO**: Usar datos reales de opciones
        const targetDelta = 0.3;
        const deltaTolerance = 0.05;
        
        // Filtrar opciones con delta ~30
        const suitableOptions = optionsData.filter(option => {
          const optionDelta = Math.abs(option.delta || 0);
          return Math.abs(optionDelta - targetDelta) <= deltaTolerance;
        });
        
        // Generar ideas basadas en opciones reales
        for (let i = 0; i < Math.min(24, suitableOptions.length); i++) {
          const option = suitableOptions[i];
          const time = new Date(currentTime.getTime() - (24 - i) * 5 * 60 * 1000);
          const timeStr = time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          if (isBullish && option.option_type === 'put') {
            // Put Credit Spread con datos reales
            const shortStrike = option.strike;
            const longStrike = shortStrike - 5; // Spread de $5
            const credit = option.bid || option.last || 1.5;
            const delta = Math.abs(option.delta || 0.3);
            
            newIdeas.push({
              id: `real-put-${i}`,
              timestamp: timeStr,
              side: 'PUT',
              strategy: 'Put Credit Spread',
              strikes: `${longStrike}/${shortStrike}`,
              shortStrike,
              longStrike,
              credit,
              delta,
              pcsDistance: 1.5,
              pdsDistance: 0.3,
              status: 'OTM',
              pnl: credit * 0.8, // Simulado pero basado en crédito real
              trendScore: trendScore,
              expiration: option.expiration_date || expiration
            });
          } else if (isBearish && option.option_type === 'call') {
            // Call Debit Spread con datos reales
            const longStrike = option.strike;
            const shortStrike = longStrike + 5; // Spread de $5
            const debit = option.ask || option.last || 1.0;
            const delta = Math.abs(option.delta || 0.3);
            
            newIdeas.push({
              id: `real-call-${i}`,
              timestamp: timeStr,
              side: 'CALL',
              strategy: 'Call Debit Spread',
              strikes: `${longStrike}/${shortStrike}`,
              shortStrike,
              longStrike,
              credit: debit,
              delta,
              pcsDistance: 1.2,
              pdsDistance: 0.25,
              status: 'OTM',
              pnl: -debit * 0.5, // Simulado pero basado en débito real
              trendScore: trendScore,
              expiration: option.expiration_date || expiration
            });
          }
        }
      }
      
      // **MERCADO CERRADO**: Generar datos simulados si no hay datos reales
      if (newIdeas.length === 0) {
        // Generar ideas cada 5 minutos durante las últimas 2 horas
        for (let i = 0; i < 24; i++) {
          const time = new Date(currentTime.getTime() - (24 - i) * 5 * 60 * 1000);
          const timeStr = time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          if (isBullish) {
            // Put Credit Spreads para tendencia alcista
            const shortStrike = Math.round(marketMetrics.spot * 0.98 - Math.random() * 20);
            const longStrike = shortStrike - 5;
            const credit = Math.round((Math.random() * 200 + 150) * 10) / 10;
            const delta = 0.3 + Math.random() * 0.1;
            const pcsDistance = Math.round((Math.random() * 2 + 1) * 100) / 100;
            const pdsDistance = Math.round((Math.random() * 0.5 + 0.1) * 100) / 100;
            const status = Math.random() > 0.2 ? 'OTM' : 'ITM'; // CALL: ITM = profitable, OTM = losing // PUT: OTM = profitable, ITM = losing
            const pnl = status === 'OTM' ? Math.round(credit * (Math.random() * 0.5 + 0.5)) : -Math.round(credit * (Math.random() * 3 + 2));
            
            newIdeas.push({
              id: `put-credit-${i}`,
              timestamp: timeStr,
              side: 'PUT',
              strategy: 'Put Credit Spread',
              strikes: `${longStrike}/${shortStrike}`,
              shortStrike,
              longStrike,
              credit,
              delta,
              pcsDistance,
              pdsDistance,
              status,
              pnl,
              trendScore: trendScore,
              expiration
            });
          } else if (isBearish) {
            // Call Debit Spreads para tendencia bajista
            const longStrike = Math.round(marketMetrics.spot * 1.02 + Math.random() * 20);
            const shortStrike = longStrike + 5;
            const debit = Math.round((Math.random() * 150 + 100) * 10) / 10;
            const delta = 0.3 + Math.random() * 0.1;
            const pcsDistance = Math.round((Math.random() * 2 + 1) * 100) / 100;
            const pdsDistance = Math.round((Math.random() * 0.5 + 0.1) * 100) / 100;
            const status = Math.random() > 0.2 ? 'OTM' : 'ITM';
            const pnl = status === 'ITM' ? Math.round(debit * (Math.random() * 2 + 1)) : -Math.round(debit * (Math.random() * 0.8 + 0.2));
            
            newIdeas.push({
              id: `call-debit-${i}`,
              timestamp: timeStr,
              side: 'CALL',
              strategy: 'Call Debit Spread',
              strikes: `${longStrike}/${shortStrike}`,
              shortStrike,
              longStrike,
              credit: debit,
              delta,
              pcsDistance,
              pdsDistance,
              status,
              pnl,
              trendScore: trendScore,
              expiration
            });
          } else {
            // Mercado neutral - ambas estrategias
            if (Math.random() > 0.5) {
              // Put Credit Spread
              const shortStrike = Math.round(marketMetrics.spot * 0.98 - Math.random() * 20);
              const longStrike = shortStrike - 5;
              const credit = Math.round((Math.random() * 200 + 150) * 10) / 10;
              const delta = 0.3 + Math.random() * 0.1;
              const pcsDistance = Math.round((Math.random() * 2 + 1) * 100) / 100;
              const pdsDistance = Math.round((Math.random() * 0.5 + 0.1) * 100) / 100;
              const status = Math.random() > 0.2 ? 'OTM' : 'ITM'; // CALL: ITM = profitable, OTM = losing // PUT: OTM = profitable, ITM = losing
              const pnl = status === 'OTM' ? Math.round(credit * (Math.random() * 0.5 + 0.5)) : -Math.round(credit * (Math.random() * 3 + 2));
              
              newIdeas.push({
                id: `put-credit-${i}`,
                timestamp: timeStr,
                side: 'PUT',
                strategy: 'Put Credit Spread',
                strikes: `${longStrike}/${shortStrike}`,
                shortStrike,
                longStrike,
                credit,
                delta,
                pcsDistance,
                pdsDistance,
                status,
                pnl,
                trendScore: trendScore,
                expiration
              });
            } else {
              // Call Debit Spread
              const longStrike = Math.round(marketMetrics.spot * 1.02 + Math.random() * 20);
              const shortStrike = longStrike + 5;
              const debit = Math.round((Math.random() * 150 + 100) * 10) / 10;
              const delta = 0.3 + Math.random() * 0.1;
              const pcsDistance = Math.round((Math.random() * 2 + 1) * 100) / 100;
              const pdsDistance = Math.round((Math.random() * 0.5 + 0.1) * 100) / 100;
              const status = Math.random() > 0.2 ? 'OTM' : 'ITM';
              const pnl = status === 'ITM' ? Math.round(debit * (Math.random() * 2 + 1)) : -Math.round(debit * (Math.random() * 0.8 + 0.2));
              
              newIdeas.push({
                id: `call-debit-${i}`,
                timestamp: timeStr,
                side: 'CALL',
                strategy: 'Call Debit Spread',
                strikes: `${longStrike}/${shortStrike}`,
                shortStrike,
                longStrike,
                credit: debit,
                delta,
                pcsDistance,
                pdsDistance,
                status,
                pnl,
                trendScore: trendScore,
                expiration
              });
            }
          }
        }
      }
      
      setIdeas(newIdeas);
      setLastUpdate(new Date());
      
      // Actualizar métricas basadas en las ideas generadas
      const profitable = newIdeas.filter(idea => idea.pnl > 0).length;
      const otm = newIdeas.filter(idea => idea.status === 'OTM').length;
      const itm = newIdeas.filter(idea => idea.status === 'ITM').length;
      const totalTrades = newIdeas.length;
      const winRate = totalTrades > 0 ? Math.round((profitable / totalTrades) * 100 * 10) / 10 : 0;
      
      // Calcular NTM (Near The Money) - strikes que están cerca del precio spot actual
      const currentSpot = metrics?.spot || 0;
      const ntm = newIdeas.filter(idea => {
        const shortStrikeDistance = Math.abs(idea.shortStrike - currentSpot) / currentSpot * 100;
        return shortStrikeDistance <= 2; // Dentro del 2% del precio spot
      }).length;
      
      setMetrics({
        profitable,
        totalTrades,
        winRate,
        otm,
        itm,
        ntm
      });
      
    } catch (error) {
      console.error('Error generating ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateIdeas();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(generateIdeas, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [symbol, metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OTM': return 'text-green-500';
      case 'ITM': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getPnlColor = (pnl: number) => {
    return pnl >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getTrendColor = (trendScore: number) => {
    if (trendScore > 0.1) return 'text-green-500';
    if (trendScore < -0.1) return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <div className="space-y-6">
      {/* Métricas principales - Componente separado */}
      <MetricCards />

      {/* Encabezado de la tabla */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Generador de Ideas Intradía</h2>
            <p className="text-gray-400 text-sm">
              Ideas de estrategias verticales basadas en estimación de tendencia con delta ~30
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Actualizado: {lastUpdate ? lastUpdate.toLocaleTimeString('es-ES') : 'Nunca'}</span>
            </div>
            
            <button
              onClick={generateIdeas}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Mostrar Ideas</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center space-x-4 mb-6 text-sm text-gray-300">
          <span>Símbolo: <span className="text-white font-medium">{symbol}</span></span>
          <span>•</span>
          <span>Tendencia: <span className={getTrendColor(metrics?.score || 0)}>
            {metrics?.score > 0.1 ? 'Alcista' : metrics?.score < -0.1 ? 'Bajista' : 'Neutral'}
          </span></span>
          <span>•</span>
          <span>Score: <span className="text-white font-medium">{(metrics?.score || 0).toFixed(3)}</span></span>
          <span>•</span>
          <span className={`text-xs ${
            trendConfidence === 'defined' ? 'text-green-500' : 
            trendConfidence === 'low' ? 'text-orange-500' : 'text-yellow-500'
          }`}>
            {trendConfidence === 'defined' ? '✅ Tendencia Definida' : 
             trendConfidence === 'low' ? '⚠️ Tendencia Débil' : '⏳ Esperando 10:00 AM'}
          </span>
          <span>•</span>
          <span className="text-yellow-500 text-xs">
            {ideas.length > 0 && ideas[0]?.id?.includes('real-') ? 'Datos Reales' : 'Datos Simulados'}
          </span>
        </div>

        {/* Mensaje de espera por tendencia */}
        {trendConfidence === 'waiting' && (
          <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-yellow-200 font-medium">Mercado Cerrado - Esperando Apertura</h3>
                <p className="text-yellow-300 text-sm">
                  El mercado está cerrado. Las ideas comenzarán a generarse a las 10:00 AM (30 minutos después de la apertura) para tener mayor claridad de la tendencia.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de tendencia débil */}
        {trendConfidence === 'low' && (
          <div className="bg-orange-900 border border-orange-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-orange-200 font-medium">Tendencia Débil</h3>
                <p className="text-orange-300 text-sm">
                  La tendencia aún no está definida (score entre -0.2 y 0.2). Esperando señal más clara.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de ideas */}
        {trendConfidence === 'defined' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Hora</th>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Lado</th>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Strikes</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Crédito/Débito</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Delta</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Dist %</th>
                  <th className="text-center text-gray-400 font-medium py-3 px-4">Estado</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">PnL</th>
                </tr>
              </thead>
              <tbody>
                {ideas.map((idea, index) => (
                  <tr key={idea.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-3 px-4 text-gray-300 font-mono text-xs">
                      <span className="text-blue-400 cursor-pointer hover:underline">
                        {idea.timestamp}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      <span className={idea.side === 'CALL' ? 'text-green-400' : 'text-red-400'}>
                        {idea.side}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-mono text-xs">
                      {idea.strikes}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-right font-mono text-xs">
                      ${idea.credit.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-right font-mono text-xs">
                      {idea.delta.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-right font-mono text-xs">
                      {idea.pcsDistance.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs font-medium ${getStatusColor(idea.status)}`}>
                        {idea.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs">
                      <span className={getPnlColor(idea.pnl)}>
                        ${idea.pnl.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {trendConfidence === 'defined' && ideas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay ideas generadas. Haz clic en "Mostrar Ideas" para generar estrategias.
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingIdeas;