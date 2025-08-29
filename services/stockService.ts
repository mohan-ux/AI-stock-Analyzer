
import { Stock, Company, StockDataPoint, NewsArticle, ProductInnovation, MarketEvent, ChartTimeRange } from '../types';
import { AVAILABLE_STOCKS } from '../constants';

const generateRandomStockData = (symbol: string, days: number, basePrice: number): StockDataPoint[] => {
  const data: StockDataPoint[] = [];
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - days);
  let price = basePrice;

  for (let i = 0; i < days; i++) {
    price += (Math.random() - 0.49) * (basePrice / 50); // Fluctuate price
    price = Math.max(price, basePrice / 5); // Ensure price doesn't go too low
    data.push({
      date: currentDate.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 500000,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return data;
};

const getDaysForTimeRange = (timeRange: ChartTimeRange): number => {
  switch(timeRange) {
    case ChartTimeRange.OneMonth: return 30;
    case ChartTimeRange.ThreeMonths: return 90;
    case ChartTimeRange.SixMonths: return 180;
    case ChartTimeRange.OneYear: return 365;
    case ChartTimeRange.FiveYears: return 365 * 5;
    case ChartTimeRange.Max: return 365 * 10; // Max 10 years of mock data
    default: return 365;
  }
};


export const fetchStockData = async (symbol: string, timeRange: ChartTimeRange = ChartTimeRange.OneYear): Promise<Stock | null> => {
  const companyInfo = AVAILABLE_STOCKS.find(s => s.symbol === symbol);
  if (!companyInfo) return null;

  const days = getDaysForTimeRange(timeRange);
  const basePrice = companyInfo.symbol === 'TSLA' ? 180 : companyInfo.symbol === 'GOOGL' ? 170 : companyInfo.symbol === 'MSFT' ? 430 : companyInfo.symbol === 'AAPL' ? 170 : companyInfo.symbol === 'AMZN' ? 180 : 50; // Base price for simulation
  const historicalData = generateRandomStockData(symbol, days, basePrice);
  
  const currentPrice = historicalData.length > 0 ? historicalData[historicalData.length - 1].price : basePrice;
  const prevPrice = historicalData.length > 1 ? historicalData[historicalData.length - 2].price : currentPrice;
  const priceChangePercent = ((currentPrice - prevPrice) / prevPrice) * 100;

  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  return {
    ...companyInfo,
    historicalData,
    currentPrice,
    priceChangePercent: parseFloat(priceChangePercent.toFixed(2)),
  };
};

export const fetchCompanyDetails = async (symbol: string): Promise<Company | null> => {
  const companyInfo = AVAILABLE_STOCKS.find(s => s.symbol === symbol);
   await new Promise(resolve => setTimeout(resolve, 300));
  return companyInfo || null;
};

export const fetchNewsForStock = async (symbol: string): Promise<NewsArticle[]> => {
  const company = AVAILABLE_STOCKS.find(s => s.symbol === symbol);
  const companyName = company ? company.name : symbol;
  
  const mockNews: NewsArticle[] = [
    { id: `${symbol}_news_1`, title: `${companyName} Announces Q3 Earnings Beat`, source: 'Financial Times', date: '2024-07-15', summary: `Positive results driven by strong cloud performance and AI initiatives. Stock expected to react favorably.`, url: '#', sentiment: undefined },
    { id: `${symbol}_news_2`, title: `New Product Launch from ${companyName} Receives Mixed Reviews`, source: 'TechCrunch', date: '2024-07-10', summary: `Innovative features but concerns about pricing and market fit. Analysts are divided on its long-term impact.`, url: '#', sentiment: undefined },
    { id: `${symbol}_news_3`, title: `Regulatory Scrutiny Intensifies for ${companyName} in Europe`, source: 'Reuters', date: '2024-07-05', summary: `Potential fines and operational changes could impact future profitability. Investors are wary.`, url: '#', sentiment: undefined },
    { id: `${symbol}_news_4`, title: `${companyName} partners with Acme Corp for strategic AI development`, source: 'Bloomberg', date: '2024-06-28', summary: `This partnership aims to accelerate AI research and product integration, potentially boosting ${companyName}'s competitive edge.`, url: '#', sentiment: undefined },
    { id: `${symbol}_news_5`, title: `Market Analysts Upgrade ${companyName} Stock to 'Buy'`, source: 'Wall Street Journal', date: '2024-06-20', summary: `Upgraded based on strong growth prospects and innovation pipeline. Price target increased by 15%.`, url: '#', sentiment: undefined }
  ];
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockNews;
};

export const fetchProductInnovations = async (symbol: string): Promise<ProductInnovation[]> => {
    const company = AVAILABLE_STOCKS.find(s => s.symbol === symbol);
    const companyName = company ? company.name : symbol;

    const mockInnovations: ProductInnovation[] = [
        { id: `${symbol}_innov_1`, date: '2024-05-15', title: `Launch of Next-Gen AI Chip by ${companyName}`, description: 'A new chip promising 2x performance for AI workloads, targeting data centers and autonomous systems.', impactScore: 8 },
        { id: `${symbol}_innov_2`, date: '2024-02-20', title: `${companyName} Unveils "Synergy OS" for Seamless Device Integration`, description: 'A new operating system aiming to unify user experience across all company devices.', impactScore: 7 },
        { id: `${symbol}_innov_3`, date: '2023-11-01', title: `Breakthrough in Quantum Computing Research by ${companyName}`, description: 'Published research detailing significant progress towards a stable quantum bit, potentially revolutionizing computing.', impactScore: 9 },
    ];
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockInnovations;
};

export const fetchMarketEvents = async (): Promise<MarketEvent[]> => {
    const mockEvents: MarketEvent[] = [
        { id: 'event_1', date: '2023-11-17', title: 'ChatGPT Launch Anniversary', description: 'Marking one year since the public release of ChatGPT, significantly impacting AI industry perception and investment.', affectedStocks: ['MSFT', 'GOOGL', 'OPENAI'], },
        { id: 'event_2', date: '2024-01-10', title: 'Major Tech Company Layoffs Announced', description: 'Several large tech companies, including Google and Microsoft, announce significant workforce reductions amidst economic uncertainty.', affectedStocks: ['GOOGL', 'MSFT', 'AMZN'], },
        { id: 'event_3', date: '2024-06-05', title: 'Apple Vision Pro Global Rollout Begins', description: 'Apple starts the global rollout of its mixed-reality headset, setting a new benchmark for spatial computing.', affectedStocks: ['AAPL', 'MSFT'], },
    ];
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockEvents;
};

export const searchStocks = async (query: string): Promise<Company[]> => {
  if (!query) return AVAILABLE_STOCKS;
  const lowerQuery = query.toLowerCase();
  const results = AVAILABLE_STOCKS.filter(
    stock => stock.name.toLowerCase().includes(lowerQuery) || stock.symbol.toLowerCase().includes(lowerQuery)
  );
  await new Promise(resolve => setTimeout(resolve, 200));
  return results;
};
