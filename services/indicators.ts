
import { Candle, IndicatorValues, AdvancedMetrics, ChartSignal } from '../types';

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

// Helper for MACD Series
export const calculateMACDSeries = (data: number[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
    const fastEMA = calculateEMASeries(data, fastPeriod);
    const slowEMA = calculateEMASeries(data, slowPeriod);
    const macdLine = fastEMA.map((f, i) => f - slowEMA[i]);
    const signalLine = calculateEMASeries(macdLine, signalPeriod);
    const histogram = macdLine.map((m, i) => m - signalLine[i]);
    return { macdLine, signalLine, histogram };
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

// --- GUARDIAN AI SIGNAL LOGIC (V4.0 - HYBRID SCALP/TREND) ---
export const detectSniperSignals = (candles: Candle[], rsiSeries: number[]): ChartSignal[] => {
    const signals: ChartSignal[] = [];
    if (candles.length < 50) return signals;

    const closes = candles.map(c => c.close);
    
    // 1. INDICATOR SERIES
    const ema200 = calculateEMASeries(closes, 200); // The "Trend Guardian"
    const ema50 = calculateEMASeries(closes, 50);   // The "Trend Support"
    const ema21 = calculateEMASeries(closes, 21);   // Slow Scalp
    const ema9 = calculateEMASeries(closes, 9);     // Fast Scalp
    
    const { histogram } = calculateMACDSeries(closes);

    // Volume SMA for filtering fake moves
    const volumes = candles.map(c => c.volume);
    const volSma = volumes.map((v, i) => {
        const start = Math.max(0, i - 20);
        const slice = volumes.slice(start, i + 1);
        return slice.reduce((a, b) => a + b, 0) / slice.length;
    });

    const calculateBBAt = (idx: number) => {
        const slice = closes.slice(Math.max(0, idx - 20), idx + 1);
        const sma = slice.reduce((a, b) => a + b, 0) / slice.length;
        const stdDev = calculateStandardDeviation(slice, sma);
        return { upper: sma + (stdDev * 2.0), lower: sma - (stdDev * 2.0) };
    };

    // Iterate through candles
    // We start a bit late to let indicators stabilize
    for (let i = 50; i < candles.length; i++) {
        const c = candles[i];
        const prevC = candles[i-1];
        const rsi = rsiSeries[i];
        
        // Context
        const trendEMA = ema200[i];
        const fastEMA = ema9[i];
        const slowEMA = ema21[i];
        const prevFastEMA = ema9[i-1];
        const prevSlowEMA = ema21[i-1];

        const bb = calculateBBAt(i);
        const volumeHigh = c.volume > volSma[i]; // Above average volume

        // --- STRATEGY 1: SCALP CROSSOVER (EMA 9/21) ---
        // Fast signals for the "buy sell buy sell" feel, but filtered by RSI to avoid buying tops.
        const goldenCross = prevFastEMA <= prevSlowEMA && fastEMA > slowEMA;
        const deathCross = prevFastEMA >= prevSlowEMA && fastEMA < slowEMA;

        // --- STRATEGY 2: TREND PULLBACK ---
        // Safer signals. Trend is Up, price dips.
        const isUptrend = c.close > trendEMA;
        const isDowntrend = c.close < trendEMA;

        // --- LOGIC: BUY SIGNALS ---
        let buyReason = '';
        let isBuy = false;

        // A. Safe Trend Pullback
        if (isUptrend && rsi < 45 && c.low <= ema50[i] * 1.002) {
             isBuy = true;
             buyReason = 'Trend Dip';
        }
        // B. Scalp Entry (Golden Cross)
        else if (goldenCross && rsi < 65) { 
             // Only take cross if not already overbought
             isBuy = true;
             buyReason = 'Scalp Cross';
        }
        // C. Oversold Reversal (Crash Protection)
        else if (rsi < 25 && c.close > c.open) {
             isBuy = true;
             buyReason = 'Oversold Bounce';
        }

        if (isBuy) {
            // Volume Filter: Don't buy on tiny volume unless it's a crash bounce
            if (buyReason === 'Oversold Bounce' || volumeHigh) {
                 // Cooldown check: Don't spam BUY if we just bought 2 candles ago
                 const lastSignal = signals[signals.length - 1];
                 const minutesSinceLast = lastSignal ? (c.time - lastSignal.time) / 60000 : 999;
                 
                 // If flipping from SELL to BUY, instant allowed.
                 // If BUY to BUY, wait 5 mins.
                 if (!lastSignal || lastSignal.type === 'SELL' || minutesSinceLast > 3) {
                     signals.push({ time: c.time, type: 'BUY', price: c.low, reason: buyReason });
                 }
            }
        }

        // --- LOGIC: SELL SIGNALS ---
        let sellReason = '';
        let isSell = false;

        // A. Safe Trend Rejection
        if (isDowntrend && rsi > 55 && c.high >= ema50[i] * 0.998) {
            isSell = true;
            sellReason = 'Trend Resist';
        }
        // B. Scalp Exit (Death Cross)
        else if (deathCross && rsi > 35) {
            isSell = true;
            sellReason = 'Scalp Cross';
        }
        // C. Euphoria Top (Crash Protection)
        else if (rsi > 80 && c.close < c.open) {
            isSell = true;
            sellReason = 'Climax Top';
        }

        if (isSell) {
            if (sellReason === 'Climax Top' || volumeHigh) {
                 const lastSignal = signals[signals.length - 1];
                 const minutesSinceLast = lastSignal ? (c.time - lastSignal.time) / 60000 : 999;
                 
                 if (!lastSignal || lastSignal.type === 'BUY' || minutesSinceLast > 3) {
                     signals.push({ time: c.time, type: 'SELL', price: c.high, reason: sellReason });
                 }
            }
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
    btcDominance: 54
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
