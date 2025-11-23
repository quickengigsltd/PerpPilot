export const AVAILABLE_PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'DOGE/USDT', 'RUNE/USDT'];

export const INITIAL_BALANCE = 10000; // Demo money

export const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];

// Mock initial prices for simulation
export const INITIAL_PRICES: Record<string, number> = {
  'BTC/USDT': 64200.50,
  'ETH/USDT': 3450.20,
  'SOL/USDT': 148.80,
  'XRP/USDT': 0.62,
  'DOGE/USDT': 0.12,
  'RUNE/USDT': 5.45,
};

export const SIGNAL_COLORS: Record<string, string> = {
  STRONG_LONG: 'text-bullish',
  WEAK_LONG: 'text-bullish/80',
  NEUTRAL: 'text-gray-400',
  WEAK_SHORT: 'text-bearish/80',
  STRONG_SHORT: 'text-bearish',
};

export const SIGNAL_BG_COLORS: Record<string, string> = {
  STRONG_LONG: 'bg-bullish/20 border-bullish/50',
  WEAK_LONG: 'bg-bullish/10 border-bullish/30',
  NEUTRAL: 'bg-gray-800/50 border-gray-700',
  WEAK_SHORT: 'bg-bearish/10 border-bearish/30',
  STRONG_SHORT: 'bg-bearish/20 border-bearish/50',
};