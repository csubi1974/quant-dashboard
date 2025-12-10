import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { useMarketStore } from '../stores/marketStore';
import { marketApi } from '../services/api';

interface MarketStatusProps {
  gexData: any[];
  metrics: any;
}

interface MarketStatus {
  isMarketOpen: boolean;
  statusMessage: string;
  isWeekend: boolean;
}

const MarketStatus: React.FC<MarketStatusProps> = ({ gexData, metrics }) => {
  const { symbol } = useMarketStore();
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchMarketStatus = async () => {
      try {
        const status = await marketApi.getMarketStatus();
        setMarketStatus({
          isMarketOpen: status.isMarketOpen,
          statusMessage: status.statusMessage,
          isWeekend: status.isWeekend
        });
      } catch (error) {
        console.error('Error fetching market status:', error);
        // Fallback a detección local
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isAfterHours = hour < 9 || hour >= 16;
        
        setMarketStatus({
          isMarketOpen: !isWeekend && !isAfterHours,
          statusMessage: isWeekend ? 'Fin de semana' : isAfterHours ? 'Fuera de horario' : 'En horario de mercado',
          isWeekend
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketStatus();
    const interval = setInterval(fetchMarketStatus, 60000); // Actualizar cada minuto
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return null; // No mostrar nada mientras carga
  }

  if (marketStatus?.isMarketOpen) {
    return null; // No mostrar nada si el mercado está abierto
  }

  return (
    <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-2">
        <Info className="h-5 w-5 text-yellow-400" />
        <div>
          <h3 className="text-yellow-200 font-medium">Mercado Cerrado - {symbol}</h3>
          <p className="text-yellow-300 text-sm mt-1">
            {marketStatus?.statusMessage || 'El mercado está cerrado actualmente. Mostrando datos limitados.'}
          </p>
          {metrics && (
            <p className="text-yellow-300 text-xs mt-2">
              Último precio: ${metrics.spot?.toFixed(2)} | Cambio: {metrics.change_percentage?.toFixed(2)}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketStatus;