import React from 'react';
import { DollarSign, Target, TrendingUp, AlertCircle, Clock, BarChart3 } from 'lucide-react';
import { useTradingStore } from '../stores/tradingStore';

const MetricCards: React.FC = () => {
  const { metrics } = useTradingStore();

  const cards = [
    {
      label: 'Profitables',
      value: metrics.profitable,
      icon: DollarSign,
      iconColor: 'bg-green-600',
      iconBgColor: 'bg-green-600'
    },
    {
      label: 'Total Trades',
      value: metrics.totalTrades,
      icon: Target,
      iconColor: 'bg-blue-600',
      iconBgColor: 'bg-blue-600'
    },
    {
      label: 'Win Rate',
      value: `${metrics.winRate}%`,
      icon: TrendingUp,
      iconColor: 'bg-blue-600',
      iconBgColor: 'bg-blue-600'
    },
    {
      label: 'OTM',
      value: metrics.otm,
      icon: AlertCircle,
      iconColor: 'bg-green-600',
      iconBgColor: 'bg-green-600'
    },
    {
      label: 'ITM',
      value: metrics.itm,
      icon: AlertCircle,
      iconColor: 'bg-orange-600',
      iconBgColor: 'bg-orange-600'
    },
    {
      label: 'NTM',
      value: metrics.ntm,
      icon: Clock,
      iconColor: 'bg-yellow-600',
      iconBgColor: 'bg-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-medium">{card.label}</p>
                <p className="text-white text-lg font-bold">{card.value}</p>
              </div>
              <div className={`w-8 h-8 ${card.iconBgColor} rounded-full flex items-center justify-center`}>
                <IconComponent className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricCards;