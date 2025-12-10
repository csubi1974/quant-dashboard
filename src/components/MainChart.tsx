import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types/market';
import { useMarketStore } from '../stores/marketStore';

interface MainChartProps {
  data: ChartDataPoint[];
  height?: number;
}

const MainChart: React.FC<MainChartProps> = ({ data, height = 400 }) => {
  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'price':
        return [`$${value.toFixed(2)}`, 'Precio'];
      case 'gex':
        return [value.toLocaleString(), 'GEX'];
      case 'oi':
        return [value.toLocaleString(), 'Open Interest'];
      case 'delta_neutral':
        return [`$${value.toFixed(2)}`, 'Delta Neutro'];
      case 'volume':
        return [value.toLocaleString(), 'Volumen'];
      case 'score':
        return [value.toFixed(4), 'Score'];
      default:
        return [value, name];
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{`Hora: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {formatTooltipValue(entry.value, entry.dataKey)[1]}: {formatTooltipValue(entry.value, entry.dataKey)[0]}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-white text-lg font-semibold mb-4">Principal</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            yAxisId="price"
            orientation="left"
            stroke="#3B82F6"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <YAxis 
            yAxisId="volume"
            orientation="right"
            stroke="#EAB308"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: '#E5E7EB' }}
            iconType="line"
          />
          
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="price" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={false}
            name="Precio"
          />
          <Line 
            yAxisId="volume"
            type="monotone" 
            dataKey="gex" 
            stroke="#FFFFFF" 
            strokeWidth={1}
            dot={false}
            name="GEX Acumulado"
          />
          <Line 
            yAxisId="volume"
            type="monotone" 
            dataKey="oi" 
            stroke="#EAB308" 
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            name="OI"
          />
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="delta_neutral" 
            stroke="#8B5CF6" 
            strokeWidth={1}
            dot={false}
            name="Delta Neutro"
          />
          <Line 
            yAxisId="volume"
            type="monotone" 
            dataKey="volume" 
            stroke="#F59E0B" 
            strokeWidth={1}
            dot={false}
            name="Volumen"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MainChart;