
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h';

export interface ChartSignal {
  time: number;
  type: 'BUY' | 'SELL';
  price: number;
  reason: string;
}

export interface OrderFlowMetrics {
  imbalanceRatio: number; // -1 (Ask Heavy) to 1 (Bid Heavy)
  cvdDivergence: 'BULLISH' | 'BEARISH' | 'NONE';
  stopHunt: 'BULLISH_SWEEP' | 'BEARISH_SWEEP' | 'NONE';
  buyingPressure: number; // 0-100 score
}

export interface TakerBuySellRatios {
  ratio1d: number;
  ratio3d: number;
  ratio7d: number;
  buyVol1d: number;
  sellVol1d: number;
}

export interface AdvancedMetrics {
  cvd: number; // Cumulative Volume Delta
  openInterest: number;
  fundingRate: number;
  liquidationHeat: number; // -1 (Longs getting rekt) to 1 (Shorts getting rekt)
  btcDominance: number; // Global market context
  orderFlow: OrderFlowMetrics; // The Devil Method Metrics
  takerRatios: TakerBuySellRatios; // NEW: 1D/3D/7D Ratios
}

export interface IndicatorValues {
  ema20: number;
  ema50: number;
  ema200: number;
  rsi: number;
  macd: number;
  volumeSma: number;
  
  // Bollinger Bands
  bollingerUpper: number;
  bollingerLower: number;
  bollingerMiddle: number;

  // New Core Indicators
  fvgPrice: number | null; // Nearest Fair Value Gap Price
  marketStructure: 'BULLISH' | 'BEARISH' | 'RANGING';
  vpaStatus: 'STRONG' | 'WEAK' | 'NEUTRAL' | 'ANOMALY';
  
  // Strategy Component Scores (-1 to 1)
  trendScore: number;
  momentumScore: number;
  smartMoneyScore: number; // CVD
  liquidationScore: number;
  fundingScore: number;
  oiScore: number;
  
  // Final Algorithmic Score
  compositeScore: number; // -1 to 1
}

export type SignalType = 'STRONG_LONG' | 'WEAK_LONG' | 'NEUTRAL' | 'WEAK_SHORT' | 'STRONG_SHORT';

export interface AISignal {
  type: SignalType;
  action: string; // "GO LONG", "GO SHORT", "WAIT"
  confidence: number; // 0-100
  reasoning: string;
  timestamp: number;
  indicators: IndicatorValues;
}

export interface GemAnalysis {
  pair: string;
  mode: 'GEM' | 'SCALP';
  score: number; // 0-100
  verdict: 'GENERATIONAL_BUY' | 'GOOD_DIP' | 'WAIT_LOWER' | 'DO_NOT_TOUCH' | 'LONG_SCALP' | 'SHORT_SCALP' | 'WAIT_FOR_ENTRY';
  potentialMultiplier: string; // e.g., "2x - 5x" or "1.5% - 3%"
  riskLevel: 'DEGEN' | 'HIGH' | 'MODERATE' | 'SAFE';
  entryZone: string;
  stopLoss: string;
  tpTargets: string[];
  volumeScore: number; // 0-10
  volatilityScore: number; // 0-10
  keyCatalysts: string[];
  analysis: string;
}

export interface Position {
  id: string;
  pair: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  amount: number; // In USDT
  leverage: number;
  liquidationPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: number;
  takeProfit?: number;
  stopLoss?: number;
}

export interface TradeHistoryItem extends Position {
  exitPrice: number;
  exitTime: number;
  status: 'CLOSED_PROFIT' | 'CLOSED_LOSS' | 'LIQUIDATED';
}

// --- NEW WHALE ANALYSIS TYPES ---
export interface ExchangeData {
  name: string;
  buyVolume: number;
  sellVolume: number;
  buyPercent: number;
  sellPercent: number;
  volume: number; // Total volume helper
}

export interface WhaleStats {
  exchanges: ExchangeData[];
  longPercentage: number;
  shortPercentage: number;
  longCount: number;
  shortCount: number;
  totalLiquidation: number;
  longLiquidation: number;
  shortLiquidation: number;
}

export interface MacroStats {
  high30d: number;
  low30d: number;
  drawdownFromHigh: number; // Percentage down from 30d high
  pumpFromLow: number; // Percentage up from 30d low
  trend30d: 'UP' | 'DOWN' | 'SIDEWAYS';
}

export interface MarketState {
  pair: string;
  price: number;
  change24h: number;
  candles: Candle[];
  metrics: AdvancedMetrics;
  indicators: IndicatorValues;
  whaleStats?: WhaleStats;
  macroStats?: MacroStats;
  isRealtime: boolean;
  timeframe: Timeframe;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  WHALE_ANALYSIS = 'WHALE_ANALYSIS',
  AI_TRADER = 'AI_TRADER',
  GEM_HUNTER = 'GEM_HUNTER',
}
