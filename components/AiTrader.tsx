
import React, { useState, useEffect, useRef } from 'react';
import { MarketState, AISignal } from '../types';
import { BrainCircuit, Activity, Crosshair, TrendingUp, TrendingDown, Target, Zap, Clock, ShieldCheck, Terminal, Lock, BarChart2, AlertCircle, Wifi, Layers, Flame, Gauge, FileText } from 'lucide-react';
import TokenIcon from './TokenIcon';

interface AiTraderProps {
  marketState: MarketState | null;
  aiSignal?: AISignal | null;
}

const AiTrader: React.FC<AiTraderProps> = ({ marketState, aiSignal }) => {
  const [activeTab, setActiveTab] = useState<'SCALP' | 'SWING'>('SCALP');
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  const prevPriceRef = useRef<number>(0);
  const [priceColor, setPriceColor] = useState<string>('text-white');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // --- ORDER FLOW LOGS ---
  useEffect(() => {
    if (!marketState) return;
    
    const possibleLogs = [
      `Checking Trend Integrity (EMA 13)...`,
      `Monitoring Profit/Loss Thresholds...`,
      `Price above Entry - Holding Position...`,
      `Scanning for Break of Structure...`,
      `Verifying Funding Rate Context...`,
      `Trailing Stop calculation active...`,
      `Analyzing Taker Buy volume for absorption...`,
      `Processing Liquidation Heatmap data...`,
    ];

    const interval = setInterval(() => {
      const randomLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
      const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
      setLogs(prev => [`[${timestamp}] ${randomLog}`, ...prev.slice(0, 6)]);
    }, 2000);

    return () => clearInterval(interval);
  }, [marketState]);

  // --- PRICE FLASH ---
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
           <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Connecting to Order Flow</h2>
           <p className="text-gray-500 font-mono relative z-10">Syncing CVD and Depth...</p>
        </div>
    );
  }

  const { metrics, pair, price } = marketState;
  const { imbalanceRatio, cvdDivergence, stopHunt, buyingPressure } = metrics.orderFlow;
  const { takerRatios, liquidationHeat } = metrics;

  // STRICT BINARY SCORE (Remove Neutral/Hold)
  const score = buyingPressure;
  const signal = score >= 50 ? 'BUY' : 'SELL';
  
  const signalColor = signal === 'BUY' ? '#10B981' : '#EF4444';
  const signalText = signal === 'BUY' ? 'text-bullish' : 'text-bearish';
  const glowClass = signal === 'BUY' ? 'shadow-bullish/20' : 'shadow-bearish/20';

  // --- GAUGE MATH ---
  const cx = 100;
  const cy = 100;
  const r = 85;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const liqGradientColor = liquidationHeat > 0.3 ? 'bg-orange-500' : liquidationHeat < -0.3 ? 'bg-red-500' : 'bg-gray-700';
  const liqStatus = liquidationHeat > 0.5 ? 'Short Squeeze Risk' : liquidationHeat < -0.5 ? 'Long Liquidation Risk' : 'Balanced';

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-500">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0a0a0a] border border-white/5 p-4 rounded-xl shadow-lg">
         <div className="flex items-center gap-4">
            <TokenIcon pair={pair} size="lg" />
            <div>
               <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  {pair.split('/')[0]} <span className="text-gray-600 font-normal text-lg">/ DEVIL AGENT</span>
               </h2>
               <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mt-1">
                  <span className="flex items-center gap-1 text-bullish animate-pulse">
                      <Wifi className="w-3 h-3" /> 50ms Feed
                  </span>
                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                  <span>Updated: {lastUpdate}</span>
               </div>
            </div>
         </div>

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
               <Zap className="w-3 h-3" /> 1m MICRO
            </button>
            <button 
               onClick={() => setActiveTab('SWING')}
               className={`px-6 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'SWING' ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-gray-500 hover:text-white'}`}
            >
               <Layers className="w-3 h-3" /> 5m FLOW
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         
         {/* 2. MAIN SIGNAL ENGINE (Left - 7 Cols) */}
         <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* THE BRAIN / GAUGE CARD */}
            <div className={`glass-panel relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-[#0f0f0f] to-black p-6 md:p-8 shadow-2xl ${glowClass}`}>
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 pointer-events-none"></div>
               
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                  
                  {/* LEFT: GAUGE */}
                  <div className="relative w-full aspect-square max-w-[280px] mx-auto flex items-center justify-center">
                     <svg className="w-full h-full -rotate-90 transform drop-shadow-2xl" viewBox="0 0 200 200">
                        <defs>
                           <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor={signalColor} stopOpacity="0.4" />
                              <stop offset="100%" stopColor={signalColor} />
                           </linearGradient>
                        </defs>
                        <circle cx={cx} cy={cy} r={r} stroke="#1a1a1a" strokeWidth="12" fill="none" />
                        <circle cx={cx} cy={cy} r={r} stroke="url(#gaugeGradient)" strokeWidth="12" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Buy Pressure</span>
                        <span className={`text-4xl md:text-5xl font-black tracking-tighter ${signalText} drop-shadow-lg`}>{score.toFixed(0)}</span>
                     </div>
                  </div>

                  {/* RIGHT: DATA HUD */}
                  <div className="flex flex-col justify-center gap-4 h-full">
                     <div className={`p-4 rounded-xl border border-white/5 flex items-center gap-4 ${signal === 'BUY' ? 'bg-gradient-to-r from-bullish/10 to-transparent' : 'bg-gradient-to-r from-bearish/10 to-transparent'}`}>
                        <div className={`p-3 rounded-lg ${signal === 'BUY' ? 'bg-bullish text-black' : 'bg-bearish text-white'}`}>
                           {signal === 'BUY' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                        </div>
                        <div>
                           <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Order Flow Signal</div>
                           <div className={`text-2xl font-black ${signalText}`}>{`STRONG ${signal}`}</div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                           <div className="flex items-center gap-2">
                              <Crosshair className="w-4 h-4 text-neonBlue" />
                              <span className="text-xs font-bold text-gray-400 uppercase">Imbalance (Bid/Ask)</span>
                           </div>
                           <span className={`text-sm font-mono font-bold ${imbalanceRatio > 0 ? 'text-bullish' : 'text-bearish'}`}>
                               {imbalanceRatio > 0 ? '+' : ''}{imbalanceRatio.toFixed(2)}
                           </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                           <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-orange-400" />
                              <span className="text-xs font-bold text-gray-400 uppercase">CVD Divergence</span>
                           </div>
                           <span className={`text-sm font-mono font-bold ${cvdDivergence === 'BULLISH' ? 'text-bullish' : cvdDivergence === 'BEARISH' ? 'text-bearish' : 'text-gray-500'}`}>
                              {cvdDivergence}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* ORDER FLOW & LIQUIDITY METRICS */}
            <div className="glass-panel p-6 rounded-xl border border-white/5">
               <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-primary" /> The "Devil" Metrics
                    </h3>
                    {liquidationHeat !== 0 && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${liquidationHeat > 0.5 ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                            {liqStatus}
                        </span>
                    )}
               </div>
               
               <div className="space-y-6">
                  {/* Liquidation Heatmap Bar */}
                  <div>
                      <div className="flex justify-between text-xs mb-2">
                          <span className="font-bold text-gray-500 flex items-center gap-2"><Flame className="w-3 h-3 text-orange-500" /> Liquidation Heatmap</span>
                          <span className="font-mono text-white">{liquidationHeat.toFixed(2)}</span>
                      </div>
                      <div className="h-3 bg-gray-800 rounded-full relative overflow-hidden">
                          {/* Center Marker */}
                          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white z-10"></div>
                          {/* Heat Bar */}
                          <div 
                             className={`absolute top-0 bottom-0 transition-all duration-500 ${liqGradientColor}`}
                             style={{ 
                                 left: liquidationHeat > 0 ? '50%' : `${50 + (liquidationHeat * 50)}%`,
                                 width: `${Math.abs(liquidationHeat) * 50}%`
                             }}
                          ></div>
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-600 mt-1 uppercase font-bold">
                          <span>Longs Rekt (-1)</span>
                          <span>Neutral</span>
                          <span>Shorts Rekt (+1)</span>
                      </div>
                  </div>

                  {/* Taker Ratios (1D / 3D / 7D) */}
                  <div>
                     <div className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2">
                        <Gauge className="w-3 h-3 text-secondary" /> Taker Buy/Sell Ratios
                     </div>
                     <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: '1D', val: takerRatios.ratio1d },
                            { label: '3D', val: takerRatios.ratio3d },
                            { label: '7D', val: takerRatios.ratio7d },
                        ].map((r, i) => (
                            <div key={i} className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                                <div className="text-[10px] text-gray-500 font-bold mb-1">{r.label} Ratio</div>
                                <div className={`text-lg font-mono font-bold ${r.val > 1 ? 'text-bullish' : 'text-bearish'}`}>
                                    {r.val.toFixed(2)}x
                                </div>
                            </div>
                        ))}
                     </div>
                  </div>

                  {/* Stop Hunt */}
                   <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                     <span className="text-xs font-bold text-gray-400 w-32 shrink-0">Liquidity Sweep</span>
                     <div className="flex-1 text-xs font-mono text-right">
                        {stopHunt === 'NONE' ? (
                            <span className="text-gray-600">No recent sweep</span>
                        ) : (
                            <span className={`font-bold px-2 py-1 rounded bg-opacity-20 ${stopHunt === 'BULLISH_SWEEP' ? 'bg-bullish text-bullish' : 'bg-bearish text-bearish'}`}>
                                {stopHunt.replace('_', ' ')} DETECTED
                            </span>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* 3. TERMINAL & REASONING (Right - 5 Cols) */}
         <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* AI STRATEGIC REASONING - NEW SECTION */}
            <div className="glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-primary/50"></div>
                 <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    AI Strategic Reasoning
                 </h3>
                 
                 {aiSignal ? (
                     <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">
                           "{aiSignal.reasoning}"
                        </p>
                        <div className="flex flex-wrap gap-2">
                           <span className="text-[10px] bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-400">
                              Confidence: <span className="text-white font-bold">{aiSignal.confidence}%</span>
                           </span>
                           <span className="text-[10px] bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-400">
                              Action: <span className={`${aiSignal.action.includes('LONG') ? 'text-bullish' : 'text-bearish'} font-bold`}>{aiSignal.action}</span>
                           </span>
                        </div>
                     </div>
                 ) : (
                     <div className="flex flex-col items-center justify-center py-8 text-gray-500 gap-2">
                        <Activity className="w-6 h-6 animate-pulse opacity-50" />
                        <span className="text-xs font-mono">Analyzing Market Metrics...</span>
                     </div>
                 )}
            </div>

            {/* TERMINAL LOGS */}
            <div className="glass-panel p-1 rounded-xl border border-white/5 bg-black flex-1 flex flex-col relative overflow-hidden min-h-[300px]">
               <div className="bg-[#1a1a1a] px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Terminal className="w-3 h-3 text-gray-400" />
                     <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Algo Logic Stream</span>
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
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AiTrader;
