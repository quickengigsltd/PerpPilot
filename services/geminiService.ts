
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

// --- NEW GEM HUNTER / SCALP SNIPER LOGIC ---
export const analyzeTokenPotential = async (
    marketState: MarketState,
    mode: 'GEM' | 'SCALP'
): Promise<GemAnalysis> => {
    const { pair, price, indicators, metrics, macroStats } = marketState;

    if (!process.env.API_KEY) throw new Error("API Key Missing");

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Calculate Drawdown for Gem Mode
    const drawdown = macroStats ? macroStats.drawdownFromHigh : 0;
    
    let prompt = "";

    if (mode === 'GEM') {
        prompt = `
            ROLE: You are an Elite Crypto VC and Gem Hunter.
            OBJECTIVE: Analyze if ${pair} is a "Hidden Gem" or "Good Dip Buy" for a swing trade.
            
            **DATA**:
            - Price: ${price}
            - 30d Drawdown: -${drawdown.toFixed(2)}%
            - RSI: ${indicators.rsi.toFixed(2)}
            - Trend (EMA200): ${price > indicators.ema200 ? 'Bullish' : 'Bearish'}
            - Whale Activity: ${metrics.cvd > 0 ? 'Accumulating' : 'Distributing'}
            
            Analyze the "Dip Quality". Is it a falling knife or a golden entry?
            Return a risk score, entry zone, and potential multiplier (e.g. 2x, 5x).
        `;
    } else {
        // SCALP MODE
        prompt = `
            ROLE: You are a High-Frequency Scalp Trader (Sniper).
            OBJECTIVE: Find a high-probability SHORT-TERM trade setup (Scalp) for ${pair} right now.
            
            **CHART DATA**:
            - Current Price: ${price}
            - RSI (14): ${indicators.rsi.toFixed(2)} (Overbought > 70, Oversold < 30)
            - Bollinger Bands: Upper=${indicators.bollingerUpper.toFixed(4)}, Lower=${indicators.bollingerLower.toFixed(4)}
            - Volume Status: ${indicators.vpaStatus}
            - Order Flow: ${metrics.orderFlow.buyingPressure > 50 ? 'Bullish Flow' : 'Bearish Flow'}
            
            **TASK**:
            1. Determine immediate direction (LONG SCALP or SHORT SCALP).
            2. Define a precise ENTRY ZONE (e.g. current price or slight pullback).
            3. Define a tight STOP LOSS.
            4. Define 3 Take Profit Targets (TP1, TP2, TP3).
            5. Rate the Volatility and Volume flow (0-10).
        `;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    pair: { type: Type.STRING },
                    mode: { type: Type.STRING, enum: ['GEM', 'SCALP'] },
                    score: { type: Type.NUMBER, description: "0-100 Confidence Score" },
                    verdict: { 
                        type: Type.STRING, 
                        enum: ['GENERATIONAL_BUY', 'GOOD_DIP', 'WAIT_LOWER', 'DO_NOT_TOUCH', 'LONG_SCALP', 'SHORT_SCALP', 'WAIT_FOR_ENTRY'] 
                    },
                    potentialMultiplier: { type: Type.STRING, description: "For Gem: '3x'. For Scalp: '1.5%'" },
                    riskLevel: { type: Type.STRING, enum: ['DEGEN', 'HIGH', 'MODERATE', 'SAFE'] },
                    entryZone: { type: Type.STRING, description: "Specific price range" },
                    stopLoss: { type: Type.STRING, description: "Specific price" },
                    tpTargets: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of 3 price targets" },
                    volumeScore: { type: Type.NUMBER, description: "0-10" },
                    volatilityScore: { type: Type.NUMBER, description: "0-10" },
                    keyCatalysts: { type: Type.ARRAY, items: { type: Type.STRING } },
                    analysis: { type: Type.STRING, description: "Brief strategic summary." }
                },
                required: ["pair", "score", "verdict", "entryZone", "stopLoss", "tpTargets", "analysis", "volumeScore", "volatilityScore"]
            }
        }
    });

    const result = JSON.parse(response.text);
    return { ...result, mode };
};
