
import { GoogleGenAI, Type } from "@google/genai";
import { AISignal, SignalType, MarketState, GemAnalysis } from "../types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- EXISTING SWING TRADER LOGIC ---
export const generateAISignal = async (
  marketState: MarketState
): Promise<AISignal> => {
  const { pair, price, indicators, metrics, whaleStats } = marketState;

  if (!process.env.API_KEY) {
    return {
      type: 'NEUTRAL',
      action: 'WAIT',
      confidence: 0,
      reasoning: 'API Key missing. Cannot generate signal.',
      timestamp: Date.now(),
      indicators
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // The Devil Method: Order Flow + Microstructure
  const { imbalanceRatio, cvdDivergence, stopHunt } = metrics.orderFlow;
  const { takerRatios } = metrics;
  
  const prompt = `
    ROLE: You are a Professional Swing Trader Agent.
    OBJECTIVE: You hold winning positions for as long as possible. You DO NOT scalp small moves.
    
    **MARKET CONTEXT (${pair})**:
    - Price: ${price}
    - Major Trend (EMA50): ${price > indicators.ema50 ? 'BULLISH' : 'BEARISH'}
    - Order Book Imbalance: ${imbalanceRatio.toFixed(2)}
    - Buying Pressure Score: ${metrics.orderFlow.buyingPressure}
    
    **STRATEGY RULES**:
    1. **HOLD THE TREND**: If we are already in a trend (Price > EMA50), signal "GO LONG" with high confidence. Do not suggest selling on minor dips.
    2. **CLEAN ENTRIES ONLY**: Only signal a reversal if there is a massive structure break (e.g. Price crossed EMA50 definitively).
    3. **IGNORE NOISE**: If the market is choppy/ranging, stick to the higher timeframe bias (EMA50).
    
    **DECISION MATRIX**:
    - **GO LONG**: Price > EMA50. Hold it.
    - **GO SHORT**: Price < EMA50. Hold it.
    
    **OUTPUT INSTRUCTIONS**:
    - "action": "GO LONG" or "GO SHORT".
    - "signal": "STRONG_LONG", "WEAK_LONG", "WEAK_SHORT", "STRONG_SHORT".
    - "confidence": 70-100 (Be confident in the trend).
    - "reasoning": 1 sentence explaining why we are holding or entering.
  `;

  try {
    let response;
    let attempts = 0;
    
    while (attempts < 3) {
        try {
            response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        action: { type: Type.STRING, enum: ["GO LONG", "GO SHORT"] },
                        signal: { type: Type.STRING, enum: ["STRONG_LONG", "WEAK_LONG", "WEAK_SHORT", "STRONG_SHORT"] },
                        confidence: { type: Type.NUMBER },
                        reasoning: { type: Type.STRING }
                    },
                    required: ["action", "signal", "confidence", "reasoning"]
                    }
                }
            });
            break;
        } catch (error) {
            attempts++;
            await sleep(1000);
        }
    }

    let jsonText = response?.text?.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!jsonText) throw new Error("No response from AI");
    
    const cleanJson = jsonText.replace(/,\s*([\]}])/g, '$1');
    const result = JSON.parse(cleanJson);
    
    return {
      type: result.signal as SignalType,
      action: result.action,
      confidence: result.confidence,
      reasoning: result.reasoning,
      timestamp: Date.now(),
      indicators
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback logic if AI fails - strictly technical binary based on EMA50
    const fallbackAction = price > indicators.ema50 ? 'GO LONG' : 'GO SHORT';
    const fallbackType = price > indicators.ema50 ? 'STRONG_LONG' : 'STRONG_SHORT';
    
    return {
      type: fallbackType,
      action: fallbackAction,
      confidence: 80,
      reasoning: 'AI Offline. Following Major Trend (EMA50).',
      timestamp: Date.now(),
      indicators
    };
  }
};

// --- NEW GEM HUNTER LOGIC ---
export const analyzeTokenPotential = async (
    marketState: MarketState
): Promise<GemAnalysis> => {
    const { pair, price, indicators, metrics, macroStats } = marketState;

    if (!process.env.API_KEY) throw new Error("API Key Missing");

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Calculate Drawdown
    const drawdown = macroStats ? macroStats.drawdownFromHigh : 0;
    const isDip = drawdown > 20;

    const prompt = `
        ROLE: You are an Elite Crypto VC Sniper and Gem Hunter.
        OBJECTIVE: Analyze this token pair and tell me if it's a "Hidden Gem" or a "Good Dip Buy" for 3x-10x returns.
        
        **TOKEN DATA (${pair})**:
        - Current Price: $${price}
        - 30-Day Drawdown: -${drawdown.toFixed(2)}% (Distance from High)
        - RSI (14): ${indicators.rsi.toFixed(2)}
        - Trend (EMA200): ${price > indicators.ema200 ? 'Above (Bullish)' : 'Below (Accumulation/Bearish)'}
        - Volume Activity: ${indicators.vpaStatus}
        - Whale Activity (CVD): ${metrics.cvd > 0 ? 'Accumulating' : 'Distributing'}
        
        **ANALYSIS TASKS**:
        1. **Dip Quality**: Is this a generic dump or a golden entry zone?
        2. **Multiplier Potential**: Based on volatility and drawdown, can this do a 3x or 5x soon?
        3. **Verdict**: 
           - "GENERATIONAL_BUY" (Perfect entry, high whale activity, deep dip)
           - "GOOD_DIP" (Solid entry, decent risk/reward)
           - "WAIT_LOWER" (Falling knife, wait)
           - "DO_NOT_TOUCH" (Dead coin, no volume)
        
        Provide the result in JSON format.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    pair: { type: Type.STRING },
                    score: { type: Type.NUMBER, description: "0 to 100 Gem Score" },
                    verdict: { type: Type.STRING, enum: ['GENERATIONAL_BUY', 'GOOD_DIP', 'WAIT_LOWER', 'DO_NOT_TOUCH'] },
                    potentialMultiplier: { type: Type.STRING, description: "e.g. '2x - 5x'" },
                    riskLevel: { type: Type.STRING, enum: ['DEGEN', 'HIGH', 'MODERATE', 'SAFE'] },
                    keyCatalysts: { type: Type.ARRAY, items: { type: Type.STRING } },
                    entryZone: { type: Type.STRING },
                    analysis: { type: Type.STRING, description: "Short, punchy sniper analysis." }
                },
                required: ["pair", "score", "verdict", "potentialMultiplier", "riskLevel", "entryZone", "analysis"]
            }
        }
    });

    const result = JSON.parse(response.text);
    return result as GemAnalysis;
};
