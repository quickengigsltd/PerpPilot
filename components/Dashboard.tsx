
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AVAILABLE_PAIRS, INITIAL_BALANCE, INITIAL_PRICES, TIMEFRAMES } from '../constants';
import { MarketState, Position, AISignal, ViewState, Timeframe } from '../types';
import { marketService } from '../services/marketData';
import { generateAISignal } from '../services/geminiService';
import Chart from './Chart';
import TradePanel from './TradePanel';
import PositionsTable from './PositionsTable';
import SignalCard from './SignalCard';
import IndicatorMetrics from './IndicatorMetrics';
import TokenIcon from './TokenIcon';
import WhaleAnalysis from './WhaleAnalysis';
import AiTrader from './AiTrader';
import GemHunter from './GemHunter';
import { Wallet, LayoutGrid, ChevronDown, Activity, Zap, BarChart2, LogOut, LineChart, Target, List, Layers, Bot, Power, BrainCircuit, Clock, Radar } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

type MobileTab = 'MARKET' | 'TRADE' | 'POSITIONS' | 'WHALE' | 'AI_TRADER' | 'GEM_HUNTER';

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  // State
  const [selectedPair, setSelectedPair] = useState(AVAILABLE_PAIRS[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('5m'); // Default to 5m for 'Sniper' feel
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [marketState, setMarketState] = useState<MarketState | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [signal, setSignal] = useState<AISignal | null>(null);
  const [isGeneratingSignal, setIsGeneratingSignal] = useState(false);
  const [isAIActive, setIsAIActive] = useState(false); // NEW: Auto-Pilot State
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>(INITIAL_PRICES);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [mobileTab, setMobileTab] = useState<MobileTab>('MARKET');
  
  // Refs for interval management
  const aiIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Start Market Service ONE time on mount.
  useEffect(() => {
    marketService.start();
  }, []);

  // 2. Handle Timeframe Switch
  const handleTimeframeChange = async (tf: Timeframe) => {
      setSelectedTimeframe(tf);
      await marketService.switchTimeframe(tf);
  };

  // 3. Subscribe to updates and Handle Pair Switching
  useEffect(() => {
    // A. IMMEDIATE UPDATE: Fetch cached state for the new pair immediately.
    const cachedState = marketService.getMarketState(selectedPair);
    setMarketState(cachedState); 

    // B. Subscribe for future updates
    const unsubscribe = marketService.subscribe((pair, state) => {
      // Update global price map
      setCurrentPrices((prev) => ({
        ...prev,
        [pair]: state.price,
      }));

      // Only update the main view if the data belongs to the currently selected pair
      if (pair === selectedPair) {
        setMarketState(state);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedPair]);

  // AI Generator Function
  const handleGenerateSignal = async () => {
    const freshState = marketService.getMarketState(selectedPair);
    if (!freshState) return;
    
    // Prevent overlapping calls
    if (isGeneratingSignal) return;

    setIsGeneratingSignal(true);

    try {
      // ARTIFICIAL DELAY: Make it feel like it's "Thinking" deeply
      await new Promise(resolve => setTimeout(resolve, 800));

      const newSignal = await generateAISignal(freshState);
      setSignal(newSignal);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSignal(false);
    }
  };

  // Reset Signal when pair changes, but keep AI active if it was on (it will regenerate)
  useEffect(() => {
    setSignal(null);
    if (isAIActive) {
      // DEBOUNCE: Wait 1.5s after user stops switching pairs to save API quota
      const timer = setTimeout(() => {
        handleGenerateSignal();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [selectedPair, selectedTimeframe]); // handleGenerateSignal is stable if logic inside uses refs/state correctly

  // AI Auto-Pilot Interval Logic (Periodic updates)
  useEffect(() => {
    if (isAIActive) {
      // Initial call is handled by the debounce effect above when enabled/switched
      
      // Set interval for every 60 seconds
      aiIntervalRef.current = setInterval(() => {
        if (!isGeneratingSignal) {
           handleGenerateSignal();
        }
      }, 60000);
    } else {
      if (aiIntervalRef.current) {
        clearInterval(aiIntervalRef.current);
        aiIntervalRef.current = null;
      }
    }

    return () => {
      if (aiIntervalRef.current) {
        clearInterval(aiIntervalRef.current);
      }
    };
  }, [isAIActive, selectedPair, selectedTimeframe]); 

  const toggleAI = () => {
    setIsAIActive(!isAIActive);
  };

  const handleExecuteTrade = (type: 'LONG' | 'SHORT', amount: number, leverage: number, sl: number, tp: number) => {
    if (amount > balance) return;
    
    if (!marketState || marketState.pair !== selectedPair) {
        console.warn("Trade blocked: Market data syncing");
        return;
    }

    const newPosition: Position = {
      id: Math.random().toString(36).substring(7),
      pair: selectedPair,
      type,
      entryPrice: marketState.price,
      amount,
      leverage,
      liquidationPrice: type === 'LONG' 
        ? marketState.price * (1 - (1 / leverage) + 0.005) // Approx liq formula
        : marketState.price * (1 + (1 / leverage) - 0.005),
      pnl: 0,
      pnlPercent: 0,
      timestamp: Date.now(),
      stopLoss: sl,
      takeProfit: tp
    };

    setPositions([newPosition, ...positions]);
    setBalance(prev => prev - amount);
  };

  const handleClosePosition = (id: string) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return;

    const currentPrice = currentPrices[pos.pair] || pos.entryPrice;
    const isLong = pos.type === 'LONG';
    const sizeInCoin = (pos.amount * pos.leverage) / pos.entryPrice;
    const pnl = (currentPrice - pos.entryPrice) * sizeInCoin * (isLong ? 1 : -1);

    setBalance(prev => prev + pos.amount + pnl);
    setPositions(prev => prev.filter(p => p.id !== id));
  };

  const getCurrentPriceDisplay = () => {
    // Prioritize marketState if it matches, otherwise fallback to currentPrices map
    if (marketState && marketState.pair === selectedPair) {
        return marketState.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    }
    const price = currentPrices[selectedPair];
    if (!price) return '...';
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  // --- DERIVED STATE FOR CONSISTENCY ---
  const displayState = (marketState && marketState.pair === selectedPair) ? marketState : null;

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans selection:bg-primary/30">
      
      {/* Header */}
      <header className="h-16 border-b border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView(ViewState.DASHBOARD)}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden sm:block">
              Perp<span className="font-light text-primary">Pilot</span>
            </h1>
          </div>

          <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />

          {/* Token Selector */}
          <div className="relative flex items-center gap-3 md:gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-all text-sm font-medium md:min-w-[160px] group"
              >
                <TokenIcon pair={selectedPair} size="sm" />
                <span className="hidden md:inline group-hover:text-white transition-colors">{selectedPair}</span>
                <span className="md:hidden">{selectedPair.split('/')[0]}</span>
                <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 text-gray-400 ml-auto transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSelectorOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsSelectorOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 py-2 max-h-[400px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                    <div className="sticky top-0 bg-[#1a1a1a] p-2 border-b border-white/5 mb-1 z-10">
                        <span className="text-[10px] uppercase font-bold text-gray-500 px-2">Select Asset</span>
                    </div>
                    {AVAILABLE_PAIRS.map(pair => (
                      <button
                        key={pair}
                        onClick={() => {
                          setSelectedPair(pair);
                          setIsSelectorOpen(false);
                          setSignal(null);
                        }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors group ${selectedPair === pair ? 'bg-primary/10' : ''}`}
                      >
                        <TokenIcon pair={pair} size="sm" />
                        <div className="flex flex-col">
                            <span className={`font-medium text-sm ${selectedPair === pair ? 'text-primary' : 'text-gray-200 group-hover:text-white'}`}>{pair}</span>
                            <span className="text-[10px] text-gray-500">Perpetual Contract</span>
                        </div>
                        {selectedPair === pair && <div className="w-1.5 h-1.5 rounded-full bg-primary ml-auto box-content border-2 border-[#1a1a1a]" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* LIVE PRICE DISPLAY */}
            <div className="flex flex-col">
               <span className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-0.5">Live Price</span>
               <div className="text-base md:text-lg font-mono font-bold text-neonBlue leading-none animate-pulse-slow">
                 ${getCurrentPriceDisplay()}
               </div>
            </div>
          </div>
        </div>

        {/* Center Nav (Desktop Only) */}
        <div className="hidden md:flex bg-white/5 p-1 rounded-full border border-white/5">
           <button 
             onClick={() => setCurrentView(ViewState.DASHBOARD)}
             className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${currentView === ViewState.DASHBOARD ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
           >
             Terminal
           </button>
           <button 
             onClick={() => setCurrentView(ViewState.AI_TRADER)}
             className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${currentView === ViewState.AI_TRADER ? 'bg-primary/20 text-primary shadow-sm' : 'text-gray-400 hover:text-white'}`}
           >
             <BrainCircuit className="w-3 h-3" />
             AI Trader
           </button>
           <button 
             onClick={() => setCurrentView(ViewState.GEM_HUNTER)}
             className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${currentView === ViewState.GEM_HUNTER ? 'bg-neonBlue/20 text-neonBlue shadow-sm' : 'text-gray-400 hover:text-white'}`}
           >
             <Radar className="w-3 h-3" />
             Gem Sniper
           </button>
           <button 
             onClick={() => setCurrentView(ViewState.WHALE_ANALYSIS)}
             className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${currentView === ViewState.WHALE_ANALYSIS ? 'bg-secondary/20 text-secondary shadow-sm' : 'text-gray-400 hover:text-white'}`}
           >
             <BarChart2 className="w-3 h-3" />
             Whale Analysis
           </button>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-4">
          
          {/* AI AGENT TOGGLE */}
          <button 
             onClick={toggleAI}
             className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border transition-all group ${
               isAIActive 
                 ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                 : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
             }`}
          >
             {isAIActive ? (
                <div className="relative">
                  <Bot className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
                </div>
             ) : (
                <Bot className="w-4 h-4 md:w-5 md:h-5" />
             )}
             <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider hidden sm:block">
               {isAIActive ? 'AI Active' : 'Enable AI'}
             </span>
             {isAIActive && (
               <Power className="w-3 h-3 ml-1 text-primary animate-pulse" />
             )}
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-full">
            <Wallet className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" />
            <div className="flex flex-col items-end leading-none">
              <span className="text-[8px] md:text-[10px] text-emerald-500/70 font-bold uppercase tracking-wider hidden sm:block">Demo Balance</span>
              <span className="font-mono text-xs md:text-sm font-bold text-emerald-400">${balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
          </div>
          
          <button 
             onClick={onLogout}
             className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-red-900/50 hover:border-red-500/50 transition-colors group"
             title="Logout"
          >
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden relative">
        
        {/* DESKTOP LAYOUT */}
        <div className="hidden md:block h-full">
            {currentView === ViewState.DASHBOARD ? (
            <div className="max-w-[1920px] mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN (Charts & Data) */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
                <div className="relative group flex flex-col gap-2">
                    {/* Timeframe Selector */}
                    <div className="flex items-center gap-2 mb-1">
                        {['1m', '5m', '15m', '30m', '1h', '4h'].map((tf) => (
                            <button
                                key={tf}
                                onClick={() => handleTimeframeChange(tf as Timeframe)}
                                className={`px-3 py-1 rounded text-xs font-bold transition-all border ${
                                    selectedTimeframe === tf 
                                    ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                                    : 'bg-white/5 text-gray-400 border-transparent hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>

                    {displayState ? (
                    <Chart 
                        data={displayState.candles} 
                        indicators={displayState.indicators} 
                        pair={selectedPair}
                        aiSignal={signal}
                        isAIActive={isAIActive}
                    />
                    ) : (
                    <div className="h-[450px] glass-panel rounded-xl flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200">
                        <Activity className="w-10 h-10 text-primary animate-spin" />
                        <span className="text-sm font-mono text-gray-400">SYNCING FEED: {selectedPair}...</span>
                    </div>
                    )}
                </div>

                <IndicatorMetrics marketState={displayState} />

                <PositionsTable 
                    positions={positions} 
                    currentPrices={currentPrices} 
                    onClosePosition={handleClosePosition} 
                />
                </div>

                {/* RIGHT COLUMN (Controls & Signals) */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
                <div className="flex-1 min-h-[500px]">
                    <TradePanel 
                        marketState={displayState} 
                        balance={balance} 
                        onExecuteTrade={handleExecuteTrade} 
                    />
                </div>
                <div className="h-auto">
                    <SignalCard 
                    signal={signal} 
                    isLoading={isGeneratingSignal} 
                    onGenerate={handleGenerateSignal} 
                    />
                </div>
                </div>
            </div>
            ) : currentView === ViewState.AI_TRADER ? (
               /* AI TRADER VIEW (Desktop) */
               <div className="max-w-7xl mx-auto h-full animate-in fade-in duration-300">
                  <AiTrader marketState={displayState} aiSignal={signal} />
               </div>
            ) : currentView === ViewState.GEM_HUNTER ? (
                /* GEM HUNTER VIEW (Desktop) */
                <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
                    <GemHunter marketState={displayState} onPairChange={setSelectedPair} />
                </div>
            ) : (
            /* WHALE ANALYSIS VIEW (Desktop) */
            <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
                <WhaleAnalysis marketState={displayState} />
            </div>
            )}
        </div>

        {/* MOBILE LAYOUT (Stacked & Tabbed) */}
        <div className="md:hidden h-full pb-20 overflow-y-auto">
             {/* Tab Content */}
             <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {mobileTab === 'MARKET' && (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {['1m', '5m', '15m', '30m', '1h'].map((tf) => (
                                <button
                                    key={tf}
                                    onClick={() => handleTimeframeChange(tf as Timeframe)}
                                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all border whitespace-nowrap ${
                                        selectedTimeframe === tf 
                                        ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                                        : 'bg-white/5 text-gray-400 border-transparent'
                                    }`}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>

                        {displayState ? (
                            <Chart 
                                data={displayState.candles} 
                                indicators={displayState.indicators} 
                                pair={selectedPair} 
                                aiSignal={signal}
                                isAIActive={isAIActive}
                            />
                        ) : (
                            <div className="h-[350px] glass-panel rounded-xl flex flex-col items-center justify-center gap-4">
                                <Activity className="w-10 h-10 text-primary animate-spin" />
                                <span className="text-xs font-mono text-gray-400">SYNCING FEED...</span>
                            </div>
                        )}
                        <IndicatorMetrics marketState={displayState} />
                    </div>
                )}

                {mobileTab === 'TRADE' && (
                    <div className="flex flex-col gap-4">
                        <SignalCard 
                            signal={signal} 
                            isLoading={isGeneratingSignal} 
                            onGenerate={handleGenerateSignal} 
                        />
                        <TradePanel 
                            marketState={displayState} 
                            balance={balance} 
                            onExecuteTrade={handleExecuteTrade} 
                        />
                    </div>
                )}

                {mobileTab === 'POSITIONS' && (
                    <div className="h-full">
                        <PositionsTable 
                            positions={positions} 
                            currentPrices={currentPrices} 
                            onClosePosition={handleClosePosition} 
                        />
                    </div>
                )}

                {mobileTab === 'AI_TRADER' && (
                    <AiTrader marketState={displayState} aiSignal={signal} />
                )}

                {mobileTab === 'GEM_HUNTER' && (
                    <GemHunter marketState={displayState} onPairChange={setSelectedPair} />
                )}

                {mobileTab === 'WHALE' && (
                    <WhaleAnalysis marketState={displayState} />
                )}
             </div>
        </div>

      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0a]/90 backdrop-blur-lg border-t border-white/10 z-50 flex items-center justify-around px-2 pb-safe">
          <button 
            onClick={() => setMobileTab('MARKET')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mobileTab === 'MARKET' ? 'text-primary' : 'text-gray-500'}`}
          >
             <LineChart className="w-5 h-5" />
             <span className="text-[10px] font-medium">Market</span>
          </button>
          
          <button 
            onClick={() => setMobileTab('TRADE')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mobileTab === 'TRADE' ? 'text-primary' : 'text-gray-500'}`}
          >
             <Target className="w-5 h-5" />
             <span className="text-[10px] font-medium">Trade</span>
          </button>

          <button 
            onClick={() => setMobileTab('GEM_HUNTER')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mobileTab === 'GEM_HUNTER' ? 'text-neonBlue' : 'text-gray-500'}`}
          >
             <Radar className="w-5 h-5" />
             <span className="text-[10px] font-medium">Sniper</span>
          </button>

           <button 
            onClick={() => setMobileTab('AI_TRADER')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mobileTab === 'AI_TRADER' ? 'text-primary' : 'text-gray-500'}`}
          >
             <BrainCircuit className="w-5 h-5" />
             <span className="text-[10px] font-medium">AI Agent</span>
          </button>

          <button 
            onClick={() => setMobileTab('POSITIONS')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors relative ${mobileTab === 'POSITIONS' ? 'text-primary' : 'text-gray-500'}`}
          >
             <div className="relative">
                <List className="w-5 h-5" />
                {positions.length > 0 && (
                    <span className="absolute -top-1 -right-2 bg-primary text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] h-[14px] flex items-center justify-center">
                        {positions.length}
                    </span>
                )}
             </div>
             <span className="text-[10px] font-medium">Pos</span>
          </button>

          <button 
            onClick={() => setMobileTab('WHALE')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mobileTab === 'WHALE' ? 'text-primary' : 'text-gray-500'}`}
          >
             <Layers className="w-5 h-5" />
             <span className="text-[10px] font-medium">Whale</span>
          </button>
      </nav>
    </div>
  );
}

export default Dashboard;
