

export const AVAILABLE_PAIRS = [
  'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT', 
  'DOGE/USDT', 'ADA/USDT', 'AVAX/USDT', 'SHIB/USDT', 'DOT/USDT', 
  'LINK/USDT', 'TRX/USDT', 'MATIC/USDT', 'BCH/USDT', 'UNI/USDT', 
  'LTC/USDT', 'NEAR/USDT', 'APT/USDT', 'ICP/USDT', 'ETC/USDT', 
  'FIL/USDT', 'ARB/USDT', 'RNDR/USDT', 'ATOM/USDT', 'STX/USDT',
  'INJ/USDT', 'OP/USDT', 'IMX/USDT', 'RUNE/USDT', 'PEPE/USDT',
  'WIF/USDT', 'BONK/USDT', 'FET/USDT', 'AGIX/USDT', 'AAVE/USDT'
];

export const INITIAL_BALANCE = 10000; // Demo money

export const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h'];

// Mock initial prices for simulation (will be overwritten by live data immediately)
export const INITIAL_PRICES: Record<string, number> = {
  'BTC/USDT': 64200.50,
  'ETH/USDT': 3450.20,
  'BNB/USDT': 590.10,
  'SOL/USDT': 148.80,
  'XRP/USDT': 0.62,
  'DOGE/USDT': 0.16,
  'ADA/USDT': 0.45,
  'AVAX/USDT': 35.20,
  'SHIB/USDT': 0.000025,
  'DOT/USDT': 7.20,
  'LINK/USDT': 14.50,
  'TRX/USDT': 0.12,
  'MATIC/USDT': 0.70,
  'BCH/USDT': 450.00,
  'UNI/USDT': 7.50,
  'LTC/USDT': 82.00,
  'NEAR/USDT': 5.50,
  'APT/USDT': 9.20,
  'ICP/USDT': 12.00,
  'ETC/USDT': 25.00,
  'FIL/USDT': 5.80,
  'ARB/USDT': 1.10,
  'RNDR/USDT': 7.80,
  'ATOM/USDT': 8.50,
  'STX/USDT': 2.10,
  'INJ/USDT': 25.50,
  'OP/USDT': 2.50,
  'IMX/USDT': 2.00,
  'RUNE/USDT': 5.45,
  'PEPE/USDT': 0.0000075,
  'WIF/USDT': 2.50,
  'BONK/USDT': 0.000024,
  'FET/USDT': 2.20,
  'AGIX/USDT': 0.95,
  'AAVE/USDT': 95.00
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