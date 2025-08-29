
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { NewsArticle, Company, Stock, MarketEvent, GeminiContentPart } from '../types'; // Added MarketEvent, Stock, Company, GeminiContentPart if they are used by functions not fully shown
import { GEMINI_TEXT_MODEL } from '../constants';

// API Key must be set in the environment as process.env.API_KEY
// The GoogleGenAI constructor will throw an error if apiKey is not provided.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonFromGeminiResponse = (responseText: string): any => {
  let jsonStr = responseText.trim();
  
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const fenceMatch = jsonStr.match(fenceRegex);
  if (fenceMatch && fenceMatch[2]) {
    jsonStr = fenceMatch[2].trim();
  }

  // Remove control characters (generally safe and good practice)
  jsonStr = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini response (using simplified parser):", e, "\nProcessed string for parse:\n", jsonStr, "\nOriginal Gemini text (before this parsing attempt):\n", responseText);
    return { error: "Failed to parse JSON", rawText: responseText, processedTextAttempt: jsonStr, originalError: e };
  }
};

export const analyzeNewsSentiment = async (articles: NewsArticle[]): Promise<NewsArticle[]> => {
  if (!articles || articles.length === 0) {
    console.warn("No articles provided for sentiment analysis.");
    return [];
  }

  try {
    const prompt = `Analyze the sentiment of the following news article summaries. For each article, provide its "id", determine if the "sentiment" is 'positive', 'negative', or 'neutral', and give a brief "sentimentReasoning".

    Respond with a valid JSON array. Each object in the array MUST contain ONLY the following three properties: "id" (string), "sentiment" (string: 'positive', 'negative', or 'neutral'), and "sentimentReasoning" (string).
    Ensure all string values are properly quoted and commas correctly separate properties within objects and objects within the array.

    Example of a single object in the array:
    {
      "id": "some_article_id",
      "sentiment": "positive",
      "sentimentReasoning": "The article expresses optimism about future growth."
    }

    Articles to analyze:
    ${articles.map(a => `Article ID: ${a.id}\nTitle: ${a.title}\nSummary: ${a.summary}`).join('\n\n---\n\n')}

    Your entire response MUST be a single, valid JSON array containing objects structured exactly as described above. Do not include any other text, explanations, or markdown formatting outside of the JSON array itself.`;

    const config = {
        temperature: 0.2, // Slightly reduced temperature for more deterministic JSON output
        topK: 30,
        topP: 0.90,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
    };

    const geminiResponse: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: config
    });

    const parsedResults = parseJsonFromGeminiResponse(geminiResponse.text);

    if (parsedResults.error || !Array.isArray(parsedResults)) {
      console.error("Error parsing sentiment analysis results:", parsedResults.error ? parsedResults : "Result was not an array.");
      // Add more detailed logging of what was received if parsing fails
      if (parsedResults.error) {
          console.error("Raw Gemini response text for failed parse in sentiment analysis:", geminiResponse.text);
      }
      return articles.map(a => ({ 
        ...a, 
        sentiment: 'neutral' as const, 
        sentimentReasoning: 'Error analyzing sentiment.' 
      }));
    }
    
    return articles.map(article => {
      const result = parsedResults.find((r: any) => r.id === article.id);
      return {
        ...article,
        sentiment: (result?.sentiment || 'neutral') as 'positive' | 'negative' | 'neutral',
        sentimentReasoning: result?.sentimentReasoning || 'Could not determine sentiment.'
      };
    });

  } catch (error) {
    console.error("Error analyzing news sentiment with Gemini:", error);
    // Consider logging the error object itself for more details
    // console.error("Full error object:", error);
    return articles.map(a => ({ 
      ...a, 
      sentiment: 'neutral' as const, 
      sentimentReasoning: 'API error during sentiment analysis.' 
    }));
  }
};

export const getMarketTrendsSummary = async (companyName: string, recentNews: NewsArticle[]): Promise<string> => {
  if (!companyName) {
    console.warn("No company name provided for market trends analysis.");
    return "Company name is required for market trends analysis.";
  }

  try {
    const newsSummaries = recentNews.slice(0, 5).map(n => 
      `- ${n.title}: ${n.summary.substring(0, 100)}...`
    ).join('\n');
    
    const prompt = `Provide a concise market trends summary for ${companyName}, considering the following recent news headlines and summaries:
    
    ${newsSummaries}
    
    Focus on:
    - Key market drivers affecting the company
    - Potential risks and opportunities
    - Overall market perception and investor sentiment
    - Recent performance indicators
    
    Keep the summary under 150 words and provide actionable insights.`;
    
    const config = {
        temperature: 0.4,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 1024,
    };

    const geminiResponse: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: config
    });

    return geminiResponse.text;
    
  } catch (error) {
    console.error(`Error fetching market trends for ${companyName}:`, error);
    return `Could not fetch market trends for ${companyName}. Please try again later.`;
  }
};

export const suggestSimilarStocks = async (selectedStock: Stock, allStocks: Company[]): Promise<Company[]> => {
  if (!selectedStock || !allStocks || allStocks.length === 0) {
    console.warn("Invalid input for similar stocks suggestion.");
    return [];
  }

  try {
    const otherStocksInfo = allStocks
      .filter(s => s.symbol !== selectedStock.symbol)
      .map(s => `${s.name} (${s.symbol}), Sector: ${s.sector}`)
      .join('; ');

    const prompt = `Analyze the stock ${selectedStock.name} (${selectedStock.symbol}) in the ${selectedStock.sector} sector.
    
    Selected Stock Details:
    - Name: ${selectedStock.name}
    - Symbol: ${selectedStock.symbol}
    - Sector: ${selectedStock.sector}
    - Market Cap: ${selectedStock.marketCap || 'N/A'}
    - Description: ${selectedStock.description || 'N/A'}
    
    From the following companies, suggest 2-3 similar stocks based on:
    - Same or related sector
    - Similar market capitalization
    - Comparable business model
    - Potential for portfolio diversification
    
    Available Companies: ${otherStocksInfo}
    
    Return your answer as a JSON array of company symbols only.
    Example: ["MSFT", "AMZN", "GOOGL"]
    Your response must be a single, valid JSON array of strings. Do not add any conversational text, comments, or instructions within or around the JSON output.`;

    const config = {
        temperature: 0.3,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 512,
        responseMimeType: "application/json",
    };
    
    const geminiResponse: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: config
    });
    
    const parsedResult = parseJsonFromGeminiResponse(geminiResponse.text);
    
    if (parsedResult.error || !Array.isArray(parsedResult)) {
      console.error("Error parsing similar stocks result:", parsedResult.error ? parsedResult : "Result was not an array.");
      if (parsedResult.error) {
          console.error("Raw Gemini response text for failed parse in similar stocks:", geminiResponse.text);
      }
      return allStocks
        .filter(s => s.sector === selectedStock.sector && s.symbol !== selectedStock.symbol)
        .slice(0, 3);
    }
    
    const suggestedSymbols: string[] = parsedResult;
    return allStocks.filter(s => suggestedSymbols.includes(s.symbol));
    
  } catch (error) {
    console.error("Error suggesting similar stocks with Gemini:", error);
    return allStocks
      .filter(s => s.sector === selectedStock.sector && s.symbol !== selectedStock.symbol)
      .slice(0, 3);
  }
};

export const analyzeEventImpact = async (event: MarketEvent, stockSymbol: string): Promise<MarketEvent> => {
  if (!event || !stockSymbol) {
    console.warn("Invalid input for event impact analysis.");
    return { ...event, category: event.category || 'General', impactAnalysis: "Invalid input provided.", predictedImpactScore: 0 };
  }

  try {
    const prompt = `Analyze the potential impact of the following market event on stock ${stockSymbol}.
    
    Event Details:
    - Title: ${event.title}
    - Description: ${event.description}
    - Date: ${event.date}
    - Category: ${event.category || 'General'} 
    
    Provide a comprehensive analysis including:
    1. Short-term impact (1-7 days)
    2. Medium-term impact (1-3 months)
    3. Long-term implications (6+ months)
    4. Market sentiment effects
    5. Trading volume expectations
    
    Return a JSON object with ONLY the following properties:
    - "impactAnalysis": string (max 150 words, comprehensive analysis of the points above)
    - "predictedImpactScore": integer (-10 to 10, where -10 is very negative, 0 is neutral, 10 is very positive)
    
    Consider factors like: industry relevance, market conditions, historical precedents, investor sentiment, and fundamental vs technical impact.
    Your response must be a single, valid JSON object with ONLY the two specified properties. Do not add any conversational text, comments, or instructions within or around the JSON output.`;

    const config = {
        temperature: 0.3, // Adjusted for more deterministic JSON
        topK: 30,
        topP: 0.85,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
    };

    const geminiResponse: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: config
    });

    const parsedResult = parseJsonFromGeminiResponse(geminiResponse.text);

    if (parsedResult.error || 
        typeof parsedResult.impactAnalysis !== 'string' || 
        typeof parsedResult.predictedImpactScore !== 'number') {
      console.error("Error parsing event impact analysis results:", parsedResult.error ? parsedResult : "Essential fields missing.");
      if (parsedResult.error) {
          console.error("Raw Gemini response text for failed parse in event impact:", geminiResponse.text);
      }
      return { 
        ...event, 
        category: event.category || 'General',
        impactAnalysis: "Error analyzing event impact. Please try again.", 
        predictedImpactScore: 0 
      };
    }

    const clampedScore = Math.max(-10, Math.min(10, parsedResult.predictedImpactScore));

    return {
      ...event,
      category: event.category || 'General',
      impactAnalysis: parsedResult.impactAnalysis,
      predictedImpactScore: clampedScore,
    };
    
  } catch (error) {
    console.error("Error analyzing event impact with Gemini:", error);
    return { 
      ...event, 
      category: event.category || 'General',
      impactAnalysis: "API error during event impact analysis. Please try again later.", 
      predictedImpactScore: 0 
    };
  }
};

export const generateStockSummary = async (stock: Stock): Promise<string> => {
  if (!stock) {
    console.warn("No stock provided for summary generation.");
    return "Stock information is required for summary generation.";
  }

  try {
    // Assuming stock object has weekRange52, adjust if not
    const weekRange52 = (stock as any).weekRange52 || 'N/A';


    const prompt = `Generate a comprehensive investment summary for ${stock.name} (${stock.symbol}).
    
    Company Details:
    - Name: ${stock.name}
    - Symbol: ${stock.symbol}
    - Sector: ${stock.sector}
    - Description: ${stock.description || 'N/A'}
    - Market Cap: ${stock.marketCap || 'N/A'}
    - P/E Ratio: ${stock.peRatio || 'N/A'}
    - Current Price: ${stock.currentPrice || 'N/A'}
    - 52-Week Range: ${weekRange52}
    
    Provide an investment summary covering:
    - Market position and competitive advantages
    - Recent performance and key metrics
    - Growth catalysts and opportunities
    - Potential risks and challenges
    - Investment thesis and outlook
    
    Keep the summary between 100-150 words, professional and informative.`;

    const config = {
        temperature: 0.4,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 1024,
    };
    
    const geminiResponse: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: config
    });

    return geminiResponse.text;
    
  } catch (error) {
    console.error(`Error generating summary for ${stock.name}:`, error);
    return `Could not generate AI summary for ${stock.name}. Please try again later.`;
  }
};

export const analyzeProductInnovationImpact = async (
  companyName: string, 
  innovationTitle: string, 
  innovationDescription: string
): Promise<string> => {
  if (!companyName || !innovationTitle || !innovationDescription) {
    console.warn("Incomplete information provided for product innovation analysis.");
    return "Complete innovation details are required for analysis.";
  }

  try {
    const prompt = `Analyze the potential market impact of the following product innovation:
    
    Company: ${companyName}
    Innovation Title: ${innovationTitle}
    Innovation Description: ${innovationDescription}
    
    Provide analysis covering:
    - Market opportunity and addressable market size
    - Competitive differentiation and advantages
    - Potential revenue impact and timeline
    - Market adoption challenges and barriers
    - Impact on company valuation and stock price
    - Competitive response expectations
    
    Deliver a concise but comprehensive analysis (75-100 words) focusing on investment implications.`;

    const config = {
        temperature: 0.4,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 512,
    };
    
    const geminiResponse: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: config
    });

    return geminiResponse.text;
    
  } catch (error) {
    console.error(`Error analyzing product innovation for ${companyName}:`, error);
    return `Could not analyze impact of ${innovationTitle}. Please try again later.`;
  }
};

export const getStockRecommendation = async (
  stock: Stock, 
  marketConditions: string = "neutral"
): Promise<{
  recommendation: 'buy' | 'hold' | 'sell';
  confidence: number;
  reasoning: string;
}> => {
  try {
    const weekRange52 = (stock as any).weekRange52 || 'N/A';
    const prompt = `Provide an investment recommendation for ${stock.name} (${stock.symbol}).
    
    Stock Information:
    - Current Price: ${stock.currentPrice || 'N/A'}
    - Market Cap: ${stock.marketCap || 'N/A'}
    - P/E Ratio: ${stock.peRatio || 'N/A'}
    - Sector: ${stock.sector}
    - 52-Week Range: ${weekRange52}
    
    Market Conditions: ${marketConditions}
    
    Return a JSON object with ONLY the following properties:
    - "recommendation": string ("buy", "hold", or "sell")
    - "confidence": number (1-10, where 10 is highest confidence)
    - "reasoning": string (brief explanation, max 100 words)
    
    Base your recommendation on fundamental analysis, technical indicators, and current market conditions.
    Your response must be a single, valid JSON object with ONLY the three specified properties. Do not add any conversational text, comments, or instructions within or around the JSON output.`;

    const config = {
        temperature: 0.2, // Adjusted for more deterministic JSON
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 512,
        responseMimeType: "application/json",
    };

    const geminiResponse: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: config
    });

    const parsedResult = parseJsonFromGeminiResponse(geminiResponse.text);

    if (parsedResult.error || !parsedResult.recommendation || typeof parsedResult.confidence === 'undefined' || typeof parsedResult.reasoning === 'undefined') {
      console.error("Failed to parse recommendation or essential fields missing:", parsedResult.error ? parsedResult : "Essential fields missing.");
      if (parsedResult.error) {
          console.error("Raw Gemini response text for failed parse in stock recommendation:", geminiResponse.text);
      }
      throw new Error("Failed to parse recommendation or essential fields missing");
    }

    return {
      recommendation: parsedResult.recommendation || 'hold',
      confidence: Math.max(1, Math.min(10, parsedResult.confidence || 5)),
      reasoning: parsedResult.reasoning || 'Unable to provide detailed reasoning.'
    };
    
  } catch (error) {
    console.error(`Error getting stock recommendation for ${stock.symbol}:`, error);
    return {
      recommendation: 'hold',
      confidence: 1,
      reasoning: 'Error generating recommendation. Please consult a financial advisor.'
    };
  }
};

export const analyzeSectorTrends = async (sector: string, timeframe: string = "3 months"): Promise<string> => {
  try {
    const prompt = `Analyze current trends and outlook for the ${sector} sector over the ${timeframe} timeframe.
    
    Include analysis of:
    - Key growth drivers and headwinds
    - Regulatory environment and policy impacts
    - Technological disruptions and innovations
    - Market valuations and investor sentiment
    - Top performers and laggards in the sector
    - Investment opportunities and risks
    
    Provide a comprehensive sector analysis (150-200 words) with actionable insights for investors.`;

    const config = {
        temperature: 0.4,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 1024,
    };
    
    const geminiResponse: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: config
    });

    return geminiResponse.text;
    
  } catch (error) {
    console.error(`Error analyzing sector trends for ${sector}:`, error);
    return `Could not analyze trends for ${sector} sector. Please try again later.`;
  }
};

export const assessInvestmentRisk = async (stock: Stock): Promise<{
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  riskScore: number;
  mitigationStrategies: string[];
}> => {
  try {
    const prompt = `Assess the investment risk for ${stock.name} (${stock.symbol}).
    
    Stock Details:
    - Sector: ${stock.sector}
    - Market Cap: ${stock.marketCap || 'N/A'}
    - P/E Ratio: ${stock.peRatio || 'N/A'}
    - Description: ${stock.description || 'N/A'}
    
    Return a JSON object with ONLY the following properties:
    - "riskLevel": string ("low", "medium", or "high")
    - "riskFactors": array of strings (top 3-5 risk factors)
    - "riskScore": number (1-10, where 10 is highest risk)
    - "mitigationStrategies": array of strings (2-3 risk mitigation approaches)
    
    Consider factors like volatility, sector stability, competitive position, financial health, and market conditions.
    Your response must be a single, valid JSON object with ONLY the four specified properties. Do not add any conversational text, comments, or instructions within or around the JSON output.`;

    const config = {
        temperature: 0.2, // Adjusted for more deterministic JSON
        topK: 25,
        topP: 0.80,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
    };
    
    const geminiResponse: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: config
    });

    const parsedResult = parseJsonFromGeminiResponse(geminiResponse.text);

    if (parsedResult.error || !parsedResult.riskLevel || !parsedResult.riskFactors || typeof parsedResult.riskScore === 'undefined' || !parsedResult.mitigationStrategies) {
      console.error("Failed to parse risk assessment or essential fields missing:", parsedResult.error ? parsedResult : "Essential fields missing.");
      if (parsedResult.error) {
          console.error("Raw Gemini response text for failed parse in risk assessment:", geminiResponse.text);
      }
      throw new Error("Failed to parse risk assessment or essential fields missing");
    }

    return {
      riskLevel: parsedResult.riskLevel || 'medium',
      riskFactors: parsedResult.riskFactors || ['Unable to assess risk factors'],
      riskScore: Math.max(1, Math.min(10, parsedResult.riskScore || 5)),
      mitigationStrategies: parsedResult.mitigationStrategies || ['Diversify portfolio', 'Regular monitoring']
    };
    
  } catch (error) {
    console.error(`Error assessing investment risk for ${stock.symbol}:`, error);
    return {
      riskLevel: 'medium',
      riskFactors: ['Risk assessment unavailable'],
      riskScore: 5,
      mitigationStrategies: ['Consult financial advisor', 'Conduct thorough research']
    };
  }
};
