
import React from 'react';
import { StockDetails } from '../hooks/useStockData';
import { StockChart } from './StockChart';
import { CompanyInfoCard } from './CompanyInfoCard'; // Simplified view for comparison
import { Card, CardContent, CardHeader } from './ui/Card';
import { ScaleIcon } from '../assets/icons';

interface ComparisonViewProps {
  stock1: StockDetails;
  stock2: StockDetails;
  setTimeRange1: (range: any) => void;
  setTimeRange2: (range: any) => void;
  currentTimeRange1: any;
  currentTimeRange2: any;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ stock1, stock2, setTimeRange1, setTimeRange2, currentTimeRange1, currentTimeRange2 }) => {
  return (
    <Card title="Stock Comparison" icon={<ScaleIcon className="w-6 h-6" />}>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <StockChart 
                data={stock1.historicalData} 
                symbol={stock1.symbol} 
                timeRange={currentTimeRange1}
                setTimeRange={setTimeRange1}
                color="#3b82f6" 
            />
            <div className="mt-4 p-4 bg-neutral-700 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{stock1.name} ({stock1.symbol})</h3>
              <p className="text-sm"><span className="font-medium text-neutral-400">Price:</span> ${stock1.currentPrice.toFixed(2)}</p>
              <p className="text-sm"><span className="font-medium text-neutral-400">Market Cap:</span> {stock1.marketCap || 'N/A'}</p>
              <p className="text-sm"><span className="font-medium text-neutral-400">P/E Ratio:</span> {stock1.peRatio || 'N/A'}</p>
              <p className="text-sm mt-2 text-neutral-300 italic">{stock1.aiSummary ? stock1.aiSummary.substring(0,150)+'...' : stock1.description.substring(0,150)+'...'}</p>
            </div>
          </div>
          <div>
            <StockChart 
                data={stock2.historicalData} 
                symbol={stock2.symbol} 
                timeRange={currentTimeRange2}
                setTimeRange={setTimeRange2}
                color="#10b981"
            />
            <div className="mt-4 p-4 bg-neutral-700 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{stock2.name} ({stock2.symbol})</h3>
              <p className="text-sm"><span className="font-medium text-neutral-400">Price:</span> ${stock2.currentPrice.toFixed(2)}</p>
              <p className="text-sm"><span className="font-medium text-neutral-400">Market Cap:</span> {stock2.marketCap || 'N/A'}</p>
              <p className="text-sm"><span className="font-medium text-neutral-400">P/E Ratio:</span> {stock2.peRatio || 'N/A'}</p>
              <p className="text-sm mt-2 text-neutral-300 italic">{stock2.aiSummary ? stock2.aiSummary.substring(0,150)+'...' : stock2.description.substring(0,150)+'...'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
