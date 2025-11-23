import { Candle, IndicatorValues, AdvancedMetrics } from '../types';

export const calculateEMA = (data: number[], period: number): number => {
  if (data.length < period) return data[data.length - 1];
  const k = 2 / (period + 1);
  let ema = data[0];
  for (let i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return ema;
};

export const calculateRSI = (closes: number[], period: number = 14): number => {
  if (closes.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

export const calculateIndicators = (candles: Candle[], metrics: AdvancedMetrics): IndicatorValues => {
  const closes = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);
  const currentPrice = closes[closes.length - 1];

  const ema20 = calculateEMA(closes.slice(-30), 20);
  const ema50 = calculateEMA(closes.slice(-60), 50);
  const ema200 = calculateEMA(closes.slice(-250), 200);
  const rsi = calculateRSI(closes, 14);
  const volumeSma = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const macd = ema20 - ema50; 

  // Safety check: Ensure metrics object exists before accessing properties
  const safeMetrics = metrics || {
    cvd: 0,
    openInterest: 0,
    fundingRate: 0,
    liquidationHeat: 0,
    btcDominance: 54
  };

  // --- NEW: Market Structure (HH/HL check over last 20 candles) ---
  // Identify pivots
  let marketStructure: 'BULLISH' | 'BEARISH' | 'RANGING' = 'RANGING';
  
  if (candles.length > 20) {
      const recentCandles = candles.slice(-15);
      const highs = recentCandles.map(c => c.high);
      const lows = recentCandles.map(c => c.low);
      
      const maxHigh = Math.max(...highs);
      const minLow = Math.min(...lows);
      
      const firstHalfHigh = Math.max(...highs.slice(0, 7));
      const secondHalfHigh = Math.max(...highs.slice(7));
      
      const firstHalfLow = Math.min(...lows.slice(0, 7));
      const secondHalfLow = Math.min(...lows.slice(7));

      if (secondHalfHigh > firstHalfHigh && secondHalfLow > firstHalfLow) {
          marketStructure = 'BULLISH';
      } else if (secondHalfHigh < firstHalfHigh && secondHalfLow < firstHalfLow) {
          marketStructure = 'BEARISH';
      }
  }

  // --- NEW: VPA (Volume Price Analysis) ---
  // High volume + Bullish candle = Strong
  // High volume + Small body = Anomaly (Potential Reversal)
  const currentVol = volumes[volumes.length - 1];
  const currentCandle = candles[candles.length - 1];
  const bodySize = Math.abs(currentCandle.close - currentCandle.open);
  const isHighVol = currentVol > volumeSma * 1.5;
  
  let vpaStatus: 'STRONG' | 'WEAK' | 'NEUTRAL' | 'ANOMALY' = 'NEUTRAL';
  if (isHighVol) {
      // Large spread and high volume = Validation
      if (bodySize > currentPrice * 0.0005) vpaStatus = 'STRONG';
      // Small spread and high volume = Churn/Anomaly
      else vpaStatus = 'ANOMALY';
  } else if (currentVol < volumeSma * 0.5) {
      vpaStatus = 'WEAK';
  }

  // --- NEW: FVG (Fair Value Gap) Detection ---
  // Look for 3-candle pattern where wicks don't overlap
  let fvgPrice: number | null = null;
  if (candles.length > 5) {
      // Check last few candles for unmitigated gaps
      for (let i = candles.length - 1; i >= candles.length - 3; i--) {
          const c1 = candles[i - 2];
          const c2 = candles[i - 1]; // Displacement candle
          const c3 = candles[i];

          // Bullish FVG: c1 High < c3 Low
          if (c2.close > c2.open && c1.high < c3.low) {
              fvgPrice = (c1.high + c3.low) / 2;
              break;
          }
          // Bearish FVG: c1 Low > c3 High
          else if (c2.close < c2.open && c1.low > c3.high) {
              fvgPrice = (c1.low + c3.high) / 2;
              break;
          }
      }
  }

  // --- 2.1 Trend Score ---
  // +1 if price > EMA20 > EMA200
  let trendScore = 0;
  if (currentPrice > ema20 && ema20 > ema50) trendScore = 1;
  else if (currentPrice < ema20 && ema20 < ema50) trendScore = -1;

  // --- 2.2 Momentum Score (RSI Divergence Proxy) ---
  let momentumScore = 0;
  if (rsi > 70) momentumScore = -0.8;
  else if (rsi < 30) momentumScore = 0.8;
  else if (rsi > 50) momentumScore = 0.2;
  else momentumScore = -0.2;

  // --- 2.3 Smart Money (CVD) ---
  let smartMoneyScore = safeMetrics.cvd > 0 ? 0.8 : -0.8;

  // --- 2.4 Liquidity Sweep ---
  let liquidationScore = safeMetrics.liquidationHeat;

  // --- 2.5 Funding Rate ---
  let fundingScore = safeMetrics.fundingRate < 0 ? 1 : -1;

  // --- 2.6 Open Interest ---
  let oiScore = safeMetrics.openInterest > 0 ? 0.5 : -0.5;

  // --- 2.7 Composite Signal Calculation ---
  const compositeScore = 
    (trendScore * 0.25) +
    (momentumScore * 0.15) +
    (smartMoneyScore * 0.15) +
    (liquidationScore * 0.15) +
    (fundingScore * 0.15) +
    (oiScore * 0.15);

  return {
    ema20,
    ema50,
    ema200,
    rsi,
    macd,
    volumeSma,
    fvgPrice,
    marketStructure,
    vpaStatus,
    trendScore,
    momentumScore,
    smartMoneyScore,
    liquidationScore,
    fundingScore,
    oiScore,
    compositeScore
  };
};