import React, { useState, useEffect } from 'react';
import { Zap, Shield, BarChart2, Cpu, Check, ArrowRight, BrainCircuit, Globe, Crown, Layers, Target, Rocket } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: 'LOGIN' | 'SIGNUP' | 'APP' | 'HOW_IT_WORKS') => void;
}

const SLIDER_IMAGES = [
  "https://cdn.prod.website-files.com/678fb0f1c3f23bcf01f8cff8/67af58c6a39dade48848808e_67a68d6b29be757dfc90701e_67a22e79348806c4a444ec9e_Flag_Pattern.png",
  "https://cdn.prod.website-files.com/678fb0f1c3f23bcf01f8cff8/67af58c6a39dade488488088_67a68d6b29be757dfc907027_67a22eb56888b88826bbd554_Ascending_Triangle.png",
  "https://cdn.prod.website-files.com/678fb0f1c3f23bcf01f8cff8/67af58c6a39dade488488091_67a68d6a29be757dfc907006_67a22eee74d8fe0bf1c7426a_Descending_Triangle.png",
  "https://cdn.prod.website-files.com/678fb0f1c3f23bcf01f8cff8/67af58c6a39dade4884880a7_67a68d6b29be757dfc907021_67a22f3764bcfa8cae8a7282_Head_and_Shoulders.png",
  "https://cdn.prod.website-files.com/678fb0f1c3f23bcf01f8cff8/67af58c6a39dade4884880b7_67a68d6b29be757dfc907037_67a22f51704aae6b7cca5df8_Inverse_Head_and_Shoulders.png",
  "https://cdn.prod.website-files.com/678fb0f1c3f23bcf01f8cff8/67af58c6a39dade488488080_67a68d57fc9fbd954098bff2_67a22f7ea32c74de247eddb9_Double_Top.png",
  "https://cdn.prod.website-files.com/678fb0f1c3f23bcf01f8cff8/67af58c6a39dade488488094_67a68d6b29be757dfc907024_67a22fa23625a5ce9f7bd19b_Double_bottom.png",
  "https://cdn.prod.website-files.com/678fb0f1c3f23bcf01f8cff8/67af58c6a39dade48848808b_67a68d6a29be757dfc907003_67a22fdb3625a5ce9f7c16e5_Cup_and_Handle.png"
];

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Automatic Slider Logic
  useEffect(() => {
    const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % SLIDER_IMAGES.length);
    }, 3500); // Change every 3.5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-primary/30 overflow-x-hidden relative">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/20 rounded-full blur-[80px] md:blur-[120px] animate-blob mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-secondary/20 rounded-full blur-[80px] md:blur-[120px] animate-blob animation-delay-2000 mix-blend-screen" />
        <div className="absolute top-[40%] left-[40%] w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-neonBlue/10 rounded-full blur-[80px] md:blur-[100px] animate-blob animation-delay-4000 mix-blend-screen" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-50 px-6 py-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
           <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-white fill-white" />
           </div>
           <span className="text-lg md:text-xl font-bold tracking-tight">Perp<span className="text-primary">Pilot</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
           <button onClick={() => onNavigate('HOW_IT_WORKS')} className="hover:text-white transition-colors">How it Works</button>
           <a href="#features" className="hover:text-white transition-colors">Features</a>
           <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => onNavigate('LOGIN')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block">
             Log In
           </button>
           <button 
             onClick={() => onNavigate('APP')}
             className="px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-white text-black font-bold text-xs md:text-sm hover:bg-gray-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
           >
             Try Demo
           </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-10 md:pt-20 pb-24 md:pb-32 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs font-medium text-neonBlue mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 hover:bg-white/10 transition-colors cursor-default">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neonBlue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neonBlue"></span>
           </span>
           AI Model v2.5 Now Live
        </div>
        
        <h1 className="text-4xl md:text-7xl font-google-code font-bold tracking-tight mb-6 md:mb-8 leading-[1.1] md:leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
           Institutional-Grade <br />
           {/* TEXT SHIMMER ANIMATION WITH NEW GRADIENT */}
           <span className="bg-clip-text text-transparent bg-[linear-gradient(to_right,#f97316,#a855f7,#ec4899,#ef4444,#eab308,#f97316)] animate-text-shimmer bg-[length:200%_auto] pb-2">
             AI Trading Intelligence
           </span>
        </h1>
        
        <p className="text-sm md:text-lg text-gray-400 max-w-xl md:max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 px-4">
           Stop guessing. Start sniping. Our AI agent analyzes order flow, whale movements, and 30-day market structure to generate high-probability trade setups in real-time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 w-full sm:w-auto px-6 sm:px-0">
           <button 
             onClick={() => onNavigate('SIGNUP')}
             className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary hover:bg-blue-600 text-white font-bold text-base md:text-lg shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-[0_0_60px_rgba(59,130,246,0.6)] hover:scale-105 transition-all flex items-center justify-center gap-2"
           >
             Get Started Free <ArrowRight className="w-5 h-5" />
           </button>
           <button 
             onClick={() => onNavigate('APP')}
             className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-base md:text-lg backdrop-blur-sm transition-all flex items-center justify-center gap-2 hover:border-white/20"
           >
             <BrainCircuit className="w-5 h-5 text-gray-400" /> Launch Demo
           </button>
        </div>

        {/* CHART PATTERN SLIDER */}
        <div className="mt-12 md:mt-20 relative animate-in fade-in zoom-in duration-1000 delay-500 group px-2 md:px-0">
           <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
           <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
           <div className="glass-panel border border-white/10 rounded-xl md:rounded-2xl p-2 bg-[#121212]/50 shadow-2xl max-w-4xl mx-auto relative overflow-hidden h-[300px] md:h-[500px]">
              
              {/* Image Slider */}
              {SLIDER_IMAGES.map((img, index) => (
                <div 
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img 
                        src={img} 
                        alt={`Chart Pattern ${index + 1}`} 
                        className="w-full h-full object-contain md:object-cover rounded-lg md:rounded-xl opacity-90"
                    />
                </div>
              ))}

              {/* Overlay Content */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl flex flex-col items-center text-center shadow-2xl animate-in zoom-in duration-700 delay-700 w-[90%] md:w-auto z-20">
                 <div className="text-primary font-bold tracking-widest uppercase text-[10px] md:text-xs mb-2">Live Pattern Recognition</div>
                 <div className="text-3xl md:text-4xl font-black text-white mb-1">
                    {['Flag Pattern', 'Ascending Triangle', 'Descending Triangle', 'Head & Shoulders', 'Inverse H&S', 'Double Top', 'Double Bottom', 'Cup & Handle'][currentImageIndex]}
                 </div>
                 <div className="text-gray-400 text-xs md:text-sm">Scanning 34 Pairs Real-Time</div>
              </div>

               {/* Slider Indicators */}
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                   {SLIDER_IMAGES.map((_, idx) => (
                       <button 
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-primary w-6' : 'bg-white/20'}`}
                       />
                   ))}
               </div>
           </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 md:py-24 relative z-10">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
               <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6">Why Traders Trust PerpPilot</h2>
               <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">We don't just use indicators. We analyze the psychology of the market using advanced LLMs and real-time on-chain data.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
               {[
                  {
                     icon: BrainCircuit,
                     title: "Context-Aware AI",
                     desc: "The AI doesn't just look at price. It reads market structure, funding rates, and liquidation heatmaps to understand 'Why' price is moving."
                  },
                  {
                     icon: Globe,
                     title: "Whale Tracking",
                     desc: "Real-time monitoring of Binance spot CVD and aggregated exchange data to detect accumulation before the pump happens."
                  },
                  {
                     icon: Shield,
                     title: "RiskGuard™ System",
                     desc: "Automatic calculation of invalidation points, stop losses, and take profit targets based on volatility (ATR) and support zones."
                  }
               ].map((feature, i) => (
                  <div key={i} className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 bg-[#0a0a0a]/80 hover:bg-[#121212] hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1">
                     <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-gray-300 group-hover:text-primary transition-colors" />
                     </div>
                     <h3 className="text-lg md:text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                     <p className="text-sm md:text-base text-gray-400 leading-relaxed">{feature.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* PRICING - 4 TIER PLANS */}
      <section id="pricing" className="py-16 md:py-24 relative z-10">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
               <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6">Simple, Transparent Pricing</h2>
               <p className="text-sm md:text-base text-gray-400">Choose the plan that fits your trading capital.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
               
               {/* PLAN 1: TRIAL */}
               <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0a0a0a]/60 flex flex-col hover:border-white/20 transition-colors">
                  <div className="mb-4 text-gray-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                     <Target className="w-4 h-4" /> Explorer
                  </div>
                  <div className="mb-6">
                     <span className="text-3xl font-bold text-white">Free</span>
                     <span className="text-gray-500 text-sm ml-2">/ 3 Days</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-6 h-10">Perfect for backtesting strategies and paper trading.</p>
                  <ul className="space-y-3 mb-8 flex-1">
                     <li className="flex items-center gap-2 text-xs text-gray-300"><Check className="w-3 h-3 text-gray-500" /> 15m Delayed Data</li>
                     <li className="flex items-center gap-2 text-xs text-gray-300"><Check className="w-3 h-3 text-gray-500" /> Basic Charting</li>
                     <li className="flex items-center gap-2 text-xs text-gray-300"><Check className="w-3 h-3 text-gray-500" /> 3 Pairs Only</li>
                     <li className="flex items-center gap-2 text-xs text-gray-500 opacity-50"><Target className="w-3 h-3" /> No AI Signals</li>
                  </ul>
                  <button onClick={() => onNavigate('APP')} className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 font-bold transition-all text-xs uppercase tracking-wide">
                     Try Demo
                  </button>
               </div>

               {/* PLAN 2: STARTER */}
               <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0a0a0a]/60 flex flex-col hover:border-blue-500/30 transition-colors">
                  <div className="mb-4 text-blue-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                     <Rocket className="w-4 h-4" /> Scout
                  </div>
                  <div className="mb-6 flex items-baseline gap-1">
                     <span className="text-3xl font-bold text-white">$27</span>
                     <span className="text-gray-500 text-sm">/mo</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-6 h-10">For traders just starting to scale their portfolio.</p>
                  <ul className="space-y-3 mb-8 flex-1">
                     <li className="flex items-center gap-2 text-xs text-white"><Check className="w-3 h-3 text-blue-500" /> Real-time Data</li>
                     <li className="flex items-center gap-2 text-xs text-white"><Check className="w-3 h-3 text-blue-500" /> Basic AI Signals</li>
                     <li className="flex items-center gap-2 text-xs text-white"><Check className="w-3 h-3 text-blue-500" /> 10 Pairs Watchlist</li>
                     <li className="flex items-center gap-2 text-xs text-white"><Check className="w-3 h-3 text-blue-500" /> Discord Access</li>
                     <li className="flex items-center gap-2 text-xs text-gray-500 opacity-50"><Layers className="w-3 h-3" /> No Whale Data</li>
                  </ul>
                  <button onClick={() => onNavigate('SIGNUP')} className="w-full py-3 rounded-xl border border-blue-500/20 hover:bg-blue-500/10 text-blue-400 font-bold transition-all text-xs uppercase tracking-wide">
                     Select Starter
                  </button>
               </div>

               {/* PLAN 3: PRO (HIGHLIGHTED) */}
               <div className="glass-panel p-6 rounded-2xl border border-primary bg-[#0c0c0c]/90 relative flex flex-col transform lg:-translate-y-4 shadow-[0_0_40px_rgba(59,130,246,0.15)] z-10">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-neonBlue text-black text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wide shadow-lg whitespace-nowrap">
                     Most Popular
                  </div>
                  <div className="mb-4 text-primary font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                     <Zap className="w-4 h-4" /> Sniper
                  </div>
                  <div className="mb-6 flex items-baseline gap-1">
                     <span className="text-4xl font-black text-white">$75</span>
                     <span className="text-gray-500 text-sm">/mo</span>
                  </div>
                  <p className="text-gray-300 text-xs mb-6 h-10">Full access to AI Scalping & Gem Hunter modules.</p>
                  <ul className="space-y-3 mb-8 flex-1">
                     <li className="flex items-center gap-2 text-xs text-white font-bold"><Check className="w-3 h-3 text-primary" /> All AI Modules (Scalp + Gem)</li>
                     <li className="flex items-center gap-2 text-xs text-white"><Check className="w-3 h-3 text-primary" /> Unlimited Pairs</li>
                     <li className="flex items-center gap-2 text-xs text-white"><Check className="w-3 h-3 text-primary" /> Basic Whale Analytics</li>
                     <li className="flex items-center gap-2 text-xs text-white"><Check className="w-3 h-3 text-primary" /> Priority Execution</li>
                     <li className="flex items-center gap-2 text-xs text-white"><Check className="w-3 h-3 text-primary" /> Private Strategy Group</li>
                  </ul>
                  <button onClick={() => onNavigate('SIGNUP')} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-400 hover:to-primary text-white font-bold transition-all shadow-lg shadow-primary/25 hover:scale-[1.02] text-xs uppercase tracking-wide">
                     Get Sniper Access
                  </button>
               </div>

               {/* PLAN 4: WHALE */}
               <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-[#0a0a0a]/60 flex flex-col hover:border-purple-500/60 transition-colors">
                  <div className="mb-4 text-purple-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                     <Crown className="w-4 h-4" /> Whale God
                  </div>
                  <div className="mb-6 flex items-baseline gap-1">
                     <span className="text-3xl font-bold text-white">$190</span>
                     <span className="text-gray-500 text-sm">/mo</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-6 h-10">Institutional grade data with API access.</p>
                  <ul className="space-y-3 mb-8 flex-1">
                     <li className="flex items-center gap-2 text-xs text-white"><Check className="w-3 h-3 text-purple-500" /> Full Whale Depth & CVD</li>
                     <li className="flex items-center gap-2 text-xs text-white"><Check className="w-3 h-3 text-purple-500" /> API Key Access</li>
                     <li className="flex items-center gap-2 text-xs text-white"><Check className="w-3 h-3 text-purple-500" /> 1-on-1 Strategy Calls</li>
                     <li className="flex items-center gap-2 text-xs text-white"><Check className="w-3 h-3 text-purple-500" /> Custom Alert Webhooks</li>
                     <li className="flex items-center gap-2 text-xs text-white"><Check className="w-3 h-3 text-purple-500" /> Institutional Report</li>
                  </ul>
                  <button onClick={() => onNavigate('SIGNUP')} className="w-full py-3 rounded-xl border border-purple-500/20 hover:bg-purple-500/10 text-purple-400 font-bold transition-all text-xs uppercase tracking-wide">
                     Go Institutional
                  </button>
               </div>

            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 md:py-12 px-6 border-t border-white/5 bg-black text-center relative z-10">
         <div className="flex items-center justify-center gap-2 mb-6">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            <span className="text-base md:text-lg font-bold text-gray-500">Perp<span className="text-gray-700">Pilot</span></span>
         </div>
         <p className="text-gray-600 text-xs md:text-sm max-w-md mx-auto mb-6 md:mb-8">
            Trading cryptocurrencies involves significant risk and can result in the loss of your capital. You should not invest more than you can afford to lose.
         </p>
         
         {/* Footer Links including How It Works */}
         <div className="flex justify-center gap-6 mb-8 text-sm text-gray-500">
             <button onClick={() => onNavigate('HOW_IT_WORKS')} className="hover:text-primary transition-colors">How Our System Works</button>
             <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
             <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
         </div>

         <div className="text-gray-700 text-[10px] md:text-xs">
            © 2024 PerpPilot AI. All rights reserved.
         </div>
      </footer>

    </div>
  );
};

export default LandingPage;