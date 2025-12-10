import React, { useState } from 'react';
import { RefreshCw, Calendar, TrendingUp } from 'lucide-react';
import { useMarketStore } from '../stores/marketStore';
import NavigationMenu from './NavigationMenu';

interface HeaderProps {
  onRefresh?: () => void;
  isLoading?: boolean;
  currentView: 'dashboard' | 'ideas';
  onViewChange: (view: 'dashboard' | 'ideas') => void;
}

const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading, currentView, onViewChange }) => {
  const { symbol, selectedDate, setSymbol, setSelectedDate, fetchAllData } = useMarketStore();

  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol);
    fetchAllData();
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchAllData();
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      fetchAllData();
    }
  };

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-6 mb-6">
      <div className="max-w-7xl mx-auto">
        {/* Título principal */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Seguimiento Intradía - {symbol}
          </h1>
          <p className="text-gray-400 text-sm max-w-3xl mx-auto">
            Visualiza en tiempo real la evolución de GEX, Open Interest, Volumen y otras señales derivadas de la cadena de opciones para detectar posibles tendencias durante la jornada. Uso exclusivo con fines analíticos o educativos. Los datos en tiempo real sólo están disponibles a partir de las 9:35 am (hora de Nueva York).
          </p>
        </div>

        {/* Navegación entre vistas */}
        <div className="flex justify-center mb-6">
          <NavigationMenu currentView={currentView} onViewChange={onViewChange} />
        </div>

        {/* Controles */}
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Selector de Símbolo */}
          <div className="flex items-center space-x-2">
            <label className="text-white text-sm font-medium">Símbolo:</label>
            <select
              value={symbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SPX">SPX</option>
              <option value="XSP">XSP</option>
              <option value="SPY">SPY</option>
              <option value="QQQ">QQQ</option>
              <option value="IWM">IWM</option>
            </select>
          </div>

          {/* Selector de Fecha */}
          <div className="flex items-center space-x-2">
            <label className="text-white text-sm font-medium">Fecha:</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="bg-gray-800 border border-gray-600 rounded pl-10 pr-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botón de Actualizar */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Generar Informe (Beta)</span>
          </button>
        </div>

        {/* Estado de conexión */}
        <div className="flex justify-center mt-4">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Conectado a Tradier API (Producción)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;