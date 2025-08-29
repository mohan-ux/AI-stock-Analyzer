
import React from 'react';
import { StockDetails } from '../hooks/useStockData';
import { NewsArticle, ProductInnovation } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { DocumentTextIcon, LightBulbIcon, SparklesIcon, ChartBarIcon } from '../assets/icons';

interface CompanyInfoCardProps {
  stock: StockDetails;
}

const NewsItem: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <div className="py-3 border-b border-neutral-700 last:border-b-0">
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline font-medium">{article.title}</a>
    <p className="text-xs text-neutral-500">{article.source} - {new Date(article.date).toLocaleDateString()}</p>
    <p className="text-sm text-neutral-300 mt-1">{article.summary}</p>
    {article.sentiment && (
      <p className={`text-xs mt-1 font-semibold ${
        article.sentiment === 'positive' ? 'text-green-400' :
        article.sentiment === 'negative' ? 'text-red-400' :
        'text-yellow-400'
      }`}>
        Sentiment: {article.sentiment}
        {article.sentimentReasoning && <span className="text-neutral-400 font-normal italic text-xs"> - {article.sentimentReasoning}</span>}
      </p>
    )}
  </div>
);

const InnovationItem: React.FC<{ innovation: ProductInnovation }> = ({ innovation }) => (
  <div className="py-3 border-b border-neutral-700 last:border-b-0">
    <h5 className="font-medium text-neutral-200">{innovation.title}</h5>
    <p className="text-xs text-neutral-500">{new Date(innovation.date).toLocaleDateString()}</p>
    <p className="text-sm text-neutral-300 mt-1">{innovation.description}</p>
    {innovation.impactScore && <p className="text-xs mt-1 text-primary-400">Potential Impact Score: {innovation.impactScore}/10</p>}
  </div>
);

export const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({ stock }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center mb-2">
          {stock.logoUrl && <img src={stock.logoUrl} alt={stock.name} className="w-10 h-10 mr-3 rounded-full" />}
          <div>
            <h2 className="text-2xl font-bold text-neutral-100">{stock.name} ({stock.symbol})</h2>
            <p className="text-sm text-neutral-400">{stock.sector}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
          <div><span className="text-neutral-400">Price: </span><span className={`font-semibold ${stock.priceChangePercent && stock.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>${stock.currentPrice.toFixed(2)}</span></div>
          <div><span className="text-neutral-400">Change: </span><span className={`font-semibold ${stock.priceChangePercent && stock.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stock.priceChangePercent?.toFixed(2)}%</span></div>
          <div><span className="text-neutral-400">Market Cap: </span><span className="font-semibold">{stock.marketCap || 'N/A'}</span></div>
          <div><span className="text-neutral-400">P/E Ratio: </span><span className="font-semibold">{stock.peRatio || 'N/A'}</span></div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-neutral-300 mb-6">{stock.description}</p>

        {stock.aiSummary && (
          <div className="mb-6 p-4 bg-neutral-700 rounded-lg">
            <div className="flex items-center mb-2">
              <SparklesIcon className="w-5 h-5 mr-2 text-yellow-400" />
              <h4 className="text-md font-semibold text-neutral-200">AI Investment Summary</h4>
            </div>
            <p className="text-sm text-neutral-300 italic">{stock.aiSummary}</p>
          </div>
        )}
        
        {stock.marketTrends && (
          <div className="mb-6 p-4 bg-neutral-700 rounded-lg">
            <div className="flex items-center mb-2">
                <ChartBarIcon className="w-5 h-5 mr-2 text-primary-400" />
                <h4 className="text-md font-semibold text-neutral-200">AI Market Trends Analysis</h4>
            </div>
            <p className="text-sm text-neutral-300">{stock.marketTrends}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-3">
              <DocumentTextIcon className="w-6 h-6 mr-2 text-primary-400" />
              <h4 className="text-lg font-semibold text-neutral-200">Recent News & Sentiment</h4>
            </div>
            <div className="max-h-96 overflow-y-auto pr-2 space-y-2 nice-scrollbar">
              {stock.news.length > 0 ? stock.news.map(article => <NewsItem key={article.id} article={article} />) : <p className="text-neutral-400">No news available.</p>}
            </div>
          </div>
          <div>
            <div className="flex items-center mb-3">
              <LightBulbIcon className="w-6 h-6 mr-2 text-yellow-400" />
              <h4 className="text-lg font-semibold text-neutral-200">Product Innovations</h4>
            </div>
            <div className="max-h-96 overflow-y-auto pr-2 space-y-2 nice-scrollbar">
              {stock.innovations.length > 0 ? stock.innovations.map(innov => <InnovationItem key={innov.id} innovation={innov} />) : <p className="text-neutral-400">No product innovations tracked.</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};