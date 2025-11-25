
import React, { useState, useEffect } from 'react';
import { MarketState, GemAnalysis } from '../types';
import { analyzeTokenPotential } from '../services/geminiService';
import { Radar, Target, Rocket, Search, AlertTriangle, Crosshair, BarChart3, Scan, Lock, CheckCircle2, Zap, Timer, TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';
import TokenIcon from './TokenIcon';
import { AVAILABLE_PAIRS } from '../constants';

interface GemHunterProps {
    marketState: MarketState | null;
    onPairChange: (pair: string) => void;
}

const GemHunter: React.FC<GemHunterProps> = ({ marketState, onPairChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [analysis, setAnalysis] = useState<GemAnalysis | null>(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanMode, setScanMode] = useState<'GEM' | 'SCALP'>('GEM');

    // Reset analysis when mode or pair changes
    useEffect(() => {
        setAnalysis(null);
    }, [scanMode, marketState?.pair]);

    const handleScan = async () => {
        if (!marketState) return;
        
        setIsScanning(true);
        setAnalysis(null);
        setScanProgress(0);

        // Fake progress for effect
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 10;
            });
        }, 150);

        try {
            const result = await analyzeTokenPotential(marketState, scanMode);
            setScanProgress(100);
            setTimeout(() => {
                setAnalysis(result);
                setIsScanning(false);
                clearInterval(interval);
            }, 500);
        } catch (error) {
            console.error(error);
            setIsScanning(false);
            clearInterval(interval);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Find closest pair
        const match = AVAILABLE_PAIRS.find(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
        if (match) {
            onPairChange(match);
        }
    };

    const getVerdictColor = (v: string) => {
        switch(v) {
            case 'GENERATIONAL_BUY': return 'text-neonBlue';
            case 'GOOD_DIP': return 'text-bullish';
            case 'LONG_SCALP': return 'text-bullish';
            case 'SHORT_SCALP': return 'text-bearish';
            case 'WAIT_LOWER': 
            case 'WAIT_FOR_ENTRY': return 'text-yellow-500';
            case 'DO_NOT_TOUCH': return 'text-bearish';
            default: return 'text-white';
        }
    };

    if (!marketState) return <div className="p-10 text-center animate-pulse">Initializing Scanner Uplink...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 pb-20 animate-in fade-in zoom-in duration-500">
            
            {/* HEADER & TOGGLE */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Radar className="w-8 h-8 text-neonBlue animate-spin-slow" />
                        SNIPER <span className="text-neonBlue">TERMINAL</span>
                    </h1>
                    <p className="text-gray-400 mt-1">AI-Powered Volatility & Trade Setup Analyzer</p>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    {/* MODE SWITCH */}
                    <div className="bg-black border border-white/10 rounded-full p-1 flex relative">
                        <div 
                           className={`absolute top-1 bottom-1 w-1/2 bg-white/10 rounded-full transition-all duration-300 ${scanMode === 'SCALP' ? 'translate-x-full' : 'translate-x-0'}`}
                        />
                        <button 
                            onClick={() => setScanMode('GEM')}
                            className={`relative z-10 px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${scanMode === 'GEM' ? 'text-white' : 'text-gray-500'}`}
                        >
                            <Target className="w-3 h-3" /> GEM HUNTER
                        </button>
                        <button 
                            onClick={() => setScanMode('SCALP')}
                            className={`relative z-10 px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${scanMode === 'SCALP' ? 'text-neonBlue' : 'text-gray-500'}`}
                        >
                            <Zap className="w-3 h-3" /> SCALP SNIPER
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className="relative hidden md:block">
                        <input 
                            type="text" 
                            placeholder="SEARCH PAIR" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-40 bg-black/40 border border-white/10 rounded-full py-2 pl-10 pr-4 text-white text-xs focus:border-neonBlue transition-all font-mono"
                        />
                        <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
                    </form>
                </div>
            </div>

            {/* MAIN SCANNER AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT: TOKEN CARD */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className={`glass-panel p-6 rounded-2xl border bg-gradient-to-b from-[#121212] to-black relative overflow-hidden group transition-all ${scanMode === 'SCALP' ? 'border-neonBlue/30 shadow-[0_0_20px_rgba(0,243,255,0.1)]' : 'border-white/10'}`}>
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${scanMode === 'SCALP' ? 'from-neonBlue to-purple-500' : 'from-primary to-emerald-500'}`}></div>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <TokenIcon pair={marketState.pair} size="lg" className="shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
                            <div>
                                <h2 className="text-2xl font-bold text-white leading-none">{marketState.pair.split('/')[0]}</h2>
                                <span className="text-xs text-gray-500 font-mono flex items-center gap-1 mt-1">
                                    {scanMode === 'GEM' ? 'SWING ANALYSIS' : '15M SCALP DATA'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                <span className="text-gray-400 text-sm">Mark Price</span>
                                <span className="text-2xl font-mono font-bold text-white">${marketState.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                <span className="text-gray-400 text-sm">24h Change</span>
                                <span className={`text-lg font-mono font-bold ${marketState.change24h >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                                    {marketState.change24h.toFixed(2)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-end pb-2">
                                <span className="text-gray-400 text-sm">{scanMode === 'GEM' ? 'Drawdown (30d)' : 'Volatility (1h)'}</span>
                                <span className="text-lg font-mono font-bold text-orange-400">
                                    {scanMode === 'GEM' 
                                        ? `-${marketState.macroStats ? marketState.macroStats.drawdownFromHigh.toFixed(2) : 0}%`
                                        : `${(marketState.indicators.bollingerUpper - marketState.indicators.bollingerLower).toFixed(4)}`
                                    }
                                </span>
                            </div>
                        </div>

                        <button 
                            onClick={handleScan}
                            disabled={isScanning}
                            className={`w-full mt-6 py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                                scanMode === 'SCALP' 
                                ? 'bg-neonBlue/10 hover:bg-neonBlue/20 border border-neonBlue/50 text-neonBlue hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]' 
                                : 'bg-primary/10 hover:bg-primary/20 border border-primary/50 text-primary hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                            }`}
                        >
                            {isScanning ? <Scan className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
                            {isScanning ? 'ANALYZING CHART...' : scanMode === 'SCALP' ? 'FIND SCALP SETUP' : 'ANALYZE GEM POTENTIAL'}
                        </button>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-panel p-4 rounded-xl border border-white/5 text-center">
                            <div className="text-[10px] text-gray-500 uppercase font-bold">RSI Strength</div>
                            <div className={`text-xl font-bold ${marketState.indicators.rsi < 30 ? 'text-bullish' : marketState.indicators.rsi > 70 ? 'text-bearish' : 'text-white'}`}>
                                {marketState.indicators.rsi.toFixed(1)}
                            </div>
                        </div>
                        <div className="glass-panel p-4 rounded-xl border border-white/5 text-center">
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Trend (EMA)</div>
                            <div className={`text-xl font-bold ${marketState.price > marketState.indicators.ema50 ? 'text-bullish' : 'text-bearish'}`}>
                                {marketState.price > marketState.indicators.ema50 ? 'BULLISH' : 'BEARISH'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: ANALYSIS RESULT */}
                <div className="lg:col-span-8">
                    {isScanning ? (
                         <div className="h-full min-h-[400px] glass-panel rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] via-transparent to-transparent animate-pulse ${scanMode === 'SCALP' ? 'from-neonBlue/10' : 'from-primary/10'}`}></div>
                            {scanMode === 'SCALP' ? <Zap className="w-24 h-24 text-neonBlue animate-pulse mb-6 relative z-10" /> : <Radar className="w-24 h-24 text-primary animate-spin duration-[3000ms] mb-6 relative z-10" />}
                            <h3 className="text-xl font-bold text-white mb-2 relative z-10">
                                {scanMode === 'SCALP' ? 'Calculating Entry & Invalidation...' : 'Analyzing Market Structure...'}
                            </h3>
                            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden relative z-10">
                                <div className={`h-full transition-all duration-200 ${scanMode === 'SCALP' ? 'bg-neonBlue' : 'bg-primary'}`} style={{ width: `${scanProgress}%` }}></div>
                            </div>
                         </div>
                    ) : analysis ? (
                        <div className="h-full glass-panel rounded-2xl border border-white/10 bg-[#0a0a0a] relative overflow-hidden flex flex-col">
                            
                            {/* SCORE HEADER */}
                            <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row gap-6 items-center justify-between bg-white/5">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" stroke="#1a1a1a" strokeWidth="8" fill="none" />
                                            <circle cx="50" cy="50" r="45" stroke={scanMode === 'SCALP' ? '#00f3ff' : '#3B82F6'} strokeWidth="8" fill="none" strokeDasharray="283" strokeDashoffset={283 - (283 * analysis.score / 100)} strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-2xl font-black text-white">{analysis.score}</span>
                                            <span className="text-[8px] text-gray-400 uppercase">Score</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">
                                            {scanMode === 'SCALP' ? 'Setup Validity' : 'Gem Verdict'}
                                        </div>
                                        <div className={`text-3xl md:text-4xl font-black tracking-tight ${getVerdictColor(analysis.verdict)} drop-shadow-lg`}>
                                            {analysis.verdict.replace(/_/g, ' ')}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <div className={`flex items-center justify-end gap-2 font-bold text-xl mb-1 ${scanMode === 'SCALP' ? 'text-neonBlue' : 'text-primary'}`}>
                                        <Rocket className="w-5 h-5" /> {analysis.potentialMultiplier}
                                     </div>
                                     <div className="text-xs text-gray-500 uppercase">{scanMode === 'SCALP' ? 'Target PnL' : 'Potential Upside'}</div>
                                </div>
                            </div>

                            {/* TRADE PLAN (SCALP) vs GEM DETAILS */}
                            <div className="p-6 md:p-8 space-y-8 flex-1">
                                
                                {/* 1. AI REASONING */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-gray-400" /> AI Strategy
                                    </h4>
                                    <p className={`text-gray-300 leading-relaxed border-l-2 pl-4 py-1 ${scanMode === 'SCALP' ? 'border-neonBlue bg-neonBlue/5' : 'border-primary bg-primary/5'}`}>
                                        "{analysis.analysis}"
                                    </p>
                                </div>

                                {/* 2. TRADE PLAN OR STATS */}
                                {scanMode === 'SCALP' ? (
                                    <div className="bg-[#050505] border border-white/10 rounded-xl p-5 shadow-inner">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Crosshair className="w-4 h-4 text-neonBlue" /> Trade Execution Plan
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                                <div className="text-[10px] text-gray-500 uppercase mb-1">Entry Zone</div>
                                                <div className="text-sm font-mono font-bold text-white">{analysis.entryZone}</div>
                                            </div>
                                            <div className="bg-red-900/10 rounded-lg p-3 border border-red-500/20">
                                                <div className="text-[10px] text-red-400 uppercase mb-1">Stop Loss</div>
                                                <div className="text-sm font-mono font-bold text-red-400">{analysis.stopLoss}</div>
                                            </div>
                                            <div className="bg-green-900/10 rounded-lg p-3 border border-green-500/20">
                                                <div className="text-[10px] text-green-400 uppercase mb-1">Main Target</div>
                                                <div className="text-sm font-mono font-bold text-green-400">{analysis.tpTargets?.[0] || 'N/A'}</div>
                                            </div>
                                        </div>
                                        {analysis.tpTargets && analysis.tpTargets.length > 0 && (
                                            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                                                <span>Extensions:</span>
                                                {analysis.tpTargets.map((tp, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-gray-300">TP{i+1}: {tp}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* GEM STATS */
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                                <Target className="w-3 h-3" /> Entry Zone
                                            </h4>
                                            <div className="text-xl font-mono font-bold text-white">{analysis.entryZone}</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                                <AlertTriangle className="w-3 h-3" /> Risk Level
                                            </h4>
                                            <div className={`text-xl font-bold ${analysis.riskLevel === 'SAFE' ? 'text-green-400' : analysis.riskLevel === 'DEGEN' ? 'text-red-500' : 'text-orange-400'}`}>
                                                {analysis.riskLevel}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 3. METERS */}
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-white/5 rounded-lg p-3">
                                         <div className="flex justify-between mb-2">
                                             <span className="text-[10px] text-gray-400 uppercase font-bold">Volume Flow</span>
                                             <span className="text-xs font-bold text-white">{analysis.volumeScore}/10</span>
                                         </div>
                                         <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                             <div className="h-full bg-blue-500" style={{ width: `${analysis.volumeScore * 10}%` }}></div>
                                         </div>
                                     </div>
                                     <div className="bg-white/5 rounded-lg p-3">
                                         <div className="flex justify-between mb-2">
                                             <span className="text-[10px] text-gray-400 uppercase font-bold">Volatility</span>
                                             <span className="text-xs font-bold text-white">{analysis.volatilityScore}/10</span>
                                         </div>
                                         <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                             <div className="h-full bg-purple-500" style={{ width: `${analysis.volatilityScore * 10}%` }}></div>
                                         </div>
                                     </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full glass-panel rounded-2xl border border-white/10 flex flex-col items-center justify-center text-gray-500">
                            {scanMode === 'SCALP' ? <Zap className="w-16 h-16 opacity-20 mb-4" /> : <Target className="w-16 h-16 opacity-20 mb-4" />}
                            <p className="text-sm font-medium">Select a pair and initialize {scanMode === 'SCALP' ? 'Scalp' : 'Gem'} Algorithm.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default GemHunter;
