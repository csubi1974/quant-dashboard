import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GEXData } from '../types/market';
import { useMarketStore } from '../stores/marketStore';

interface GEXChartProps {
  data: GEXData[];
  height?: number;
}

const GEXChart: React.FC<GEXChartProps> = ({ data, height = 300 }) => {
  const { symbol } = useMarketStore();
  const [selectedTime, setSelectedTime] = useState('16:00');
  const [showCalls, setShowCalls] = useState(true);
  const [showPuts, setShowPuts] = useState(true);

  // Filtrar datos para mostrar solo strikes principales
  const filteredData = data && data.length > 0 
    ? data.filter(item => Math.abs(item.total_gex) > 100000 || item.strike >= 6800 && item.strike <= 6900).slice(0, 15)
    : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{`Strike: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-semibold">Strikes GEX Put/Call - {symbol}</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-gray-300 text-sm">Horario:</label>
            <div className="flex space-x-2">
              {['16:00', '15:00', '14:00', 'Live'].map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-2 py-1 text-xs rounded ${
                    selectedTime === time
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1 text-gray-300 text-sm">
              <input
                type="checkbox"
                checked={showCalls}
                onChange={(e) => setShowCalls(e.target.checked)}
                className="form-checkbox h-3 w-3 text-green-600"
              />
              <span>CALL</span>
            </label>
            <label className="flex items-center space-x-1 text-gray-300 text-sm">
              <input
                type="checkbox"
                checked={showPuts}
                onChange={(e) => setShowPuts(e.target.checked)}
                className="form-checkbox h-3 w-3 text-red-600"
              />
              <span>PUT</span>
            </label>
          </div>
        </div>
      </div>
      
      {filteredData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <p className="mb-2">No hay datos de GEX disponibles para {symbol}</p>
            <p className="text-sm text-gray-500">El mercado podría estar cerrado o no hay datos de opciones</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            <Legend 
              wrapperStyle={{ color: '#E5E7EB' }}
            />
            
            {showCalls && (
              <Bar 
                dataKey="call_gex" 
                fill="#10B981" 
                name="GEX CALL"
                radius={[2, 2, 0, 0]}
              />
            )}
            {showPuts && (
              <Bar 
                dataKey="put_gex" 
                fill="#EF4444" 
                name="GEX PUT"
                radius={[2, 2, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GEXChart;