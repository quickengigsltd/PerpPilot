
import React, { useState, useEffect, useRef } from 'react';
import { MarketState } from '../types';
import { BrainCircuit, Activity, Crosshair, TrendingUp, TrendingDown, Target, Zap, Clock, ShieldCheck, Terminal, Lock, BarChart2, AlertCircle, Wifi } from 'lucide-react';
import TokenIcon from './TokenIcon';

interface AiTraderProps {
  marketState: MarketState | null;
}

const AiTrader: React.FC<AiTraderProps> = ({ marketState }) => {
  const [activeTab, setActiveTab] = useState<'SCALP' | 'SWING'>('SCALP');
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // Real-time Visuals
  const prevPriceRef = useRef<number>(0);
  const [priceColor, setPriceColor] = useState<string>('text-white');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // --- AI SIMULATION LOGIC (Logs) ---
  useEffect(() => {
    if (!marketState) return;
    
    const possibleLogs = [
      `Scanning ${marketState.pair} orderbook depth...`,
      `Analyzing historical volatility (ATR)...`,
      `Cross-referencing Binance whale wallets...`,
      `Calculating Fibonnaci retracement levels...`,
      `Checking RSI divergence on 4h timeframe...`,
      `Detecting institutional accumulation blocks...`,
      `Verifying funding rate arbitrage opportunities...`,
      `Backtesting current setup against 2023 patterns...`
    ];

    const interval = setInterval(() => {
      const randomLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
      const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
      setLogs(prev => [`[${timestamp}] ${randomLog}`, ...prev.slice(0, 6)]);
    }, 2500);

    return () => clearInterval(interval);
  }, [marketState]);

  // --- REAL-TIME PRICE EFFECT ---
  useEffect(() => {
      if (!marketState) return;
      
      const currentPrice = marketState.price;
      const prevPrice = prevPriceRef.current;
      
      if (prevPrice > 0) {
          if (currentPrice > prevPrice) {
              setPriceColor('text-bullish');
              setTimeout(() => setPriceColor('text-white'), 400);
          } else if (currentPrice < prevPrice) {
              setPriceColor('text-bearish');
              setTimeout(() => setPriceColor('text-white'), 400);
          }
      }
      
      prevPriceRef.current = currentPrice;
      setLastUpdate(new Date().toLocaleTimeString());
      
  }, [marketState?.price]);

  if (!marketState) {
    return (
        <div className="flex flex-col items-center justify-center h-[500px] glass-panel rounded-xl relative overflow-hidden">
           <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
           <BrainCircuit className="w-20 h-20 text-primary animate-bounce mb-6 relative z-10" />
           <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Initializing Neural Net</h2>
           <p className="text-gray-500 font-mono relative z-10">Establishing secure connection to market feed...</p>
        </div>
    );
  }

  const { indicators, metrics, pair, price } = marketState;

  // --- ALGORITHMIC SCORING ENGINE ---
  const calculateScore = (isSwing: boolean) => {
     let score = 50; 
     
     // 1. Trend (30%)
     if (indicators.trendScore > 0) score += 15;
     else if (indicators.trendScore < 0) score -= 15;

     // 2. Momentum (20%)
     if (isSwing) {
        if (indicators.rsi < 40) score += 10; // Buy the dip
        else if (indicators.rsi > 70) score -= 10;
     } else {
        // Scalp follows momentum
        if (indicators.rsi > 55) score += 10;
        else if (indicators.rsi < 45) score -= 10;
     }

     // 3. Whales (20%)
     if (indicators.smartMoneyScore > 0) score += 10;
     else score -= 10;

     // 4. Structure (15%)
     if (indicators.marketStructure === 'BULLISH') score += 7.5;
     else if (indicators.marketStructure === 'BEARISH') score -= 7.5;

     // 5. Funding (15%)
     if (metrics.fundingRate < 0 && indicators.trendScore > 0) score += 7.5; // Short squeeze
     
     // 6. Volatility (Bollinger) - NEW - MEAN REVERSION LOGIC
     const distToUpper = Math.abs(price - indicators.bollingerUpper);
     const distToLower = Math.abs(price - indicators.bollingerLower);
     const range = indicators.bollingerUpper - indicators.bollingerLower;
     
     if (distToLower < range * 0.05) score += 15; // Near bottom = Strong Buy
     if (distToUpper < range * 0.05) score -= 15; // Near top = Strong Sell

     return Math.min(Math.max(score, 10), 95); // Clamp
  };

  const score = calculateScore(activeTab === 'SWING');
  const signal = score > 60 ? 'BUY' : score < 40 ? 'SELL' : 'HOLD';
  const signalColor = signal === 'BUY' ? '#10B981' : signal === 'SELL' ? '#EF4444' : '#6B7280';
  const signalText = signal === 'BUY' ? 'text-bullish' : signal === 'SELL' ? 'text-bearish' : 'text-gray-400';
  const glowClass = signal === 'BUY' ? 'shadow-bullish/20' : signal === 'SELL' ? 'shadow-bearish/20' : 'shadow-gray-500/20';

  // --- GAUGE MATH ---
  const cx = 100;
  const cy = 100;
  const r = 85;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-500">
      
      {/* 1. HEADER CONTROL BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0a0a0a] border border-white/5 p-4 rounded-xl shadow-lg">
         <div className="flex items-center gap-4">
            <TokenIcon pair={pair} size="lg" />
            <div>
               <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  {pair.split('/')[0]} <span className="text-gray-600 font-normal text-lg">/ AI AGENT</span>
               </h2>
               <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mt-1">
                  <span className="flex items-center gap-1 text-bullish animate-pulse">
                      <Wifi className="w-3 h-3" /> Live Feed
                  </span>
                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                  <span>Updated: {lastUpdate}</span>
               </div>
            </div>
         </div>

         {/* LIVE PRICE DISPLAY (NEW REQUEST) */}
         <div className="flex flex-col items-end md:items-center px-6 border-l border-white/10">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Market Price</span>
            <div className={`text-3xl md:text-4xl font-mono font-bold transition-all duration-300 ${priceColor}`}>
               ${price.toFixed(2)}
            </div>
         </div>

         <div className="flex bg-black p-1.5 rounded-lg border border-white/10">
            <button 
               onClick={() => setActiveTab('SCALP')}
               className={`px-6 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'SCALP' ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-gray-500 hover:text-white'}`}
            >
               <Zap className="w-3 h-3" /> SCALP (15m)
            </button>
            <button 
               onClick={() => setActiveTab('SWING')}
               className={`px-6 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'SWING' ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-gray-500 hover:text-white'}`}
            >
               <Clock className="w-3 h-3" /> SWING (4h)
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         
         {/* 2. MAIN SIGNAL ENGINE (Left - 7 Cols) */}
         <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* THE BRAIN / GAUGE CARD */}
            <div className={`glass-panel relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-[#0f0f0f] to-black p-6 md:p-8 shadow-2xl ${glowClass}`}>
               
               {/* Background Grid Animation */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 pointer-events-none"></div>
               
               {/* SPLIT LAYOUT: GAUGE LEFT | DATA RIGHT */}
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                  
                  {/* --- LEFT: THE GAUGE --- */}
                  <div className="relative w-full aspect-square max-w-[280px] mx-auto flex items-center justify-center">
                     
                     <svg className="w-full h-full -rotate-90 transform drop-shadow-2xl" viewBox="0 0 200 200">
                        <defs>
                           <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                              <feMerge>
                                 <feMergeNode in="coloredBlur" />
                                 <feMergeNode in="SourceGraphic" />
                              </feMerge>
                           </filter>
                           <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor={signalColor} stopOpacity="0.4" />
                              <stop offset="100%" stopColor={signalColor} />
                           </linearGradient>
                        </defs>

                        <circle 
                           cx={cx} cy={cy} r={r} 
                           stroke="#1a1a1a" strokeWidth="12" fill="none" 
                        />
                        
                        <circle 
                           cx={cx} cy={cy} r={r} 
                           stroke="url(#gaugeGradient)" 
                           strokeWidth="12" 
                           fill="none" 
                           strokeDasharray={circumference}
                           strokeDashoffset={strokeDashoffset}
                           strokeLinecap="round"
                           filter="url(#glow)"
                           className="transition-all duration-1000 ease-out"
                        />
                     </svg>
                     
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Confidence</span>
                            <span className={`text-4xl md:text-5xl font-black tracking-tighter ${signalText} drop-shadow-lg transition-all duration-300`}>
                               {score.toFixed(0)}%
                            </span>
                            <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold border ${signal === 'BUY' ? 'bg-green-500/10 border-green-500/20 text-green-400' : signal === 'SELL' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                               {signal}
                            </div>
                        </div>
                     </div>
                  </div>

                  {/* --- RIGHT: THE DATA HUD --- */}
                  <div className="flex flex-col justify-center gap-4 h-full">
                     
                     {/* 1. Main Action Banner */}
                     <div className={`p-4 rounded-xl border border-white/5 flex items-center gap-4 ${signal === 'BUY' ? 'bg-gradient-to-r from-bullish/10 to-transparent' : signal === 'SELL' ? 'bg-gradient-to-r from-bearish/10 to-transparent' : 'bg-white/5'}`}>
                        <div className={`p-3 rounded-lg ${signal === 'BUY' ? 'bg-bullish text-black' : signal === 'SELL' ? 'bg-bearish text-white' : 'bg-gray-700 text-gray-300'}`}>
                           {signal === 'BUY' ? <TrendingUp className="w-6 h-6" /> : signal === 'SELL' ? <TrendingDown className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                        </div>
                        <div>
                           <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Recommended Action</div>
                           <div className={`text-2xl font-black ${signalText}`}>{signal === 'HOLD' ? 'WAIT' : `STRONG ${signal}`}</div>
                        </div>
                     </div>

                     {/* 2. Metrics List */}
                     <div className="space-y-2">
                        {/* Entry */}
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                           <div className="flex items-center gap-2">
                              <Crosshair className="w-4 h-4 text-neonBlue" />
                              <span className="text-xs font-bold text-gray-400 uppercase">Entry Zone (Live)</span>
                           </div>
                           <span className={`text-sm font-mono font-bold transition-colors duration-300 ${priceColor}`}>
                               ${price.toFixed(2)}
                           </span>
                        </div>

                        {/* Stop Loss */}
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors group">
                           <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-bearish group-hover:animate-pulse" />
                              <span className="text-xs font-bold text-gray-400 uppercase">Stop Loss</span>
                           </div>
                           <span className="text-sm font-mono font-bold text-bearish">
                              ${(price * (signal === 'BUY' ? 0.985 : 1.015)).toFixed(2)}
                           </span>
                        </div>

                        {/* Take Profit */}
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                           <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-bullish" />
                              <span className="text-xs font-bold text-gray-400 uppercase">Take Profit</span>
                           </div>
                           <span className="text-sm font-mono font-bold text-bullish">
                              ${(price * (signal === 'BUY' ? 1.04 : 0.96)).toFixed(2)}
                           </span>
                        </div>
                     </div>

                     {/* 3. Brief Analysis */}
                     <div className="mt-2 text-xs text-gray-500 font-mono leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5 border-l-2 border-l-primary">
                        <span className="text-primary font-bold">AI_LOG:</span> {activeTab === 'SCALP' 
                                 ? `Volatility compression detected. Whale volume is ${indicators.smartMoneyScore > 0 ? 'bullish' : 'bearish'}. BB Reversion probability: ${indicators.smartMoneyScore > 0 ? 'High' : 'Moderate'}.` 
                                 : `Macro structure on 4H is ${indicators.marketStructure}. Awaiting candle confirmation.`}
                     </div>

                  </div>
               </div>
            </div>

            {/* PROBABILITY METRICS */}
            <div className="glass-panel p-6 rounded-xl border border-white/5">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" /> Probability Factors
               </h3>
               
               <div className="space-y-5">
                  {[
                     { label: 'Trend Alignment', score: indicators.trendScore > 0 ? 85 : 30, color: 'bg-blue-500' },
                     { label: 'Momentum (RSI)', score: indicators.rsi, color: 'bg-purple-500' },
                     { label: 'Whale Sentiment', score: indicators.smartMoneyScore > 0 ? 75 : 25, color: 'bg-orange-500' },
                     { label: 'Volatility Ext.', score: Math.abs(price - indicators.bollingerMiddle) / (indicators.bollingerUpper - indicators.bollingerLower) * 100, color: 'bg-teal-500' },
                  ].map((metric, i) => (
                     <div key={i} className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-400 w-28 shrink-0">{metric.label}</span>
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                           <div 
                              className={`h-full rounded-full ${metric.color} transition-all duration-1000 ease-out`} 
                              style={{ width: `${metric.score}%` }}
                           ></div>
                        </div>
                        <span className="text-xs font-mono text-gray-300 w-8 text-right">{metric.score.toFixed(0)}%</span>
                     </div>
                  ))}
               </div>
            </div>

         </div>

         {/* 3. TERMINAL & RISK (Right - 5 Cols) */}
         <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* LIVE AI TERMINAL */}
            <div className="glass-panel p-1 rounded-xl border border-white/5 bg-black h-64 flex flex-col relative overflow-hidden">
               <div className="bg-[#1a1a1a] px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Terminal className="w-3 h-3 text-gray-400" />
                     <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">System Log</span>
                  </div>
                  <div className="flex gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                     <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                     <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                  </div>
               </div>
               
               <div className="p-4 overflow-y-auto font-mono text-[10px] md:text-xs flex-1 space-y-2 custom-scrollbar" ref={logContainerRef}>
                  {logs.map((log, i) => (
                     <div key={i} className={`flex gap-2 ${i === 0 ? 'text-primary font-bold animate-pulse' : 'text-gray-500'}`}>
                        <span className="opacity-50">{`>`}</span>
                        <span>{log}</span>
                     </div>
                  ))}
                  <div className="w-2 h-4 bg-primary/50 animate-pulse mt-2"></div>
               </div>
            </div>

            {/* RISK RADAR / KEY LEVELS */}
            <div className="glass-panel p-6 rounded-xl border border-white/5 bg-[#0a0a0a] flex-1">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-500" /> Risk Management
               </h3>

               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 rounded-lg border border-white/5 bg-white/5">
                     <div className="text-[10px] text-gray-500 mb-1 uppercase">Rec. Leverage</div>
                     <div className="text-lg font-mono font-bold text-white">
                        {activeTab === 'SCALP' ? '10x - 20x' : '3x - 5x'}
                     </div>
                  </div>
                   <div className="p-3 rounded-lg border border-white/5 bg-white/5">
                     <div className="text-[10px] text-gray-500 mb-1 uppercase">Risk / Reward</div>
                     <div className="text-lg font-mono font-bold text-white">
                        1 : 2.5
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
                     <span className="text-gray-500">Market Structure</span>
                     <span className={`font-bold ${indicators.marketStructure === 'BULLISH' ? 'text-bullish' : 'text-bearish'}`}>
                        {indicators.marketStructure}
                     </span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
                     <span className="text-gray-500">Liquidation Heat</span>
                     <span className={`font-bold ${Math.abs(metrics.liquidationHeat) > 0.7 ? 'text-red-500' : 'text-green-500'}`}>
                        {Math.abs(metrics.liquidationHeat) > 0.7 ? 'High Risk' : 'Safe'}
                     </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-500">Whale Dominance</span>
                     <span className="text-white font-mono">
                        {(indicators.smartMoneyScore * 100).toFixed(0)}%
                     </span>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

export default AiTrader;
