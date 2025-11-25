
import React from 'react';
import { Zap, Shield, BarChart2, Cpu, Check, ArrowRight, BrainCircuit, Globe } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: 'LOGIN' | 'SIGNUP' | 'APP' | 'HOW_IT_WORKS') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
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
        
        <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6 md:mb-8 leading-[1.1] md:leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
           Institutional-Grade <br />
           {/* TEXT SHIMMER ANIMATION */}
           <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#00f3ff] to-secondary animate-text-shimmer bg-[length:200%_auto]">
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

        {/* UI Mockup / Stats */}
        <div className="mt-12 md:mt-20 relative animate-in fade-in zoom-in duration-1000 delay-500 group px-2 md:px-0">
           <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
           <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
           <div className="glass-panel border border-white/10 rounded-xl md:rounded-2xl p-2 bg-[#121212]/50 shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
              <img 
                 src="https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2070&auto=format&fit=crop" 
                 alt="Dashboard Preview" 
                 className="rounded-lg md:rounded-xl opacity-90 transition-opacity hover:opacity-100"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl flex flex-col items-center text-center shadow-2xl animate-in zoom-in duration-700 delay-700 w-[90%] md:w-auto">
                 <div className="text-primary font-bold tracking-widest uppercase text-[10px] md:text-xs mb-2">Live Performance</div>
                 <div className="text-3xl md:text-4xl font-black text-white mb-1">+482%</div>
                 <div className="text-gray-400 text-xs md:text-sm">PnL This Month</div>
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

      {/* PRICING - REDESIGNED */}
      <section id="pricing" className="py-16 md:py-24 relative z-10">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
               <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6">Simple, Transparent Pricing</h2>
               <p className="text-sm md:text-base text-gray-400">Choose the plan that fits your trading style.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
               
               {/* DEMO */}
               <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 bg-[#0a0a0a]/60 flex flex-col hover:border-white/20 transition-colors">
                  <div className="mb-4 text-gray-400 font-bold tracking-widest text-xs md:text-sm uppercase">Starter</div>
                  <div className="mb-6">
                     <span className="text-3xl md:text-4xl font-bold text-white">Free</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-8">Perfect for testing the waters and paper trading.</p>
                  <ul className="space-y-4 mb-8 flex-1">
                     {['Real-time Market Data', 'Basic AI Signals (15m delay)', 'Paper Trading Account', 'Limited Whale Data'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                           <Check className="w-4 h-4 text-gray-500" /> {item}
                        </li>
                     ))}
                  </ul>
                  <button onClick={() => onNavigate('APP')} className="w-full py-3 md:py-4 rounded-xl border border-white/10 hover:bg-white/5 font-bold transition-all text-sm md:text-base">
                     Try Demo
                  </button>
               </div>

               {/* PRO - HIGHLIGHTED */}
               <div className="glass-panel p-6 md:p-8 rounded-2xl border border-primary/50 bg-[#0c0c0c]/80 relative flex flex-col transform md:-translate-y-4 shadow-[0_0_40px_rgba(59,130,246,0.15)] hover:shadow-[0_0_60px_rgba(59,130,246,0.25)] transition-all order-first md:order-none mb-6 md:mb-0">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-neonBlue text-black text-[10px] md:text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg whitespace-nowrap">
                     Most Popular
                  </div>
                  <div className="mb-4 text-primary font-bold tracking-widest text-xs md:text-sm uppercase">Pro Trader</div>
                  <div className="mb-6 flex items-baseline gap-1">
                     <span className="text-3xl md:text-4xl font-bold text-white">$49</span>
                     <span className="text-gray-500">/mo</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-8">For serious traders who want an edge.</p>
                  <ul className="space-y-4 mb-8 flex-1">
                     {['Real-time AI Sniper Signals', 'Full Whale Analysis Suite', 'Unlimited Paper Trading', 'Priority Execution Speed', 'Private Discord Access'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-white font-medium">
                           <div className="bg-primary/20 p-0.5 rounded-full">
                             <Check className="w-3 h-3 text-primary" />
                           </div>
                           {item}
                        </li>
                     ))}
                  </ul>
                  <button onClick={() => onNavigate('SIGNUP')} className="w-full py-3 md:py-4 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-400 hover:to-primary text-white font-bold transition-all shadow-lg shadow-primary/25 hover:scale-[1.02] text-sm md:text-base">
                     Start 7-Day Trial
                  </button>
               </div>

               {/* YEARLY */}
               <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 bg-[#0a0a0a]/60 flex flex-col hover:border-secondary/30 transition-colors">
                  <div className="mb-4 text-secondary font-bold tracking-widest text-xs md:text-sm uppercase">Institutional</div>
                  <div className="mb-6 flex items-baseline gap-1">
                     <span className="text-3xl md:text-4xl font-bold text-white">$39</span>
                     <span className="text-gray-500">/mo</span>
                  </div>
                  <div className="text-[10px] md:text-xs text-secondary bg-secondary/10 inline-block px-2 py-1 rounded mb-6 border border-secondary/20">
                     Billed Yearly ($468)
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                     {['All Pro Features', 'API Access', 'Dedicated Support', 'Custom Strategy Builder', 'On-chain Alerts'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                           <Check className="w-4 h-4 text-secondary" /> {item}
                        </li>
                     ))}
                  </ul>
                  <button onClick={() => onNavigate('SIGNUP')} className="w-full py-3 md:py-4 rounded-xl border border-white/10 hover:bg-white/5 font-bold transition-all hover:border-secondary/50 hover:text-secondary text-sm md:text-base">
                     Choose Yearly
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
