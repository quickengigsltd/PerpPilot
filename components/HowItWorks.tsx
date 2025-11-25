
import React from 'react';
import { ArrowLeft, Database, Cpu, Eye, ShieldCheck, Zap, Layers, BarChart3, Binary, Lock, ArrowRight, Flame, Target, Crosshair } from 'lucide-react';

interface HowItWorksProps {
  onBack: () => void;
  onStart: () => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ onBack, onStart }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-primary/30 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen opacity-40"></div>
         <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full mix-blend-screen opacity-40"></div>
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
      </div>

      <nav className="relative z-50 px-6 py-6 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Home</span>
            </button>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                    <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="font-bold text-lg hidden sm:block">System Architecture</span>
            </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
         
         {/* HERO */}
         <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs font-medium text-red-400 mb-6">
                <Flame className="w-3 h-3" />
                <span>The "Devil" Method: v3.0 Core</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
               Deconstructing the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Order Flow Engine</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
               We abandoned lagging indicators like RSI and MACD. Instead, our AI analyzes raw tick data, liquidity heatmaps, and institutional order flow to find the <i>real</i> move.
            </p>
         </div>

         {/* STEP 1: DATA INGESTION */}
         <div className="grid md:grid-cols-2 gap-12 items-center mb-24 relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative order-2 md:order-1">
                <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-[#0a0a0a]">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                            <Database className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold">1. The Raw Feed</h3>
                    </div>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                            <div>
                                <strong className="block text-white">Aggressive vs. Passive</strong>
                                <span className="text-sm text-gray-400">We don't just see volume. We split every trade into "Taker Buy" (Aggressive) vs "Taker Sell" to calculate the Cumulative Volume Delta (CVD).</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                            <div>
                                <strong className="block text-white">50ms Latency</strong>
                                <span className="text-sm text-gray-400">Connecting directly to Binance WebSocket streams allows us to detect order book imbalances milliseconds before price reacts.</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
                <div className="text-[200px] font-black text-white/5 leading-none absolute -top-20 -right-10 select-none">01</div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">Beyond the <br />Green Candle.</h2>
                <p className="text-gray-400 leading-relaxed relative z-10">
                    A green candle isn't always bullish. If price goes up but Taker Volume is selling (absorption), a crash is imminent. Standard charts hide this; our engine reveals it.
                </p>
            </div>
         </div>

         {/* STEP 2: MICROSTRUCTURE */}
         <div className="grid md:grid-cols-2 gap-12 items-center mb-24 relative group">
            <div className="absolute -inset-4 bg-gradient-to-l from-orange-500/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="text-center md:text-right">
                <div className="text-[200px] font-black text-white/5 leading-none absolute -top-20 -left-10 select-none">02</div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">Microstructure <br />Over Technicals.</h2>
                <p className="text-gray-400 leading-relaxed relative z-10">
                   RSI is random noise on a 1-minute chart. We use "The Devil Method" logic: specific microstructure patterns that signal institutional algorithms are active.
                </p>
            </div>
            <div className="relative">
                <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-[#0a0a0a]">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
                            <Crosshair className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold">2. The Logic Matrix</h3>
                    </div>
                    <ul className="space-y-4">
                         <li className="flex items-start gap-3">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]"></div>
                            <div>
                                <strong className="block text-white">CVD Divergence</strong>
                                <span className="text-sm text-gray-400">When Price makes a Lower Low, but CVD makes a Higher Low, whales are absorbing the sell pressure. <strong>We buy.</strong></span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]"></div>
                            <div>
                                <strong className="block text-white">Liquidity Sweeps (Stop Hunts)</strong>
                                <span className="text-sm text-gray-400">The system detects when price spikes simply to trigger stop losses (sweeping the highs/lows) and fades the move instantly.</span>
                            </div>
                        </li>
                         <li className="flex items-start gap-3">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]"></div>
                            <div>
                                <strong className="block text-white">Order Book Imbalance</strong>
                                <span className="text-sm text-gray-400">We track the ratio of Bids vs Asks in the top 5 levels. A sudden flip from -60% to +40% confirms momentum.</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
         </div>

         {/* STEP 3: AI AGENT */}
         <div className="grid md:grid-cols-2 gap-12 items-center mb-24 relative group">
             <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative order-2 md:order-1">
                <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-[#0a0a0a]">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                            <Cpu className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold">3. The Agent</h3>
                    </div>
                     <div className="space-y-4 text-sm text-gray-400 font-mono">
                        <div className="p-3 bg-black/40 rounded border border-white/5">
                            <span className="text-purple-400">INPUT:</span> CVD_Div=BULLISH, Imbalance=+0.4, Heatmap=0.7 (Shorts Rekt)
                        </div>
                        <div className="flex justify-center">
                            <Binary className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="p-3 bg-black/40 rounded border border-white/5">
                            <span className="text-green-400">DECISION:</span> "GO LONG". Confidence: 94%. Reason: Shorts trapped in liquidation cascade + Whale Absorption.
                        </div>
                    </div>
                </div>
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
                <div className="text-[200px] font-black text-white/5 leading-none absolute -top-20 -right-10 select-none">03</div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">Gemini 2.5 <br />Execution.</h2>
                <p className="text-gray-400 leading-relaxed relative z-10">
                    We use Google's Gemini Flash 2.5 to synthesize the Liquidity Heatmap, Taker Ratios (1D/3D), and Order Flow data into a single, actionable execution command.
                </p>
            </div>
         </div>

         {/* CONCLUSION */}
         <div className="text-center pt-10 border-t border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">Experience High-Frequency Intelligence</h2>
            <div className="flex justify-center gap-4">
                <button 
                  onClick={onStart}
                  className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                    Create Free Account <ArrowRight className="w-5 h-5" />
                </button>
            </div>
         </div>

      </main>
    </div>
  );
};

export default HowItWorks;
