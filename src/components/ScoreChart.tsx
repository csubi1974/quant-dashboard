import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChartDataPoint } from '../types/market';

interface ScoreChartProps {
  data: ChartDataPoint[];
  height?: number;
}

const ScoreChart: React.FC<ScoreChartProps> = ({ data, height = 200 }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      let zone = 'Neutral';
      let color = '#EAB308'; // Yellow
      
      if (score > 0.2) {
        zone = 'Alcista';
        color = '#10B981'; // Green
      } else if (score < -0.2) {
        zone = 'Bajista';
        color = '#EF4444'; // Red
      }
      
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-1">{`Hora: ${label}`}</p>
          <p className="text-sm" style={{ color }}>
            Score: {score.toFixed(4)}
          </p>
          <p className="text-xs text-gray-400">Zona: {zone}</p>
        </div>
      );
    }
    return null;
  };

  // Crear gradiente de fondo con bandas de color
  const BackgroundBands = () => (
    <defs>
      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10B981" stopOpacity={0.1} />
        <stop offset="25%" stopColor="#EAB308" stopOpacity={0.1} />
        <stop offset="75%" stopColor="#EAB308" stopOpacity={0.1} />
        <stop offset="100%" stopColor="#EF4444" stopOpacity={0.1} />
      </linearGradient>
    </defs>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-white text-lg font-semibold mb-4">Evolución del Score</h3>
      
      <div className="mb-4 flex items-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-300">Alcista (&gt;0.2)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-300">Neutral (-0.2 a 0.2)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-300">Bajista (&lt;-0.2)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <BackgroundBands />
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            fontSize={10}
            tickLine={false}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            domain={[-0.5, 0.5]}
            tickFormatter={(value) => value.toFixed(2)}
          />
          
          {/* Líneas de referencia para zonas */}
          <ReferenceLine y={0.2} stroke="#10B981" strokeDasharray="2 2" />
          <ReferenceLine y={-0.2} stroke="#EF4444" strokeDasharray="2 2" />
          <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="2 2" />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#FFFFFF" 
            strokeWidth={2}
            dot={false}
            fill="url(#scoreGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <p className="text-gray-500 text-xs mt-2">
        Este gráfico comienza a mostrar resultados a partir de las 10:25 AM (hora local de mercado).
      </p>
    </div>
  );
};

export default ScoreChart;