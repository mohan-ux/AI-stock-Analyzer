
import React, { useState, useEffect, useCallback } from 'react';
import { StockSelector } from './components/StockSelector';
import { StockChart } from './components/StockChart';
import { CompanyInfoCard } from './components/CompanyInfoCard';
import { ComparisonView } from './components/ComparisonView';
import { RecommendationCard } from './components/RecommendationCard';
import { EventImpactAnalyzer } from './components/EventImpactAnalyzer';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { useStockData, StockDetails } from './hooks/useStockData';
import { ChartBarIcon, DocumentTextIcon, LightBulbIcon, ScaleIcon, SparklesIcon, PresentationChartLineIcon, AdjustmentsHorizontalIcon, InformationCircleIcon } from './assets/icons';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { Watchlist, AlertsManager, PortfolioTracker } from './components/UserDashboardWidgets';
import { Company, UserAlert, PortfolioItem, ChartTimeRange } from './types';
import { AVAILABLE_STOCKS } from './constants';


enum Tab {
  Analysis = "Analysis",
  Comparison = "Comparison",
  EventImpact = "Event Impact",
  Recommendations = "AI Suggestions",
  Dashboard = "My Dashboard"
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Analysis);
  
  const [selectedSymbol1, setSelectedSymbol1] = useState<string | null>(AVAILABLE_STOCKS[0].symbol);
  const [selectedSymbol2, setSelectedSymbol2] = useState<string | null>(null);

  const { stock: stock1Data, isLoading: isLoading1, error: error1, fetchStockDetails: fetchStock1, currentTimeRange: currentTimeRange1, setTimeRange: setTimeRange1 } = useStockData(selectedSymbol1);
  const { stock: stock2Data, isLoading: isLoading2, error: error2, fetchStockDetails: fetchStock2, currentTimeRange: currentTimeRange2, setTimeRange: setTimeRange2 } = useStockData(selectedSymbol2);

  // User Dashboard State
  const [watchlist, setWatchlist] = useState<Company[]>([]);
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('stockAnalyzerWatchlist');
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
    const savedAlerts = localStorage.getItem('stockAnalyzerAlerts');
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
    const savedPortfolio = localStorage.getItem('stockAnalyzerPortfolio');
    if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
  }, []);

  // Save to localStorage on change
  useEffect(() => { localStorage.setItem('stockAnalyzerWatchlist', JSON.stringify(watchlist)); }, [watchlist]);
  useEffect(() => { localStorage.setItem('stockAnalyzerAlerts', JSON.stringify(alerts)); }, [alerts]);
  useEffect(() => { localStorage.setItem('stockAnalyzerPortfolio', JSON.stringify(portfolio)); }, [portfolio]);


  const handleStockSelect1 = (symbol: string | null) => {
    setSelectedSymbol1(symbol);
    if (symbol) fetchStock1(symbol);
  };

  const handleStockSelect2 = (symbol: string | null) => {
    setSelectedSymbol2(symbol);
    if (symbol) fetchStock2(symbol);
  };
  
  const handleSelectRecommendation = (symbol: string) => {
    // If in comparison mode, set to second stock, otherwise first
    if (activeTab === Tab.Comparison || selectedSymbol1) {
        handleStockSelect2(symbol);
        if (activeTab !== Tab.Comparison) setActiveTab(Tab.Comparison); // Switch to comparison view
    } else {
        handleStockSelect1(symbol);
    }
  }

  // Dashboard actions
  const addToWatchlist = (symbol: string) => {
    const stockToAdd = AVAILABLE_STOCKS.find(s => s.symbol === symbol);
    if (stockToAdd && !watchlist.find(s => s.symbol === symbol)) {
      setWatchlist(prev => [...prev, stockToAdd]);
    }
  };
  const removeFromWatchlist = (symbol: string) => setWatchlist(prev => prev.filter(s => s.symbol !== symbol));
  
  const addAlert = (alert: Omit<UserAlert, 'id'|'isActive'>) => setAlerts(prev => [...prev, { ...alert, id: Date.now().toString(), isActive: true }]);
  const removeAlert = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));
  const toggleAlert = (id: string) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));

  const addPortfolioItem = (item: Omit<PortfolioItem, 'purchaseDate'>) => setPortfolio(prev => [...prev, { ...item, purchaseDate: new Date().toISOString() }]);
  const removePortfolioItem = (symbol: string) => setPortfolio(prev => prev.filter(p => p.stockSymbol !== symbol));


  const renderTabContent = () => {
    switch (activeTab) {
      case Tab.Analysis:
        return (
          <div className="space-y-6">
            <StockSelector selectedSymbol={selectedSymbol1} onStockSelect={handleStockSelect1} label="Select Stock for Analysis" />
            {isLoading1 && <LoadingSpinner message={`Loading ${selectedSymbol1} data...`} />}
            {error1 && <Card><p className="text-red-400">Error loading stock 1: {error1}</p></Card>}
            {stock1Data && (
              <>
                <StockChart data={stock1Data.historicalData} symbol={stock1Data.symbol} timeRange={currentTimeRange1} setTimeRange={setTimeRange1} color="#3b82f6" />
                <CompanyInfoCard stock={stock1Data} />
              </>
            )}
             {!selectedSymbol1 && <Card><p className="text-neutral-400 flex items-center"><InformationCircleIcon className="w-5 h-5 mr-2"/>Select a stock to begin analysis.</p></Card>}
          </div>
        );
      case Tab.Comparison:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <StockSelector selectedSymbol={selectedSymbol1} onStockSelect={handleStockSelect1} idSuffix="1" label="Select First Stock"/>
              <StockSelector selectedSymbol={selectedSymbol2} onStockSelect={handleStockSelect2} idSuffix="2" label="Select Second Stock"/>
            </div>
            {(isLoading1 || isLoading2) && <LoadingSpinner message="Loading comparison data..." />}
            {error1 && <Card><p className="text-red-400">Error loading stock 1: {error1}</p></Card>}
            {error2 && <Card><p className="text-red-400">Error loading stock 2: {error2}</p></Card>}
            {stock1Data && stock2Data ? (
              <ComparisonView 
                stock1={stock1Data} 
                stock2={stock2Data} 
                setTimeRange1={setTimeRange1}
                setTimeRange2={setTimeRange2}
                currentTimeRange1={currentTimeRange1}
                currentTimeRange2={currentTimeRange2}
              />
            ) : (
              <Card><p className="text-neutral-400 flex items-center"><InformationCircleIcon className="w-5 h-5 mr-2"/>Please select two stocks to compare.</p></Card>
            )}
          </div>
        );
      case Tab.EventImpact:
        return <EventImpactAnalyzer selectedStockSymbol={selectedSymbol1}/>;
      case Tab.Recommendations:
         return (
            <div className="space-y-6">
                {!selectedSymbol1 && !selectedSymbol2 && <StockSelector selectedSymbol={selectedSymbol1} onStockSelect={handleStockSelect1} label="Select a base stock for AI recommendations" />}
                {(selectedSymbol1 || selectedSymbol2) && <p className="text-sm text-neutral-300">Recommendations based on: {stock1Data?.name || stock2Data?.name || 'selected stock'}</p> }
                <RecommendationCard selectedStock={stock1Data || stock2Data} onSelectRecommendation={handleSelectRecommendation} />
                {!stock1Data && !stock2Data && <Card><p className="text-neutral-400 flex items-center"><InformationCircleIcon className="w-5 h-5 mr-2"/>Select a stock in the 'Analysis' or 'Comparison' tab to see recommendations.</p></Card>}
            </div>
        );
      case Tab.Dashboard:
        return (
            <div className="space-y-6">
                <Watchlist watchedStocks={watchlist} onRemoveFromWatchlist={removeFromWatchlist} onAddToWatchlist={addToWatchlist} onSelectStock={(s) => {handleStockSelect1(s); setActiveTab(Tab.Analysis);}} />
                <AlertsManager alerts={alerts} onAddAlert={addAlert} onRemoveAlert={removeAlert} onToggleAlert={toggleAlert} />
                <PortfolioTracker portfolio={portfolio} stocksInfo={AVAILABLE_STOCKS} onAddItem={addPortfolioItem} onRemoveItem={removePortfolioItem} />
            </div>
        );
      default:
        return null;
    }
  };
  
  const TABS_CONFIG = [
    { name: Tab.Analysis, icon: <ChartBarIcon className="w-5 h-5 mr-2" /> },
    { name: Tab.Comparison, icon: <ScaleIcon className="w-5 h-5 mr-2" /> },
    { name: Tab.EventImpact, icon: <PresentationChartLineIcon className="w-5 h-5 mr-2" /> },
    { name: Tab.Recommendations, icon: <LightBulbIcon className="w-5 h-5 mr-2" /> },
    { name: Tab.Dashboard, icon: <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" /> }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-4 md:p-8">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center text-primary-400">
             <SparklesIcon className="w-10 h-10 mr-3"/>
             <h1 className="text-4xl font-bold">AI Stock Analyzer Pro</h1>
        </div>
        <p className="text-neutral-400 mt-2">Informed decisions with AI-powered market insights.</p>
      </header>

      <nav className="mb-8">
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 border-b border-neutral-700 pb-4">
          {TABS_CONFIG.map(tabInfo => (
            <Button
              key={tabInfo.name}
              variant={activeTab === tabInfo.name ? 'primary' : 'outline'}
              onClick={() => setActiveTab(tabInfo.name)}
              className="flex-grow md:flex-grow-0"
            >
              {tabInfo.icon}
              {tabInfo.name}
            </Button>
          ))}
        </div>
      </nav>

      <main className="container mx-auto max-w-7xl">
        {renderTabContent()}
      </main>
      
      <footer className="mt-12 text-center text-sm text-neutral-500">
        <p>&copy; {new Date().getFullYear()} AI Stock Analyzer Pro. For informational purposes only. Not financial advice.</p>
        <p>Powered by Advanced AI Models</p>
      </footer>
    </div>
  );
};

export default App;