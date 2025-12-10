import React, { useEffect, useState } from 'react';
import { useMarketStore } from '../stores/marketStore';
import Header from '../components/Header';
import MarketStatus from '../components/MarketStatus';
import MetricsPanel from '../components/MetricsPanel';
import MainChart from '../components/MainChart';
import GEXChart from '../components/GEXChart';
import ScoreChart from '../components/ScoreChart';
import DominantStrikesChart from '../components/DominantStrikesChart';
import TrendsPanel from '../components/TrendsPanel';
import HistoricalTable from '../components/HistoricalTable';
import TradingIdeas from '../components/TradingIdeas';

const Home: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'ideas'>('dashboard');
  const {
    symbol,
    metrics,
    gexData,
    intradayData,
    chartData,
    isLoading,
    fetchAllData
  } = useMarketStore();

  useEffect(() => {
    fetchAllData();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAllData]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        onRefresh={fetchAllData} 
        isLoading={isLoading} 
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'dashboard' ? (
          <>
            {/* Estado del mercado */}
            <MarketStatus gexData={gexData} metrics={metrics} />
            
            {/* Métricas principales */}
            <MetricsPanel metrics={metrics} />

            {/* Gráficos principales - Primera fila */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="lg:col-span-2">
                <MainChart data={chartData} height={400} />
              </div>
            </div>

            {/* Segunda fila de gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <GEXChart data={gexData} height={350} />
              <ScoreChart data={chartData} height={350} />
            </div>

            {/* Tercera fila */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <DominantStrikesChart data={gexData} height={300} />
              <TrendsPanel symbol={symbol} />
            </div>

            {/* Tabla histórica */}
            <div className="mb-6">
              <HistoricalTable data={intradayData} />
            </div>
          </>
        ) : (
          <TradingIdeas />
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-8">
          <p>Dashboard de análisis intradía - Tradier API Integration</p>
          <p className="text-xs mt-1">Datos con fines educativos y analíticos. No constituye asesoramiento financiero.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;