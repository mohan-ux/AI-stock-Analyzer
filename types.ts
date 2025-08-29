
export interface StockDataPoint {
  date: string;
  price: number;
  volume?: number;
}

export interface Company {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  description: string;
  marketCap?: string;
  peRatio?: number;
  revenue?: string;
  logoUrl?: string;
}

export interface Stock extends Company {
  historicalData: StockDataPoint[];
  currentPrice: number;
  priceChangePercent?: number;
}

export interface ProductInnovation {
  id: string;
  date: string;
  title: string;
  description: string;
  impactScore?: number; // 1-10
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  url: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentReasoning?: string;
}

export interface SentimentData {
  overallScore: number; // -1 to 1
  trend: 'improving' | 'declining' | 'stable';
  keyThemes: string[]; // e.g., "Positive earnings report", "New product launch excitement"
}

export interface MarketEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  affectedStocks: string[]; // symbols
  category?: string; // Optional category for the event
  impactAnalysis?: string; // Gemini generated
  predictedImpactScore?: number; // Gemini generated, -10 to 10
}

export interface UserAlert {
  id: string;
  stockSymbol: string;
  condition: 'price_above' | 'price_below' | 'sentiment_change';
  targetValue: number | string; // number for price, string for sentiment (e.g. 'positive')
  isActive: boolean;
}

export interface PortfolioItem {
  stockSymbol: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
}

export enum ChartTimeRange {
  OneMonth = '1M',
  ThreeMonths = '3M',
  SixMonths = '6M',
  OneYear = '1Y',
  FiveYears = '5Y',
  Max = 'MAX'
}

export interface GeminiContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}