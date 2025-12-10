import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { TrendIndicator } from '../types/market';
import { useMarketStore } from '../stores/marketStore';
import { marketApi } from '../services/api';

interface TrendsPanelProps {
  symbol: string;
}

const TrendsPanel: React.FC<TrendsPanelProps> = ({ symbol }) => {
  const { metrics } = useMarketStore();
  const [marketStatus, setMarketStatus] = useState<{ isMarketOpen: boolean; statusMessage: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchMarketStatus = async () => {
      try {
        const status = await marketApi.getMarketStatus();
        setMarketStatus({
          isMarketOpen: status.isMarketOpen,
          statusMessage: status.statusMessage
        });
      } catch (error) {
        console.error('Error fetching market status:', error);
        setMarketStatus({ isMarketOpen: false, statusMessage: 'Estado desconocido' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketStatus();
    const interval = setInterval(fetchMarketStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const trendIndicators: TrendIndicator[] = [
    { name: 'Gravedad', value: metrics?.score || -0.3, range: [-0.5, 0.5], color: 'red' },
    { name: 'OI GEX', value: Math.min(metrics?.expected_move || 0.1, 0.5), range: [-0.5, 0.5], color: 'yellow' },
    { name: 'Delta Neutro', value: Math.max(Math.min(metrics?.dist_pg_n || -0.4, 0.5), -0.5), range: [-0.5, 0.5], color: 'red' },
    { name: 'Tendencia', value: metrics?.trend === 'UP' ? 0.2 : metrics?.trend === 'DOWN' ? -0.2 : 0, range: [-0.5, 0.5], color: 'green' },
  ];

  const getTrendColor = (value: number, range: [number, number]) => {
    const normalizedValue = (value - range[0]) / (range[1] - range[0]);
    if (normalizedValue < 0.3) return 'bg-red-500';
    if (normalizedValue > 0.7) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  const getTrendIcon = (value: number) => {
    if (value < -0.1) return <TrendingDown className="w-4 h-4 text-red-500" />;
    if (value > 0.1) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <Activity className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white text-lg font-semibold">Tendencias</h3>
        <div className={`px-3 py-1 rounded text-sm font-medium ${
          isLoading 
            ? 'bg-gray-600 text-gray-300' 
            : marketStatus?.isMarketOpen 
            ? 'bg-green-900 text-green-300'
            : 'bg-gray-700 text-gray-300'
        }`}>
          {isLoading 
            ? 'CARGANDO...' 
            : marketStatus?.isMarketOpen 
            ? 'MERCADO ABIERTO' 
            : 'MERCADO CERRADO'
          }
        </div>
      </div>

      {/* Tendencias principales */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 text-sm font-medium">{symbol} Tendencia ODTE</span>
            <span className="text-red-500 text-sm font-medium">{metrics?.score?.toFixed(2) || '-0.3'}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
              style={{ width: '100%' }}
            >
              <div 
                className="bg-white w-1 h-2 rounded-full relative"
                style={{ left: `${((metrics?.score || -0.3) + 0.5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 text-sm font-medium">{symbol} Tendencia Corta</span>
            <span className="text-red-500 text-sm font-medium">{metrics?.dist_pg_n?.toFixed(2) || '-0.4'}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
              style={{ width: '100%' }}
            >
              <div 
                className="bg-white w-1 h-2 rounded-full relative"
                style={{ left: `${((metrics?.dist_pg_n || -0.4) + 2) * 25}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores individuales */}
      <div className="space-y-3">
        <h4 className="text-gray-400 text-sm font-medium mb-2">Tendencia Individual</h4>
        {trendIndicators.map((indicator, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
            <div className="flex items-center space-x-3">
              {getTrendIcon(indicator.value)}
              <span className="text-gray-300 text-sm font-medium">{indicator.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-600 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${getTrendColor(indicator.value, indicator.range)}`}
                  style={{ 
                    width: `${((indicator.value - indicator.range[0]) / (indicator.range[1] - indicator.range[0])) * 100}%` 
                  }}
                />
              </div>
              <span className={`text-xs font-medium ${
                indicator.color === 'green' ? 'text-green-400' :
                indicator.color === 'red' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {indicator.value.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-3 bg-gray-700 rounded-lg">
        <div className="flex items-center space-x-2 text-gray-400 text-xs">
          <BarChart3 className="w-4 h-4" />
          <span>Análisis basado en datos de opciones y volumen para {symbol}</span>
        </div>
      </div>
    </div>
  );
};

export default TrendsPanel;