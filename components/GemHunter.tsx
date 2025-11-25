
import React, { useState, useEffect } from 'react';
import { MarketState, GemAnalysis } from '../types';
import { analyzeTokenPotential } from '../services/geminiService';
import { Radar, Target, Rocket, Search, AlertTriangle, Crosshair, BarChart3, Scan, Lock, CheckCircle2 } from 'lucide-react';
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

    // Initial load scan
    useEffect(() => {
        if (marketState && !analysis && !isScanning) {
            handleScan();
        }
    }, [marketState?.pair]);

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
        }, 200);

        try {
            const result = await analyzeTokenPotential(marketState);
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
            // Effect will trigger scan
        }
    };

    const getVerdictColor = (v: string) => {
        switch(v) {
            case 'GENERATIONAL_BUY': return 'text-neonBlue';
            case 'GOOD_DIP': return 'text-bullish';
            case 'WAIT_LOWER': return 'text-yellow-500';
            case 'DO_NOT_TOUCH': return 'text-bearish';
            default: return 'text-white';
        }
    };

    if (!marketState) return <div className="p-10 text-center animate-pulse">Initializing Scanner Uplink...</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 pb-20 animate-in fade-in zoom-in duration-500">
            
            {/* SEARCH HEADER */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Radar className="w-8 h-8 text-neonBlue animate-spin-slow" />
                        GEM HUNTER <span className="text-neonBlue">SNIPER</span>
                    </h1>
                    <p className="text-gray-400 mt-1">AI-Powered Volatility & Dip Analyzer</p>
                </div>

                <form onSubmit={handleSearch} className="relative w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="SEARCH TOKEN (e.g. PEPE)" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-80 bg-black/40 border border-white/10 rounded-full py-3 pl-12 pr-6 text-white focus:border-neonBlue focus:ring-1 focus:ring-neonBlue/50 transition-all font-mono"
                    />
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                </form>
            </div>

            {/* MAIN SCANNER AREA */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* LEFT: TOKEN CARD */}
                <div className="md:col-span-4 flex flex-col gap-4">
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-[#121212] to-black relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neonBlue to-primary"></div>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <TokenIcon pair={marketState.pair} size="lg" className="shadow-[0_0_20px_rgba(0,243,255,0.2)]" />
                            <div>
                                <h2 className="text-2xl font-bold text-white leading-none">{marketState.pair.split('/')[0]}</h2>
                                <span className="text-xs text-gray-500 font-mono">PERPETUAL CONTRACT</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                <span className="text-gray-400 text-sm">Price</span>
                                <span className="text-2xl font-mono font-bold text-white">${marketState.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                <span className="text-gray-400 text-sm">24h Change</span>
                                <span className={`text-lg font-mono font-bold ${marketState.change24h >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                                    {marketState.change24h.toFixed(2)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-end pb-2">
                                <span className="text-gray-400 text-sm">Drawdown (30d)</span>
                                <span className="text-lg font-mono font-bold text-orange-400">
                                    {marketState.macroStats ? `-${marketState.macroStats.drawdownFromHigh.toFixed(2)}%` : 'N/A'}
                                </span>
                            </div>
                        </div>

                        <button 
                            onClick={handleScan}
                            disabled={isScanning}
                            className="w-full mt-6 py-4 bg-neonBlue/10 hover:bg-neonBlue/20 border border-neonBlue/50 text-neonBlue font-bold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_30px_rgba(0,243,255,0.2)]"
                        >
                            {isScanning ? <Scan className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
                            {isScanning ? 'SCANNING MEMPOOL...' : 'RUN SNIPER SCAN'}
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-panel p-4 rounded-xl border border-white/5 text-center">
                            <div className="text-[10px] text-gray-500 uppercase font-bold">RSI (14)</div>
                            <div className={`text-xl font-bold ${marketState.indicators.rsi < 30 ? 'text-green-400' : marketState.indicators.rsi > 70 ? 'text-red-400' : 'text-white'}`}>
                                {marketState.indicators.rsi.toFixed(1)}
                            </div>
                        </div>
                        <div className="glass-panel p-4 rounded-xl border border-white/5 text-center">
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Whale CVD</div>
                            <div className={`text-xl font-bold ${marketState.metrics.cvd > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {marketState.metrics.cvd > 0 ? 'BUYING' : 'SELLING'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: ANALYSIS RESULT */}
                <div className="md:col-span-8">
                    {isScanning ? (
                         <div className="h-full min-h-[400px] glass-panel rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neonBlue/10 via-transparent to-transparent animate-pulse"></div>
                            <Radar className="w-24 h-24 text-neonBlue animate-spin duration-[3000ms] mb-6 relative z-10" />
                            <h3 className="text-xl font-bold text-white mb-2 relative z-10">Analyzing Market Structure</h3>
                            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden relative z-10">
                                <div className="h-full bg-neonBlue transition-all duration-200" style={{ width: `${scanProgress}%` }}></div>
                            </div>
                            <div className="mt-4 text-xs font-mono text-neonBlue">
                                {scanProgress < 30 && "Fetching Order Book Depth..."}
                                {scanProgress >= 30 && scanProgress < 60 && "Calculating Volatility Index..."}
                                {scanProgress >= 60 && "Predicting Multiplier Potential..."}
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
                                            <circle cx="50" cy="50" r="45" stroke="#00f3ff" strokeWidth="8" fill="none" strokeDasharray="283" strokeDashoffset={283 - (283 * analysis.score / 100)} strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-2xl font-black text-white">{analysis.score}</span>
                                            <span className="text-[8px] text-gray-400 uppercase">Score</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Sniper Verdict</div>
                                        <div className={`text-3xl md:text-4xl font-black tracking-tight ${getVerdictColor(analysis.verdict)} drop-shadow-lg`}>
                                            {analysis.verdict.replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <div className="flex items-center justify-end gap-2 text-neonBlue font-bold text-xl mb-1">
                                        <Rocket className="w-5 h-5" /> {analysis.potentialMultiplier}
                                     </div>
                                     <div className="text-xs text-gray-500 uppercase">Potential Upside</div>
                                </div>
                            </div>

                            {/* DETAILS */}
                            <div className="p-6 md:p-8 space-y-8 flex-1">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-primary" /> AI Analysis
                                    </h4>
                                    <p className="text-gray-300 leading-relaxed border-l-2 border-neonBlue pl-4 py-1 bg-neonBlue/5">
                                        "{analysis.analysis}"
                                    </p>
                                </div>

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

                                {/* Catalysts */}
                                <div>
                                     <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-3">Key Catalysts</h4>
                                     <div className="flex flex-wrap gap-2">
                                         {analysis.keyCatalysts?.map((cat, i) => (
                                             <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-gray-300 flex items-center gap-2">
                                                <CheckCircle2 className="w-3 h-3 text-neonBlue" /> {cat}
                                             </span>
                                         ))}
                                     </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full glass-panel rounded-2xl border border-white/10 flex flex-col items-center justify-center text-gray-500">
                            <Target className="w-16 h-16 opacity-20 mb-4" />
                            <p>Select a token and run scanning algorithm.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default GemHunter;
