
import React, { useState, useEffect } from 'react';
import { Company, Stock } from '../types';
import { AVAILABLE_STOCKS } from '../constants';
import { suggestSimilarStocks } from '../services/geminiService';
import { Card } from './ui/Card';
import { LightBulbIcon } from '../assets/icons';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Button } from './ui/Button';

interface RecommendationCardProps {
  selectedStock: Stock | null;
  onSelectRecommendation: (symbol: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ selectedStock, onSelectRecommendation }) => {
  const [recommendations, setRecommendations] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (selectedStock) {
        setIsLoading(true);
        const similarStocks = await suggestSimilarStocks(selectedStock, AVAILABLE_STOCKS);
        setRecommendations(similarStocks);
        setIsLoading(false);
      } else {
        setRecommendations([]);
      }
    };

    fetchRecommendations();
  }, [selectedStock]);

  if (!selectedStock) {
    return null; // Don't show if no stock is selected
  }

  return (
    <Card title="AI Stock Suggestions" icon={<LightBulbIcon className="w-6 h-6" />}>
      {isLoading ? (
        <LoadingSpinner message="Generating recommendations..." />
      ) : recommendations.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-neutral-300 mb-2">Based on {selectedStock.name}, you might also be interested in:</p>
          {recommendations.map((rec) => (
            <div key={rec.symbol} className="p-3 bg-neutral-700 rounded-lg flex items-center justify-between">
              <div>
                <div className="flex items-center">
                    {rec.logoUrl && <img src={rec.logoUrl} alt={rec.name} className="w-6 h-6 mr-2 rounded-full"/>}
                    <h5 className="font-semibold text-neutral-100">{rec.name} ({rec.symbol})</h5>
                </div>
                <p className="text-xs text-neutral-400">{rec.sector}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => onSelectRecommendation(rec.symbol)}>
                View
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-400">No specific recommendations found at this time.</p>
      )}
    </Card>
  );
};
