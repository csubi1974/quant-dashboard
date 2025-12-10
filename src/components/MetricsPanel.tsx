import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { MarketMetrics } from '../types/market';

interface MetricsPanelProps {
  metrics: MarketMetrics | null;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-8 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'UP': return 'text-green-500';
      case 'DOWN': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getValueColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-300';
  };

  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  const metricsData = [
    {
      label: 'Spot',
      value: `$${formatNumber(metrics.spot, 2)}`,
      icon: DollarSign,
      color: metrics.spot > 0 ? 'text-green-500' : 'text-red-500'
    },
    {
      label: 'Dist. PG S',
      value: formatNumber(metrics.dist_pg_s, 2),
      icon: Activity,
      color: getValueColor(metrics.dist_pg_s)
    },
    {
      label: 'Dist. PG N',
      value: `${formatNumber(metrics.dist_pg_n, 2)}%`,
      icon: Activity,
      color: getValueColor(metrics.dist_pg_n)
    },
    {
      label: 'Mov. Esperado',
      value: formatNumber(metrics.expected_move, 2),
      icon: Activity,
      color: 'text-gray-300'
    },
    {
      label: 'Tendencia',
      value: metrics.trend,
      icon: metrics.trend === 'UP' ? TrendingUp : TrendingDown,
      color: getTrendColor(metrics.trend)
    },
    {
      label: 'Score',
      value: formatNumber(metrics.score, 4),
      icon: Activity,
      color: getValueColor(metrics.score)
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {metricsData.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">{metric.label}</span>
              <Icon className={`w-4 h-4 ${metric.color}`} />
            </div>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsPanel;