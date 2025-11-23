
import React, { useEffect, useState, useCallback } from 'react';
import { AVAILABLE_PAIRS, INITIAL_BALANCE, INITIAL_PRICES } from '../constants';
import { MarketState, Position, AISignal, ViewState } from '../types';
import { marketService } from '../services/marketData';
import { generateAISignal } from '../services/geminiService';
import Chart from './Chart';
import TradePanel from './TradePanel';
import PositionsTable from './PositionsTable';
import SignalCard from './SignalCard';
import IndicatorMetrics from './IndicatorMetrics';
import TokenIcon from './TokenIcon';
import WhaleAnalysis from './WhaleAnalysis';
import { Wallet, LayoutGrid, ChevronDown, Activity, Zap, BarChart2, LogOut } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  // State
  const [selectedPair, setSelectedPair] = useState(AVAILABLE_PAIRS[0]);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [marketState, setMarketState] = useState<MarketState | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [signal, setSignal] = useState<AISignal | null>(null);
  const [isGeneratingSignal, setIsGeneratingSignal] = useState(false);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>(INITIAL_PRICES);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  // 1. Start Market Service ONE time on mount. Do not restart on pair switch.
  useEffect(() => {
    marketService.start();
    // Cleanup optional, but we generally want to keep connection alive
    // return () => marketService.stop(); 
  }, []);

  // 2. Subscribe to updates and Handle Pair Switching
  useEffect(() => {
    // A. IMMEDIATE UPDATE: Fetch cached state for the new pair immediately.
    // This prevents the "old price" lag by overwriting state synchronously.
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

  // Reset Signal when pair changes
  useEffect(() => {
    setSignal(null);
  }, [selectedPair]);

  const handleGenerateSignal = async () => {
    if (!marketState) return;
    
    // VISUAL FEEDBACK: Clear previous signal immediately so user sees "Analyzing..."
    setSignal(null);
    setIsGeneratingSignal(true);

    try {
      // ARTIFICIAL DELAY: Make it feel like it's "Thinking" deeply
      await new Promise(resolve => setTimeout(resolve, 800));

      // Pass full marketState to give AI access to Whale Data
      const newSignal = await generateAISignal(marketState);
      setSignal(newSignal);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSignal(false);
    }
  };

  const handleExecuteTrade = (type: 'LONG' | 'SHORT', amount: number, leverage: number, sl: number, tp: number) => {
    if (amount > balance) return;
    if (!marketState) return;

    // Safety: Ensure we aren't trading on stale data from a previous pair
    if (marketState.pair !== selectedPair) {
        console.warn("Trade blocked: Market state mismatch");
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

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans selection:bg-primary/30">
      
      {/* Header */}
      <header className="h-16 border-b border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
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
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-all text-sm font-medium min-w-[160px]"
              >
                <TokenIcon pair={selectedPair} size="sm" />
                <span>{selectedPair}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSelectorOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsSelectorOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-56 bg-surfaceHighlight border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                    {AVAILABLE_PAIRS.map(pair => (
                      <button
                        key={pair}
                        onClick={() => {
                          setSelectedPair(pair);
                          setIsSelectorOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors ${selectedPair === pair ? 'bg-primary/10 text-primary' : 'text-gray-300'}`}
                      >
                        <TokenIcon pair={pair} size="sm" />
                        <span className="font-medium">{pair}</span>
                        {selectedPair === pair && <div className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* LIVE PRICE DISPLAY */}
            <div className="flex flex-col">
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-0.5">Live Price</span>
               <div className="text-lg font-mono font-bold text-neonBlue leading-none animate-pulse-slow">
                 ${getCurrentPriceDisplay()}
               </div>
            </div>
          </div>
        </div>

        {/* Center Nav */}
        <div className="hidden md:flex bg-white/5 p-1 rounded-full border border-white/5">
           <button 
             onClick={() => setCurrentView(ViewState.DASHBOARD)}
             className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${currentView === ViewState.DASHBOARD ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
           >
             Terminal
           </button>
           <button 
             onClick={() => setCurrentView(ViewState.WHALE_ANALYSIS)}
             className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${currentView === ViewState.WHALE_ANALYSIS ? 'bg-primary/20 text-primary shadow-sm' : 'text-gray-400 hover:text-white'}`}
           >
             <BarChart2 className="w-3 h-3" />
             Whale Analysis
           </button>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-full">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col items-end leading-none">
              <span className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-wider">Demo Balance</span>
              <span className="font-mono font-bold text-emerald-400">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden">
        {currentView === ViewState.DASHBOARD ? (
          <div className="max-w-[1920px] mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN (Charts & Data) */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
              {/* Chart Section */}
              <div className="relative group">
                {marketState && marketState.pair === selectedPair ? (
                  <Chart 
                    data={marketState.candles} 
                    indicators={marketState.indicators} 
                    pair={selectedPair} 
                  />
                ) : (
                  <div className="h-[450px] glass-panel rounded-xl flex flex-col items-center justify-center gap-4">
                    <Activity className="w-10 h-10 text-primary animate-spin" />
                    <span className="text-sm font-mono text-gray-400">CONNECTING FEED: {selectedPair}...</span>
                  </div>
                )}
              </div>

              {/* Indicator Dashboard */}
              <IndicatorMetrics marketState={marketState} />

              {/* Positions Table */}
              <PositionsTable 
                positions={positions} 
                currentPrices={currentPrices} 
                onClosePosition={handleClosePosition} 
              />
            </div>

            {/* RIGHT COLUMN (Controls & Signals) */}
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
              {/* Trade Panel */}
              <div className="flex-1 min-h-[500px]">
                <TradePanel 
                  marketState={marketState && marketState.pair === selectedPair ? marketState : null} 
                  balance={balance} 
                  onExecuteTrade={handleExecuteTrade} 
                />
              </div>

              {/* AI Signal Card */}
              <div className="h-auto">
                <SignalCard 
                  signal={signal} 
                  isLoading={isGeneratingSignal} 
                  onGenerate={handleGenerateSignal} 
                />
              </div>
            </div>
          </div>
        ) : (
          /* WHALE ANALYSIS VIEW */
          <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
             <WhaleAnalysis marketState={marketState} />
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
