
import { useState, useEffect, useCallback } from 'react';
import { Stock, NewsArticle, ProductInnovation, SentimentData, ChartTimeRange, Company } from '../types';
import { fetchStockData, fetchNewsForStock, fetchProductInnovations, searchStocks as searchStockService } from '../services/stockService';
import { analyzeNewsSentiment, getMarketTrendsSummary, generateStockSummary, analyzeProductInnovationImpact } from '../services/geminiService';
import { AVAILABLE_STOCKS } from '../constants';


export interface StockDetails extends Stock {
  news: NewsArticle[];
  innovations: ProductInnovation[];
  sentimentAnalysis?: SentimentData; // Simplified for now
  aiSummary?: string;
  marketTrends?: string;
}

export const useStockData = (initialSymbol?: string) => {
  const [stock, setStock] = useState<StockDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTimeRange, setCurrentTimeRange] = useState<ChartTimeRange>(ChartTimeRange.OneYear);

  const fetchFullStockDetails = useCallback(async (symbol: string, timeRange: ChartTimeRange) => {
    if (!symbol) {
      setStock(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const stockData = await fetchStockData(symbol, timeRange);
      if (!stockData) {
        throw new Error(`Stock data not found for ${symbol}`);
      }

      const [newsData, innovationsData] = await Promise.all([
        fetchNewsForStock(symbol),
        fetchProductInnovations(symbol),
      ]);
      
      const newsWithSentiment = await analyzeNewsSentiment(newsData);
      const marketTrends = await getMarketTrendsSummary(stockData.name, newsWithSentiment);
      const aiSummary = await generateStockSummary(stockData);

      // Simulate innovation impact analysis
      const analyzedInnovations = await Promise.all(
        innovationsData.map(async (innov) => ({
          ...innov,
          impactAnalysis: await analyzeProductInnovationImpact(stockData.name, innov.title, innov.description)
        }))
      );


      setStock({
        ...stockData,
        news: newsWithSentiment,
        innovations: analyzedInnovations.map(i => ({...i, description: i.impactAnalysis || i.description})), // Using description to show impact for simplicity
        aiSummary,
        marketTrends,
      });
    } catch (e: any) {
      setError(e.message || 'Failed to fetch stock details');
      setStock(null);
      console.error("Error in fetchFullStockDetails: ", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialSymbol) {
      fetchFullStockDetails(initialSymbol, currentTimeRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSymbol]); // Removed fetchFullStockDetails from deps to avoid loop, initialSymbol controls this.

  const setTimeRange = (timeRange: ChartTimeRange) => {
    setCurrentTimeRange(timeRange);
    if (stock?.symbol) {
        fetchFullStockDetails(stock.symbol, timeRange);
    }
  }

  const refreshStockData = (symbol: string) => {
     fetchFullStockDetails(symbol, currentTimeRange);
  }

  return { stock, isLoading, error, fetchStockDetails: refreshStockData, currentTimeRange, setTimeRange };
};

export const useStockSearch = () => {
    const [searchResults, setSearchResults] = useState<Company[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const search = useCallback(async (query: string) => {
        setIsSearching(true);
        const results = await searchStockService(query);
        setSearchResults(results);
        setIsSearching(false);
    }, []);
    
    // Initial load of all stocks
    useEffect(() => {
      search('');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return { searchResults, search, isSearching, clearSearchResults: () => setSearchResults(AVAILABLE_STOCKS) };
}