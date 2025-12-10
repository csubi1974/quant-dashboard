import React from 'react';
import { IntradayData } from '../types/market';
import { useMarketStore } from '../stores/marketStore';

interface HistoricalTableProps {
  data: IntradayData[];
}

const HistoricalTable: React.FC<HistoricalTableProps> = ({ data }) => {
  const { symbol } = useMarketStore();
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  const getValueColor = (value: number, type: 'price' | 'prediction' | 'score' = 'price') => {
    if (type === 'score') {
      return value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-gray-300';
    }
    return value >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'UP': return 'text-green-500';
      case 'DOWN': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-white text-lg font-semibold mb-4">Histórico Intradía - {symbol}</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-gray-400 font-medium py-2 px-2">Timestamp</th>
              <th className="text-right text-gray-400 font-medium py-2 px-2">Precio</th>
              <th className="text-right text-gray-400 font-medium py-2 px-2">PG</th>
              <th className="text-right text-gray-400 font-medium py-2 px-2">Strikes OI</th>
              <th className="text-right text-gray-400 font-medium py-2 px-2">Strikes Vol</th>
              <th className="text-right text-gray-400 font-medium py-2 px-2">Strikes GEX</th>
              <th className="text-right text-gray-400 font-medium py-2 px-2">Pred OI GEX</th>
              <th className="text-right text-gray-400 font-medium py-2 px-2">Pred Δ Neutral</th>
              <th className="text-right text-gray-400 font-medium py-2 px-2">Pred Vol</th>
              <th className="text-center text-gray-400 font-medium py-2 px-2">Tendencia</th>
              <th className="text-right text-gray-400 font-medium py-2 px-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 20).map((row, index) => (
              <tr key={index} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                <td className="py-2 px-2 text-gray-300 font-mono text-xs">
                  {formatTime(row.timestamp)}
                </td>
                <td className={`py-2 px-2 text-right font-mono ${getValueColor(row.price)}`}>
                  ${formatNumber(row.price)}
                </td>
                <td className="py-2 px-2 text-right text-gray-300 font-mono text-xs">
                  {formatNumber(row.pg_point)}
                </td>
                <td className="py-2 px-2 text-right text-gray-300 font-mono text-xs">
                  {row.strikes_oi.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-right text-gray-300 font-mono text-xs">
                  {row.strikes_volume.toLocaleString()}
                </td>
                <td className={`py-2 px-2 text-right font-mono text-xs ${getValueColor(row.strikes_gex)}`}>
                  {row.strikes_gex.toLocaleString()}
                </td>
                <td className={`py-2 px-2 text-right font-mono text-xs ${getValueColor(row.pred_oi_gex - row.price, 'prediction')}`}>
                  ${formatNumber(row.pred_oi_gex)}
                </td>
                <td className={`py-2 px-2 text-right font-mono text-xs ${getValueColor(row.pred_delta_neutral - row.price, 'prediction')}`}>
                  ${formatNumber(row.pred_delta_neutral)}
                </td>
                <td className={`py-2 px-2 text-right font-mono text-xs ${getValueColor(row.pred_volume - row.price, 'prediction')}`}>
                  ${formatNumber(row.pred_volume)}
                </td>
                <td className={`py-2 px-2 text-center font-medium ${getTrendColor(row.trend)}`}>
                  {row.trend}
                </td>
                <td className={`py-2 px-2 text-right font-mono text-xs ${getValueColor(row.score, 'score')}`}>
                  {formatNumber(row.score, 4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay datos disponibles
        </div>
      )}
    </div>
  );
};

export default HistoricalTable;