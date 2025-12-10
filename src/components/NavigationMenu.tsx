import React from 'react';
import { BarChart3, Lightbulb, Settings } from 'lucide-react';

interface NavigationMenuProps {
  currentView: 'dashboard' | 'ideas';
  onViewChange: (view: 'dashboard' | 'ideas') => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => onViewChange('dashboard')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentView === 'dashboard'
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:text-white hover:bg-gray-700'
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        <span>Dashboard</span>
      </button>
      
      <button
        onClick={() => onViewChange('ideas')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentView === 'ideas'
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:text-white hover:bg-gray-700'
        }`}
      >
        <Lightbulb className="w-4 h-4" />
        <span>Ideas</span>
      </button>
    </div>
  );
};

export default NavigationMenu;