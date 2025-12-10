import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GEXData } from '../types/market';
import { useMarketStore } from '../stores/marketStore';

interface DominantStrikesChartProps {
  data: GEXData[];
  height?: number;
}

const DominantStrikesChart: React.FC<DominantStrikesChartProps> = ({ data, height = 200 }) => {
  const { symbol } = useMarketStore();
  // Obtener los strikes dominantes (mayor GEX absoluto)
  const dominantStrikes = data && data.length > 0
    ? data.sort((a, b) => Math.abs(b.total_gex) - Math.abs(a.total_gex)).slice(0, 10).sort((a, b) => a.strike - b.strike)
    : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{`Strike: ${label}`}</p>
          <p className="text-blue-400 text-sm">
            GEX Total: {data.total_gex.toLocaleString()}
          </p>
          <p className="text-green-400 text-xs">
            CALL GEX: {data.call_gex.toLocaleString()}
          </p>
          <p className="text-red-400 text-xs">
            PUT GEX: {data.put_gex.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-semibold">Strikes Dominantes GEX - {symbol}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Modo:</span>
          <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded">
            Acumulado
          </button>
        </div>
      </div>
      
      {dominantStrikes.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <div className="text-center">
            <p className="mb-2">No hay datos de strikes dominantes</p>
            <p className="text-sm text-gray-500">Los datos de opciones no están disponibles</p>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={dominantStrikes} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="strike" 
                stroke="#9CA3AF"
                fontSize={10}
                tickLine={false}
                tickFormatter={(value) => value.toString()}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => (value / 1000).toFixed(0) + 'K'}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Bar 
                dataKey="total_gex" 
                fill="#3B82F6" 
                radius={[2, 2, 0, 0]}
                name="GEX Total"
              />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 text-xs text-gray-400">
            <p>Último strike influyente {symbol}: {dominantStrikes[dominantStrikes.length - 1]?.strike || 'N/A'}</p>
            <p>Punto de Gravedad (PG) {symbol}: {dominantStrikes[0]?.strike || 'N/A'}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default DominantStrikesChart;