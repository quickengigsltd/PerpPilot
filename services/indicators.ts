
import { Candle, IndicatorValues, AdvancedMetrics, ChartSignal, OrderFlowMetrics } from '../types';

export const calculateEMA = (data: number[], period: number): number => {
  if (data.length < period) return data[data.length - 1];
  const k = 2 / (period + 1);
  let ema = data[0];
  for (let i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return ema;
};

// Helper for Series EMA calculation
export const calculateEMASeries = (data: number[], period: number): number[] => {
  const k = 2 / (period + 1);
  const emaArray: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    const val = data[i] !== undefined ? data[i] : emaArray[i-1];
    emaArray.push(val * k + emaArray[i - 1] * (1 - k));
  }
  return emaArray;
};

export const calculateStandardDeviation = (data: number[], average: number): number => {
  const squareDiffs = data.map(value => {
    const diff = value - average;
    return diff * diff;
  });
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
};

export const calculateBollingerBands = (data: number[], period: number = 20, multiplier: number = 2.0) => {
  if (data.length < period) return { upper: data[data.length-1], lower: data[data.length-1], middle: data[data.length-1] };
  
  const slice = data.slice(-period);
  const sma = slice.reduce((a, b) => a + b, 0) / period;
  const stdDev = calculateStandardDeviation(slice, sma);
  
  return {
    upper: sma + (stdDev * multiplier),
    lower: sma - (stdDev * multiplier),
    middle: sma
  };
};

// Efficient Series Calculation for detecting signals over history
export const calculateBollingerBandsSeries = (data: number[], period: number = 20, multiplier: number = 2.0) => {
    const upper: number[] = [];
    const lower: number[] = [];
    const middle: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
        if (i < period) {
            // Not enough data yet, just use current price to avoid crashes
            upper.push(data[i]);
            lower.push(data[i]);
            middle.push(data[i]);
            continue;
        }
        const slice = data.slice(i - period + 1, i + 1);
        const sma = slice.reduce((a, b) => a + b, 0) / period;
        const stdDev = calculateStandardDeviation(slice, sma);
        upper.push(sma + stdDev * multiplier);
        lower.push(sma - stdDev * multiplier);
        middle.push(sma);
    }
    return { upper, lower, middle };
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

export const calculateRSISeries = (closes: number[], period: number = 14): number[] => {
  const rsiArray: number[] = new Array(closes.length).fill(50);
  if (closes.length <= period) return rsiArray;

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

    let rsi = 50;
    if (avgLoss === 0) {
      rsi = 100;
    } else if (avgGain === 0) {
      rsi = 0;
    } else {
      const rs = avgGain / avgLoss;
      rsi = 100 - (100 / (1 + rs));
    }
    rsiArray[i] = rsi;
  }
  return rsiArray;
};

// --- MICROSTRUCTURE ANALYSIS (THE DEVIL METHOD) ---
export const calculateOrderFlowMetrics = (
  candles: Candle[], 
  cvdHistory: number[]
): OrderFlowMetrics => {
  if (candles.length < 20 || cvdHistory.length < 20) {
    return { imbalanceRatio: 0, cvdDivergence: 'NONE', stopHunt: 'NONE', buyingPressure: 50 };
  }

  const currentCandle = candles[candles.length - 1];
  const currentCVD = cvdHistory[cvdHistory.length - 1];
  
  // 1. ORDER BOOK IMBALANCE (Simulated via Taker Volume Ratio)
  const recentVol = candles.slice(-5);
  let buyVol = 0;
  let totalVol = 0;
  recentVol.forEach((c) => {
     const approxBuy = c.close >= c.open ? c.volume * 0.7 : c.volume * 0.3; 
     buyVol += approxBuy;
     totalVol += c.volume;
  });
  
  const imbalanceRaw = totalVol > 0 ? (buyVol / totalVol) : 0.5;
  const imbalanceRatio = (imbalanceRaw - 0.5) * 2; 

  // 2. CVD DIVERGENCE
  let cvdDivergence: 'BULLISH' | 'BEARISH' | 'NONE' = 'NONE';
  const lookback = 20;
  
  const prices = candles.map(c => c.close).slice(-lookback);
  const cvds = cvdHistory.slice(-lookback);
  
  const lowestPriceIdx = prices.indexOf(Math.min(...prices));
  const lowestCVDIdx = cvds.indexOf(Math.min(...cvds));
  
  const highestPriceIdx = prices.indexOf(Math.max(...prices));
  const highestCVDIdx = cvds.indexOf(Math.max(...cvds));

  if (lowestPriceIdx === prices.length - 1 && lowestCVDIdx !== cvds.length - 1) {
     const cvdDiff = currentCVD - cvds[lowestCVDIdx];
     if (cvdDiff > 0) cvdDivergence = 'BULLISH';
  }

  if (highestPriceIdx === prices.length - 1 && highestCVDIdx !== cvds.length - 1) {
     const cvdDiff = cvds[highestCVDIdx] - currentCVD;
     if (cvdDiff > 0) cvdDivergence = 'BEARISH';
  }

  // 3. STOP HUNT DETECTION
  let stopHunt: 'BULLISH_SWEEP' | 'BEARISH_SWEEP' | 'NONE' = 'NONE';
  const prevLow = Math.min(...candles.slice(-10, -2).map(c => c.low));
  const prevHigh = Math.max(...candles.slice(-10, -2).map(c => c.high));

  if (currentCandle.low < prevLow && currentCandle.close > prevLow) {
      stopHunt = 'BULLISH_SWEEP';
  }
  else if (currentCandle.high > prevHigh && currentCandle.close < prevHigh) {
      stopHunt = 'BEARISH_SWEEP';
  }

  // 4. Buying Pressure Score
  let pressure = 50;
  pressure += imbalanceRatio * 30; 
  if (cvdDivergence === 'BULLISH') pressure += 20;
  if (cvdDivergence === 'BEARISH') pressure -= 20;
  if (stopHunt === 'BULLISH_SWEEP') pressure += 15;
  if (stopHunt === 'BEARISH_SWEEP') pressure -= 15;

  return {
      imbalanceRatio,
      cvdDivergence,
      stopHunt,
      buyingPressure: Math.min(Math.max(pressure, 0), 100)
  };
};

// STATE-BASED CLEAN TREND SIGNALS
// Designed to minimize noise: Max ~2 signals per frame.
// Logic: Hold profit until trend breaks definitively.
export const detectSniperSignals = (candles: Candle[], rsiSeries: number[]): ChartSignal[] => {
    const signals: ChartSignal[] = [];
    if (candles.length < 50) return signals;

    const closes = candles.map(c => c.close);
    
    // EMA 50 is our Major Trend Baseline (The "Anchor")
    const ema50 = calculateEMASeries(closes, 50);
    // EMA 20 is our Fast Signal Line
    const ema20 = calculateEMASeries(closes, 20);

    let currentPosition: 'LONG' | 'SHORT' | null = null;
    let lastSignalIndex = 0;
    const COOLDOWN = 8; // Candles to wait before flipping again (prevents chop)

    // Iterate through history to build state
    for (let i = 50; i < candles.length; i++) {
        const c = candles[i];
        const rsi = rsiSeries[i];
        const trendBase = ema50[i];
        
        // Skip if within cooldown period of last signal
        if (i - lastSignalIndex < COOLDOWN) continue;

        const isAboveTrend = c.close > trendBase;
        const isBelowTrend = c.close < trendBase;

        // --- 1. ENTRY LOGIC ---
        if (currentPosition === null) {
            // LONG ENTRY: Price crosses above EMA 50 with decent RSI
            if (isAboveTrend && closes[i-1] <= ema50[i-1]) {
                if (rsi > 45) { // Filter weak breakouts
                    currentPosition = 'LONG';
                    lastSignalIndex = i;
                    signals.push({ time: c.time, type: 'BUY', price: c.low, reason: 'Trend Start' });
                }
            }
            // SHORT ENTRY: Price crosses below EMA 50
            else if (isBelowTrend && closes[i-1] >= ema50[i-1]) {
                 if (rsi < 55) {
                    currentPosition = 'SHORT';
                    lastSignalIndex = i;
                    signals.push({ time: c.time, type: 'SELL', price: c.high, reason: 'Trend Start' });
                 }
            }
        }

        // --- 2. HOLDING LONG ---
        else if (currentPosition === 'LONG') {
            // EXIT: Only sell if price definitively breaks EMA 50 Trend Support
            if (c.close < trendBase) {
                currentPosition = null; 
                // Immediate flip? Check momentum
                if (rsi < 45) {
                     currentPosition = 'SHORT';
                     lastSignalIndex = i;
                     signals.push({ time: c.time, type: 'SELL', price: c.high, reason: 'Trend Flip' });
                } else {
                     lastSignalIndex = i;
                     signals.push({ time: c.time, type: 'SELL', price: c.high, reason: 'Take Profit' });
                }
            }
            // ELSE: DO NOTHING. HOLD THE LONG.
        }

        // --- 3. HOLDING SHORT ---
        else if (currentPosition === 'SHORT') {
            // EXIT: Only buy if price definitively breaks EMA 50 Trend Resistance
            if (c.close > trendBase) {
                currentPosition = null;
                if (rsi > 55) {
                    currentPosition = 'LONG';
                    lastSignalIndex = i;
                    signals.push({ time: c.time, type: 'BUY', price: c.low, reason: 'Trend Flip' });
                } else {
                    lastSignalIndex = i;
                    signals.push({ time: c.time, type: 'BUY', price: c.low, reason: 'Take Profit' });
                }
            }
            // ELSE: DO NOTHING. HOLD THE SHORT.
        }
    }

    return signals;
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

  const bb = calculateBollingerBands(closes, 20, 2);

  const safeMetrics = metrics || {
    cvd: 0,
    openInterest: 0,
    fundingRate: 0,
    liquidationHeat: 0,
    btcDominance: 54,
    orderFlow: { imbalanceRatio: 0, cvdDivergence: 'NONE', stopHunt: 'NONE', buyingPressure: 50 },
    takerRatios: { ratio1d: 1, ratio3d: 1, ratio7d: 1, buyVol1d: 0, sellVol1d: 0 }
  };

  let marketStructure: 'BULLISH' | 'BEARISH' | 'RANGING' = 'RANGING';
  if (candles.length > 20) {
      const recentCandles = candles.slice(-15);
      const highs = recentCandles.map(c => c.high);
      const lows = recentCandles.map(c => c.low);
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

  const currentVol = volumes[volumes.length - 1];
  const currentCandle = candles[candles.length - 1];
  const bodySize = Math.abs(currentCandle.close - currentCandle.open);
  const isHighVol = currentVol > volumeSma * 1.5;
  
  let vpaStatus: 'STRONG' | 'WEAK' | 'NEUTRAL' | 'ANOMALY' = 'NEUTRAL';
  if (isHighVol) {
      if (bodySize > currentPrice * 0.0005) vpaStatus = 'STRONG';
      else vpaStatus = 'ANOMALY';
  } else if (currentVol < volumeSma * 0.5) {
      vpaStatus = 'WEAK';
  }

  let fvgPrice: number | null = null;
  if (candles.length > 5) {
      for (let i = candles.length - 1; i >= candles.length - 3; i--) {
          const c1 = candles[i - 2];
          const c2 = candles[i - 1]; 
          const c3 = candles[i];
          if (c2.close > c2.open && c1.high < c3.low) {
              fvgPrice = (c1.high + c3.low) / 2;
              break;
          }
          else if (c2.close < c2.open && c1.low > c3.high) {
              fvgPrice = (c1.low + c3.high) / 2;
              break;
          }
      }
  }

  let trendScore = 0;
  if (currentPrice > ema200) trendScore += 0.5;
  if (currentPrice > ema50) trendScore += 0.5;
  if (currentPrice < ema200) trendScore -= 0.5;
  if (currentPrice < ema50) trendScore -= 0.5;

  let momentumScore = 0;
  if (rsi > 70) momentumScore = -0.8;
  else if (rsi < 30) momentumScore = 0.8;
  else if (rsi > 50) momentumScore = 0.2;
  else momentumScore = -0.2;

  let smartMoneyScore = safeMetrics.cvd > 0 ? 0.8 : -0.8;
  let liquidationScore = safeMetrics.liquidationHeat;
  let fundingScore = safeMetrics.fundingRate < 0 ? 1 : -1;
  let oiScore = safeMetrics.openInterest > 0 ? 0.5 : -0.5;

  const compositeScore = 
    (trendScore * 0.30) +
    (momentumScore * 0.20) +
    (smartMoneyScore * 0.15) +
    (liquidationScore * 0.10) +
    (fundingScore * 0.10) +
    (oiScore * 0.15);

  return {
    ema20,
    ema50,
    ema200,
    rsi,
    macd,
    volumeSma,
    bollingerUpper: bb.upper,
    bollingerLower: bb.lower,
    bollingerMiddle: bb.middle,
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
