
import { GoogleGenAI, Type } from "@google/genai";
import { AISignal, SignalType, MarketState } from "../types";

export const generateAISignal = async (
  marketState: MarketState
): Promise<AISignal> => {
  const { pair, price, indicators, metrics, whaleStats, macroStats } = marketState;

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

  // Prepare Real Data Context
  const binanceData = whaleStats?.exchanges.find(e => e.name === 'Binance');
  const netFlow = binanceData ? binanceData.buyVolume - binanceData.sellVolume : 0;
  const flowDirection = netFlow > 0 ? 'Net Buying (Accumulation)' : 'Net Selling (Distribution)';
  const whaleSentiment = (whaleStats?.longPercentage || 50) > 50 ? 'Bullish' : 'Bearish';

  // Prepare Macro Context
  const macroTrend = macroStats?.trend30d || 'SIDEWAYS';
  const drawdown = macroStats?.drawdownFromHigh.toFixed(1) || '0';
  const pump = macroStats?.pumpFromLow.toFixed(1) || '0';
  const high30 = macroStats?.high30d.toFixed(2) || 'N/A';
  const low30 = macroStats?.low30d.toFixed(2) || 'N/A';

  const prompt = `
    ROLE: You are the "PerpPilot Sniper", an institutional-grade high-frequency trading algorithm.
    OBJECTIVE: Identify "A+ High Probability Setups" with 99% accuracy.
    RISK PROFILE: EXTREMELY CONSERVATIVE. If the trade is not perfect, command "WAIT".
    
    **LIVE DATA (${pair})**:
    - Price: ${price} (Live)
    - Trend (Macro): ${macroTrend}
    - Trend (Local): Price is ${price > indicators.ema20 ? 'ABOVE' : 'BELOW'} EMA20.
    - RSI: ${indicators.rsi.toFixed(1)}
    - Whale Flow (Binance): ${flowDirection} (${Math.round(netFlow).toLocaleString()} USDT net)
    - Whale Positioning: ${whaleStats?.longPercentage.toFixed(1)}% Longs.
    - Market Structure: ${indicators.marketStructure}.
    - Funding Rate: ${(metrics.fundingRate * 100).toFixed(4)}%

    **DECISION MATRIX (STRICT):**
    
    1. **GO LONG (STRONG_LONG)** requires ALL of the following:
       - Whale Flow is POSITIVE (Accumulation).
       - Market Structure is BULLISH (Higher Highs) OR Price is bouncing off 30-Day Low (Oversold).
       - RSI is < 65 (Not overbought).
       - CONFIRMATION: Price > EMA20.

    2. **GO SHORT (STRONG_SHORT)** requires ALL of the following:
       - Whale Flow is NEGATIVE (Distribution).
       - Market Structure is BEARISH (Lower Lows) OR Price is rejecting 30-Day High (Overbought).
       - RSI is > 35 (Not oversold).
       - CONFIRMATION: Price < EMA20.

    3. **WAIT (NEUTRAL) - MOST LIKELY OUTCOME**:
       - Triggers if **DIVERGENCE** exists: 
         - Price rising but Whales Selling -> WAIT (Trap).
         - Price falling but Whales Buying -> WAIT (Knife catch, wait for structure change).
       - Triggers if RSI is Neutral (45-55) and Volume is low.
       - Triggers if Trend is conflicting with Flow.

    **OUTPUT INSTRUCTIONS**:
    - "action": EXACTLY ONE OF ["GO LONG", "GO SHORT", "WAIT"].
    - "signal": One of ["STRONG_LONG", "WEAK_LONG", "NEUTRAL", "WEAK_SHORT", "STRONG_SHORT"].
    - "confidence": 
        - If "WAIT": 0.
        - If "GO LONG/SHORT": 80-99 (Calculate based on number of aligned indicators).
    - "reasoning": Be ruthless. Example: "Whales selling into this pump. Fakeout detected. WAIT." or "Whale accumulation + Oversold bounce + Structure break. GO LONG."
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { 
                type: Type.STRING, 
                enum: ["GO LONG", "GO SHORT", "WAIT"],
                description: "The direct command for the user" 
            },
            signal: { 
                type: Type.STRING, 
                enum: ["STRONG_LONG", "WEAK_LONG", "NEUTRAL", "WEAK_SHORT", "STRONG_SHORT"],
            },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          },
          required: ["action", "signal", "confidence", "reasoning"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    const result = JSON.parse(jsonText);
    
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
    
    // Fallback Logic
    return {
      type: 'NEUTRAL',
      action: "WAIT",
      confidence: 0,
      reasoning: 'AI Connection Unstable. Capital Preservation Mode Active.',
      timestamp: Date.now(),
      indicators
    };
  }
};
