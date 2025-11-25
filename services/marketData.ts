
import { Candle, MarketState, AdvancedMetrics, WhaleStats, MacroStats, Timeframe, TakerBuySellRatios } from '../types';
import { calculateIndicators, calculateOrderFlowMetrics } from './indicators';

// Constants for Binance API
const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/stream';
const BINANCE_REST_BASE = 'https://api.binance.com/api/v3';

// Map our generic pair names to Binance symbols
const SYMBOL_MAP: Record<string, string> = {
  'BTC/USDT': 'btcusdt',
  'ETH/USDT': 'ethusdt',
  'BNB/USDT': 'bnbusdt',
  'SOL/USDT': 'solusdt',
  'XRP/USDT': 'xrpusdt',
  'DOGE/USDT': 'dogeusdt',
  'ADA/USDT': 'adausdt',
  'AVAX/USDT': 'avaxusdt',
  'SHIB/USDT': 'shibusdt',
  'DOT/USDT': 'dotusdt',
  'LINK/USDT': 'linkusdt',
  'TRX/USDT': 'trxusdt',
  'MATIC/USDT': 'maticusdt',
  'BCH/USDT': 'bchusdt',
  'UNI/USDT': 'uniusdt',
  'LTC/USDT': 'ltcusdt',
  'NEAR/USDT': 'nearusdt',
  'APT/USDT': 'aptusdt',
  'ICP/USDT': 'icpusdt',
  'ETC/USDT': 'etcusdt',
  'FIL/USDT': 'filusdt',
  'ARB/USDT': 'arbusdt',
  'RNDR/USDT': 'rndrusdt',
  'ATOM/USDT': 'atomusdt',
  'STX/USDT': 'stxusdt',
  'INJ/USDT': 'injusdt',
  'OP/USDT': 'opusdt',
  'IMX/USDT': 'imxusdt',
  'RUNE/USDT': 'runeusdt',
  'PEPE/USDT': 'pepeusdt',
  'WIF/USDT': 'wifusdt',
  'BONK/USDT': 'bonkusdt',
  'FET/USDT': 'fetusdt',
  'AGIX/USDT': 'agixusdt',
  'AAVE/USDT': 'aaveusdt',
  'NIL/USDT': 'nilusdt'
};

interface MetricState {
  cumulativeVolumeDelta: number;
  cvdHistory: number[]; // Store history for divergence
  volatilityIndex: number;
  trendMomentum: number;
  realBuyVolume1D: number;
  realSellVolume1D: number;
  takerRatios: TakerBuySellRatios; // Stored here to persist between updates
}

export class MarketService {
  private data: Record<string, Candle[]> = {};
  private metricState: Record<string, MetricState> = {};
  private latestStates: Record<string, MarketState> = {}; 
  private listeners: Array<(pair: string, data: MarketState) => void> = [];
  private ws: WebSocket | null = null;
  private isConnected = false;
  private activeTimeframe: Timeframe = '5m'; // Default to 5m for Microstructure

  constructor() {
    Object.keys(SYMBOL_MAP).forEach((pair) => {
      this.data[pair] = [];
      this.metricState[pair] = {
        cumulativeVolumeDelta: 0,
        cvdHistory: [],
        volatilityIndex: 0,
        trendMomentum: 0,
        realBuyVolume1D: 0,
        realSellVolume1D: 0,
        takerRatios: { ratio1d: 1, ratio3d: 1, ratio7d: 1, buyVol1d: 0, sellVol1d: 0 }
      };
    });
  }

  start() {
    if (this.isConnected) return;
    this.fetchAllHistory().then(() => {
        this.connectWebSocket();
    });
  }

  getMarketState(pair: string): MarketState | null {
    return this.latestStates[pair] || null;
  }

  async switchTimeframe(tf: Timeframe) {
      if (tf === this.activeTimeframe) return;
      this.activeTimeframe = tf;
      console.log(`Switching timeframe to ${tf}`);
      await this.fetchAllHistory();
  }

  private async fetchAllHistory() {
    const promises = Object.keys(SYMBOL_MAP).map(async (pair) => {
      try {
        const symbol = SYMBOL_MAP[pair].toUpperCase();
        
        // Fetch Candles for Selected Timeframe (Last 100 bars)
        const klineResponse = await fetch(`${BINANCE_REST_BASE}/klines?symbol=${symbol}&interval=${this.activeTimeframe}&limit=100`);
        const klineData = await klineResponse.json();
        
        // Fetch 1d Candles for Macro Context
        const dailyResponse = await fetch(`${BINANCE_REST_BASE}/klines?symbol=${symbol}&interval=1d&limit=30`);
        const dailyData = await dailyResponse.json();

        if (Array.isArray(klineData) && Array.isArray(dailyData)) {
            const candles: Candle[] = klineData.map((d: any[]) => ({
                time: d[0],
                open: parseFloat(d[1]),
                high: parseFloat(d[2]),
                low: parseFloat(d[3]),
                close: parseFloat(d[4]),
                volume: parseFloat(d[5]),
            }));

            this.data[pair] = candles;
            
            // Calculate Multi-Timeframe Taker Ratios (1D, 3D, 7D)
            const calculatedRatios = this.calculateTakerRatios(dailyData);

            // Re-init Metrics (CVD) based on this history
            this.initializeMetrics(pair, candles, klineData, calculatedRatios);

            // --- MACRO STATS ---
            if (dailyData && dailyData.length > 0) {
                const dailyHighs = dailyData.map((d: any[]) => parseFloat(d[2]));
                const dailyLows = dailyData.map((d: any[]) => parseFloat(d[3]));
                const currentClose = parseFloat(dailyData[dailyData.length - 1][4]);
                
                const high30d = Math.max(...dailyHighs);
                const low30d = Math.min(...dailyLows);
                
                // For legacy WhaleStats support (1D view)
                const today = dailyData[dailyData.length - 1];
                const totalVolUSD = parseFloat(today[7]);
                const buyVolUSD = parseFloat(today[10]);
                const sellVolUSD = totalVolUSD - buyVolUSD;
                
                if (this.metricState[pair]) {
                    this.metricState[pair].realBuyVolume1D = buyVolUSD;
                    this.metricState[pair].realSellVolume1D = sellVolUSD;
                    
                    const firstPrice = parseFloat(dailyData[0][4]);
                    const trendDiff = ((currentClose - firstPrice) / firstPrice) * 100;
                    let trend30d: 'UP' | 'DOWN' | 'SIDEWAYS' = 'SIDEWAYS';
                    if (trendDiff > 10) trend30d = 'UP';
                    else if (trendDiff < -10) trend30d = 'DOWN';

                    (this.metricState[pair] as any).macro = {
                        high30d,
                        low30d,
                        drawdownFromHigh: ((high30d - currentClose) / high30d) * 100,
                        pumpFromLow: ((currentClose - low30d) / low30d) * 100,
                        trend30d
                    };
                }
            }
            this.notify(pair);
        }
      } catch (e) {
        console.warn(`Failed to fetch history for ${pair}.`);
      }
    });
    await Promise.all(promises);
  }

  private calculateTakerRatios(dailyData: any[]): TakerBuySellRatios {
      // dailyData is array of klines. Index 7 is QuoteVol, Index 10 is TakerBuyQuoteVol.
      // We need to sum up volumes for last 1, 3, 7 days.
      
      const calcRatio = (days: number) => {
          if (dailyData.length < days) return 1.0;
          const slice = dailyData.slice(-days);
          let totalBuy = 0;
          let totalVol = 0;
          
          slice.forEach(d => {
              const qVol = parseFloat(d[7]);
              const tBuyQVol = parseFloat(d[10]);
              totalVol += qVol;
              totalBuy += tBuyQVol;
          });
          
          const totalSell = totalVol - totalBuy;
          return totalSell > 0 ? totalBuy / totalSell : 1.0;
      };

      // For 1D specific values (to show in UI cards)
      const lastDay = dailyData[dailyData.length - 1];
      const buy1d = parseFloat(lastDay[10]);
      const vol1d = parseFloat(lastDay[7]);
      const sell1d = vol1d - buy1d;

      return {
          ratio1d: calcRatio(1),
          ratio3d: calcRatio(3),
          ratio7d: calcRatio(7),
          buyVol1d: buy1d,
          sellVol1d: sell1d
      };
  }

  private initializeMetrics(pair: string, candles: Candle[], rawData: any[], ratios: TakerBuySellRatios) {
      let cvd = 0;
      const cvdHist: number[] = [];
      
      // Calculate CVD history from the fetched klines
      rawData.forEach((d, i) => {
          const totalVol = parseFloat(d[5]);
          const takerBuyVol = parseFloat(d[9]); 
          const takerSellVol = totalVol - takerBuyVol;
          const delta = takerBuyVol - takerSellVol;
          cvd += delta;
          cvdHist.push(cvd);
      });
      
      const volatility = candles.slice(-20).reduce((acc, c) => acc + ((c.high - c.low)/c.close), 0) / 20 * 1000;

      if (this.metricState[pair]) {
          this.metricState[pair].cumulativeVolumeDelta = cvd;
          this.metricState[pair].cvdHistory = cvdHist;
          this.metricState[pair].volatilityIndex = volatility;
          this.metricState[pair].takerRatios = ratios;
      }
  }

  private connectWebSocket() {
    if (this.ws) return;
    const streams = Object.values(SYMBOL_MAP).map(s => `${s}@kline_1m`).join('/');
    this.ws = new WebSocket(`${BINANCE_WS_BASE}?streams=${streams}`);

    this.ws.onopen = () => {
      this.isConnected = true;
      console.log('Connected to Binance WebSocket');
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const streamName = message.stream;
        const kline = message.data.k; 
        
        const pair = Object.keys(SYMBOL_MAP).find(p => streamName.includes(SYMBOL_MAP[p]));
        if (!pair) return;

        const newCandle: Candle = {
          time: kline.t,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
          volume: parseFloat(kline.v),
        };

        const takerBuyVolume = parseFloat(kline.V);

        this.handleNewCandle(pair, newCandle, kline.x, takerBuyVolume);
      } catch (e) {
        console.error('Error parsing WS message', e);
      }
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      this.ws = null;
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  private handleNewCandle(pair: string, liveCandle: Candle, isClosed: boolean, takerBuyVolume: number) {
    const currentHistory = this.data[pair];
    if (!currentHistory || currentHistory.length === 0) return;

    const lastCandle = currentHistory[currentHistory.length - 1];
    let updatedHistory = [...currentHistory];
    
    updatedHistory[updatedHistory.length - 1] = {
        ...lastCandle,
        close: liveCandle.close,
        high: Math.max(lastCandle.high, liveCandle.high),
        low: Math.min(lastCandle.low, liveCandle.low),
        volume: lastCandle.volume + liveCandle.volume 
    };

    this.data[pair] = updatedHistory;
    
    this.updateRealtimeMetrics(pair, liveCandle, takerBuyVolume);
    this.notify(pair);
  }

  private updateRealtimeMetrics(pair: string, currentCandle: Candle, cumulativeTakerBuyVol: number) {
      const state = this.metricState[pair];
      
      const totalVol = currentCandle.volume;
      const takerSellVol = totalVol - cumulativeTakerBuyVol;
      const candleDelta = cumulativeTakerBuyVol - takerSellVol;

      // Update CVD
      state.cumulativeVolumeDelta += (candleDelta * 0.1); 
      // Push to history for divergence checks (limit size)
      state.cvdHistory.push(state.cumulativeVolumeDelta);
      if (state.cvdHistory.length > 200) state.cvdHistory.shift();
      
      const price = currentCandle.close;
      state.realBuyVolume1D += (cumulativeTakerBuyVol * price * 0.0001); 
      state.realSellVolume1D += (takerSellVol * price * 0.0001);

      const range = (currentCandle.high - currentCandle.low) / currentCandle.close;
      state.volatilityIndex = range * 10000;
  }

  private calculateWhaleStats(pair: string, price: number, metrics: MetricState): WhaleStats {
    const binanceBuy = metrics.realBuyVolume1D;
    const binanceSell = metrics.realSellVolume1D;
    const totalBinance = binanceBuy + binanceSell;
    
    const safeTotal = totalBinance || 1;
    const binanceBuyPct = (binanceBuy / safeTotal) * 100;
    
    // Project other exchanges
    const exchangeRatios = [
        { name: 'Binance', ratio: 1.0 }, 
        { name: 'OKX', ratio: 0.45 },
        { name: 'Bybit', ratio: 0.38 },
        { name: 'Gate', ratio: 0.35 },
    ];

    const exchanges = exchangeRatios.map(ex => {
        if (ex.name === 'Binance') {
            return {
                name: ex.name,
                buyVolume: binanceBuy,
                sellVolume: binanceSell,
                buyPercent: binanceBuyPct,
                sellPercent: 100 - binanceBuyPct,
                volume: totalBinance
            };
        }

        const vol = totalBinance * ex.ratio;
        const projectedBuyPct = Math.min(Math.max(binanceBuyPct, 20), 80);
        
        const buyVol = vol * (projectedBuyPct / 100);
        const sellVol = vol - buyVol;

        return {
            name: ex.name,
            buyVolume: buyVol,
            sellVolume: sellVol,
            buyPercent: projectedBuyPct,
            sellPercent: 100 - projectedBuyPct,
            volume: vol
        };
    });

    const longRatio = Math.min(Math.max(binanceBuyPct / 100, 0.3), 0.7);
    const totalAccounts = 8540; 
    const longCount = Math.floor(totalAccounts * longRatio);
    const estimatedTotalLiq = 15_000_000 * metrics.volatilityIndex;
    
    return {
        exchanges,
        longPercentage: longRatio * 100,
        shortPercentage: (1 - longRatio) * 100,
        longCount,
        shortCount: totalAccounts - longCount,
        totalLiquidation: estimatedTotalLiq,
        longLiquidation: estimatedTotalLiq * (1 - longRatio),
        shortLiquidation: estimatedTotalLiq * longRatio
    };
  }

  stop() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  subscribe(callback: (pair: string, data: MarketState) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify(pair: string) {
    const candles = this.data[pair];
    if (!candles || candles.length === 0) return;

    const last = candles[candles.length - 1];
    const mState = this.metricState[pair];
    
    // Calculate new microstructure metrics
    const orderFlow = calculateOrderFlowMetrics(candles, mState.cvdHistory);

    const metrics: AdvancedMetrics = {
        cvd: mState.cumulativeVolumeDelta,
        openInterest: mState.volatilityIndex * 1000,
        fundingRate: 0.0001, // Default positive funding for bull bias example
        liquidationHeat: Math.min(Math.max((mState.volatilityIndex - 20) / 50, -1), 1),
        btcDominance: 54.2,
        orderFlow,
        takerRatios: mState.takerRatios // Include computed ratios
    };

    const indicators = calculateIndicators(candles, metrics);
    const whaleStats = this.calculateWhaleStats(pair, last.close, mState);
    
    const macroStats = (mState as any).macro || {
        high30d: last.close * 1.1,
        low30d: last.close * 0.9,
        trend30d: 'SIDEWAYS'
    };
    
    const state: MarketState = {
      pair,
      price: last.close,
      change24h: ((last.close - candles[0].close) / candles[0].close) * 100,
      candles,
      metrics,
      indicators,
      whaleStats,
      macroStats,
      isRealtime: true,
      timeframe: this.activeTimeframe
    };
    
    this.latestStates[pair] = state;
    this.listeners.forEach((cb) => cb(pair, state));
  }
}

export const marketService = new MarketService();
