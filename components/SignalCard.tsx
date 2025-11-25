
import React from 'react';
import { AISignal } from '../types';
import { BrainCircuit, Zap, Target, Shield, AlertTriangle, PlayCircle, StopCircle, PauseCircle, Activity, Lock, Search } from 'lucide-react';

interface SignalCardProps {
  signal: AISignal | null;
  isLoading: boolean;
  onGenerate: () => void;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal, isLoading, onGenerate }) => {
  // --- STATE: IDLE / LOADING ---
  if (!signal) {
    return (
      <div className="glass-panel p-6 rounded-xl h-full flex flex-col items-center justify-center text-center relative overflow-hidden group border border-white/5 bg-[#050505]">
        
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50"></div>
        
        <div className="relative z-10 mb-8">
          <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.1)] relative">
            {isLoading ? (
               <>
                 <div className="absolute inset-0 border-2 border-primary/50 rounded-2xl animate-ping opacity-20"></div>
                 <Activity className="w-8 h-8 text-primary animate-pulse" />
               </>
            ) : (
                <BrainCircuit className="w-8 h-8 text-gray-300" />
            )}
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
            {isLoading ? 'ANALYZING MARKET DATA...' : 'AI STRATEGY AGENT'}
          </h3>
          <p className="text-sm text-gray-500 max-w-[260px] mx-auto leading-relaxed">
            {isLoading 
              ? 'Cross-referencing Orderbook Depth, Whale Flow, and 30-Day Market Structure.' 
              : 'Deploy the "Sniper" algorithm to find high-probability setups with 99% confluence.'}
          </p>
        </div>

        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="relative z-10 w-full max-w-[220px] bg-white/10 hover:bg-white/20 border border-white/10 text-white py-4 rounded-xl font-bold tracking-wider transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150"></span>
            </div>
          ) : (
            <>
              <Search className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              ANALYZE SETUP
            </>
          )}
        </button>
      </div>
    );
  }

  // --- STATE: SIGNAL GENERATED (BINARY ONLY) ---
  const isLong = signal.action === 'GO LONG';
  // Fallback for types, but logic is strictly Long/Short now
  const isShort = signal.action === 'GO SHORT' || (!isLong && signal.action !== 'GO LONG'); 

  const mainColor = isLong ? 'text-bullish' : 'text-bearish';
  const bgGlow = isLong ? 'bg-bullish' : 'bg-bearish';
  const borderColor = isLong ? 'border-bullish' : 'border-bearish';
  
  return (
    <div className={`glass-panel rounded-xl h-full flex flex-col border-t-2 ${borderColor} relative overflow-hidden shadow-2xl bg-[#080808]`}>
      
      {/* HEADER */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${bgGlow} animate-pulse`}></div>
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Signal Generated</span>
        </div>
        <div className="text-[10px] text-gray-600 font-mono">
            ID: {signal.timestamp.toString().slice(-6)}
        </div>
      </div>

      {/* MAIN DECISION AREA */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
         {/* Background Glow Effect */}
         <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 ${bgGlow} opacity-[0.07] blur-[80px] rounded-full`}></div>
         
         <div className="relative z-10 text-center w-full">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-4">Execution Command</div>
            
            <div className={`text-5xl md:text-6xl font-black tracking-tighter mb-6 ${mainColor} drop-shadow-2xl`}>
                {signal.action}
            </div>
            
            {/* Confidence Bar */}
            <div className="max-w-[180px] mx-auto">
                <div className="flex justify-between text-[10px] text-gray-500 uppercase mb-1 font-bold">
                    <span>Certainty</span>
                    <span className="text-white">{signal.confidence}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${bgGlow}`} 
                        style={{ width: `${signal.confidence}%` }}
                    ></div>
                </div>
            </div>
         </div>
      </div>

      {/* REASONING & ACTIONS */}
      <div className="p-5 bg-[#050505] border-t border-white/5">
         
         <div className="bg-white/5 rounded-lg p-3 mb-4 border border-white/5">
            <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300 leading-snug font-medium">
                    "{signal.reasoning}"
                </p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-3">
             <div className="bg-black/30 p-2.5 rounded border border-white/5 text-center">
                 <div className="text-[9px] text-gray-500 uppercase mb-1">Whale Sentiment</div>
                 <div className={`text-xs font-bold ${signal.indicators.smartMoneyScore > 0 ? 'text-bullish' : 'text-bearish'}`}>
                     {signal.indicators.smartMoneyScore > 0 ? 'ACCUMULATION' : 'DISTRIBUTION'}
                 </div>
             </div>
             <div className="bg-black/30 p-2.5 rounded border border-white/5 text-center">
                 <div className="text-[9px] text-gray-500 uppercase mb-1">Structure</div>
                 <div className={`text-xs font-bold ${signal.indicators.marketStructure === 'BULLISH' ? 'text-bullish' : signal.indicators.marketStructure === 'BEARISH' ? 'text-bearish' : 'text-yellow-500'}`}>
                     {signal.indicators.marketStructure}
                 </div>
             </div>
         </div>

         <button 
            onClick={onGenerate}
            className="w-full mt-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
         >
            <Zap className="w-3 h-3" /> Re-Scan Market
         </button>
      </div>
    </div>
  );
};

export default SignalCard;
