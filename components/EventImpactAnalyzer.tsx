
import React, { useState, useEffect } from 'react';
import { MarketEvent, Stock, Company } from '../types';
import { fetchMarketEvents } from '../services/stockService';
import { analyzeEventImpact } from '../services/geminiService';
import { Card } from './ui/Card';
import { PresentationChartLineIcon } from '../assets/icons';
import { Select } from './ui/Select';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Button } from './ui/Button';
import { AVAILABLE_STOCKS } from '../constants';

interface EventImpactAnalyzerProps {
  selectedStockSymbol: string | null; // To pre-select stock for analysis
}

export const EventImpactAnalyzer: React.FC<EventImpactAnalyzerProps> = ({ selectedStockSymbol }) => {
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MarketEvent | null>(null);
  const [targetStockSymbol, setTargetStockSymbol] = useState<string | null>(selectedStockSymbol);
  const [analysisResult, setAnalysisResult] = useState<MarketEvent | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoadingEvents(true);
      const fetchedEvents = await fetchMarketEvents();
      setEvents(fetchedEvents);
      if (fetchedEvents.length > 0) {
        // setSelectedEvent(fetchedEvents[0]); // Auto-select first event
      }
      setIsLoadingEvents(false);
    };
    loadEvents();
  }, []);

  useEffect(() => {
    setTargetStockSymbol(selectedStockSymbol); // Sync with prop
  }, [selectedStockSymbol]);

  const handleAnalyzeImpact = async () => {
    if (!selectedEvent || !targetStockSymbol) {
      alert("Please select an event and a stock to analyze.");
      return;
    }
    setIsLoadingAnalysis(true);
    setAnalysisResult(null); // Clear previous result
    const result = await analyzeEventImpact(selectedEvent, targetStockSymbol);
    setAnalysisResult(result);
    setIsLoadingAnalysis(false);
  };
  
  const stockOptions = AVAILABLE_STOCKS.map(s => ({ value: s.symbol, label: `${s.name} (${s.symbol})`}));
  const eventOptions = events.map(e => ({ value: e.id, label: e.title }));

  return (
    <Card title="Event Impact Analyzer" icon={<PresentationChartLineIcon className="w-6 h-6" />}>
      {isLoadingEvents ? (
        <LoadingSpinner message="Loading market events..." />
      ) : (
        <div className="space-y-4">
          <div>
            <Select
              label="Select Market Event:"
              options={eventOptions}
              value={selectedEvent?.id || ''}
              onChange={(e) => {
                const event = events.find(ev => ev.id === e.target.value);
                setSelectedEvent(event || null);
                setAnalysisResult(null); // Clear analysis when event changes
              }}
              placeholder="Choose an event"
            />
          </div>
          {selectedEvent && (
            <div className="p-3 bg-neutral-700 rounded-lg">
                <p className="text-sm text-neutral-300">{selectedEvent.description}</p>
                <p className="text-xs text-neutral-400 mt-1">Date: {new Date(selectedEvent.date).toLocaleDateString()}</p>
                <p className="text-xs text-neutral-400">Potentially Affected: {selectedEvent.affectedStocks.join(', ')}</p>
            </div>
          )}
          <div>
            <Select
              label="Select Stock to Analyze Impact On:"
              options={stockOptions}
              value={targetStockSymbol || ''}
              onChange={(e) => {
                setTargetStockSymbol(e.target.value || null);
                setAnalysisResult(null); // Clear analysis when stock changes
              }}
              placeholder="Choose a stock"
            />
          </div>
          <Button onClick={handleAnalyzeImpact} disabled={!selectedEvent || !targetStockSymbol || isLoadingAnalysis} className="w-full">
            {isLoadingAnalysis ? 'Analyzing...' : 'Analyze Impact with AI'}
          </Button>
          
          {isLoadingAnalysis && <LoadingSpinner message="AI is analyzing the impact..." />}

          {analysisResult && (
            <div className="mt-4 p-4 bg-primary-900/30 border border-primary-700 rounded-lg">
              <h4 className="text-lg font-semibold text-primary-300 mb-2">AI Impact Analysis for {targetStockSymbol}</h4>
              <p className="text-neutral-200 whitespace-pre-wrap">{analysisResult.impactAnalysis}</p>
              {analysisResult.predictedImpactScore !== undefined && (
                <p className={`mt-2 font-semibold ${
                  analysisResult.predictedImpactScore > 0 ? 'text-green-400' :
                  analysisResult.predictedImpactScore < 0 ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  Predicted Impact Score: {analysisResult.predictedImpactScore}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
