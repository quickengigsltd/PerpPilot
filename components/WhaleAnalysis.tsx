import React, { useState } from 'react';
import { MarketState, ExchangeData } from '../types';
import { Layers, Activity, Users, BarChart3, Clock, DollarSign, TrendingUp, TrendingDown, Info, ShieldCheck, Database, Globe } from 'lucide-react';
import TokenIcon from './TokenIcon';

interface WhaleAnalysisProps {
  marketState: MarketState | null;
}

const formatMoney = (amount: number) => {
  return '$ ' + amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// Sub-component for individual exchange row to keep main component clean
const ExchangeRow: React.FC<{ data: ExchangeData }> = ({ data }) => (
  <div className="mb-5 last:mb-0 group">
     <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
           <span className="font-bold text-white text-sm w-24 flex items-center gap-2">
             {data.name}
             {data.name === 'Binance' && <ShieldCheck className="w-3 h-3 text-bullish" />}
           </span>
           <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wide group-hover:bg-white/10 transition-colors">Volume</span>
        </div>
        <div className="text-[10px] text-gray-600 font-mono">
            {data.name === 'Binance' ? 'API STREAM' : 'AGGREGATED'}
        </div>
     </div>
     
     <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
        {/* BUY SIDE */}
        <div className="flex flex-col items-end">
           <div className="text-xs text-bullish font-mono mb-1">{formatMoney(data.buyVolume)}</div>
           <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden flex justify-end relative">
              <div className="h-full bg-bullish rounded-full relative z-10" style={{ width: `${data.buyPercent}%` }}></div>
           </div>
        </div>

        {/* PERCENTAGE MIDDLE */}
        <div className="flex flex-col items-center w-16">
            <span className="text-[10px] text-gray-500 font-mono mb-0.5">Ratio</span>
            <div className={`text-xs font-bold ${data.buyPercent > 50 ? 'text-bullish' : 'text-bearish'}`}>
                {data.buyPercent.toFixed(2)}%
            </div>
        </div>

        {/* SELL SIDE */}
        <div className="flex flex-col items-start">
           <div className="text-xs text-bearish font-mono mb-1">{formatMoney(data.sellVolume)}</div>
           <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden flex justify-start relative">
              <div className="h-full bg-bearish rounded-full relative z-10" style={{ width: `${data.sellPercent}%` }}></div>
           </div>
        </div>
     </div>
  </div>
);

const WhaleAnalysis: React.FC<WhaleAnalysisProps> = ({ marketState }) => {
  const [timeframe, setTimeframe] = useState<'1D' | '3D' | '7D'>('1D');
  const [showInfo, setShowInfo] = useState(false);

  if (!marketState || !marketState.whaleStats) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] glass-panel rounded-xl">
         <Activity className="w-16 h-16 text-primary animate-spin mb-4" />
         <p className="text-gray-400 font-mono animate-pulse">ESTABLISHING DATA STREAMS...</p>
      </div>
    );
  }

  const { whaleStats, pair } = marketState;

  return (
    <div className="glass-panel p-6 rounded-xl border border-white/5 bg-[#080808] min-h-screen relative">
       
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-white/5 pb-6 gap-4">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Layers className="w-8 h-8 text-indigo-400" />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Whale Analysis</h2>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                   <TokenIcon pair={pair} size="sm" />
                   <span className="font-mono text-indigo-300">{pair}</span>
                   <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                   <span>Global Liquidity Flow</span>
                </div>
             </div>
          </div>
          
          <div className="flex gap-1 bg-white/5 p-1 rounded-lg self-start md:self-auto">
             {['1D', '3D', '7D'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf as any)}
                  className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${timeframe === tf ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                >
                   {tf}
                </button>
             ))}
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          
          {/* COLUMN 1: Exchange Breakdown */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-[#0c0c0c] rounded-xl p-6 border border-white/5 shadow-inner">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" /> Exchange Taker Volume (Real-time)
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">
                        <div className="w-2 h-2 rounded-full bg-bullish animate-pulse"></div> LIVE FEED
                    </div>
                </div>
                <div className="space-y-8">
                   {whaleStats.exchanges.map(ex => (
                      <ExchangeRow key={ex.name} data={ex} />
                   ))}
                </div>
             </div>
          </div>

          {/* COLUMN 2: Summaries */}
          <div className="space-y-6">
             
             {/* Account Ratios */}
             <div className="bg-[#0c0c0c] rounded-xl p-6 border border-white/5">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                   <Users className="w-4 h-4 text-secondary" /> Global Accounts ({timeframe})
                </h3>
                
                <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-xs font-bold text-gray-500">LONG</span>
                    <span className="text-xs font-bold text-gray-500">SHORT</span>
                </div>

                <div className="relative h-12 bg-gray-800 rounded-lg overflow-hidden flex mb-4 border border-white/10">
                   <div className="h-full bg-bullish/20 flex items-center justify-start pl-4 relative" style={{ width: `${whaleStats.longPercentage}%` }}>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-bullish"></div>
                        <span className="font-bold text-bullish text-lg">{whaleStats.longPercentage.toFixed(2)}%</span>
                   </div>
                   <div className="h-full bg-bearish/20 flex items-center justify-end pr-4 flex-1 relative">
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-bearish"></div>
                        <span className="font-bold text-bearish text-lg">{whaleStats.shortPercentage.toFixed(2)}%</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Long Accounts</div>
                      <div className="text-xl font-mono font-bold text-white">{whaleStats.longCount.toLocaleString()}</div>
                   </div>
                   <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Short Accounts</div>
                      <div className="text-xl font-mono font-bold text-white">{whaleStats.shortCount.toLocaleString()}</div>
                   </div>
                </div>
             </div>

             {/* Liquidation Stats */}
             <div className="bg-[#0c0c0c] rounded-xl p-6 border border-white/5">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                   <Activity className="w-4 h-4 text-orange-500" /> Total Liquidation ({timeframe})
                </h3>
                
                <div className="text-center mb-8 relative">
                   <div className="absolute inset-0 bg-orange-500/5 blur-xl rounded-full"></div>
                   <div className="text-3xl font-mono font-bold text-white mb-2 relative z-10">
                      {formatMoney(whaleStats.totalLiquidation)}
                   </div>
                   <div className="text-[10px] text-orange-400/80 bg-orange-500/10 border border-orange-500/20 inline-block px-3 py-1 rounded-full font-bold tracking-wide">
                      REKT VOLUME
                   </div>
                </div>

                <div className="space-y-4">
                   <div>
                      <div className="flex justify-between text-xs mb-2">
                         <span className="text-bullish font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Long Liquidation</span>
                         <span className="text-gray-400 font-mono">{(whaleStats.longLiquidation / whaleStats.totalLiquidation * 100).toFixed(2)}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                         <div className="h-full bg-bullish" style={{ width: `${(whaleStats.longLiquidation / whaleStats.totalLiquidation * 100)}%` }}></div>
                      </div>
                      <div className="text-right text-xs font-mono text-gray-400 mt-1">{formatMoney(whaleStats.longLiquidation)}</div>
                   </div>

                   <div>
                      <div className="flex justify-between text-xs mb-2">
                         <span className="text-bearish font-bold flex items-center gap-1"><TrendingDown className="w-3 h-3"/> Short Liquidation</span>
                         <span className="text-gray-400 font-mono">{(whaleStats.shortLiquidation / whaleStats.totalLiquidation * 100).toFixed(2)}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                         <div className="h-full bg-bearish" style={{ width: `${(whaleStats.shortLiquidation / whaleStats.totalLiquidation * 100)}%` }}></div>
                      </div>
                      <div className="text-right text-xs font-mono text-gray-400 mt-1">{formatMoney(whaleStats.shortLiquidation)}</div>
                   </div>
                </div>
             </div>

             {/* Taker Buy-Sell Ratio Box */}
             <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-indigo-500/20 shadow-lg">
                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                   <Clock className="w-4 h-4" /> Taker Ratio (1D)
                </h3>
                <div className="flex items-end justify-between">
                   <div>
                      <div className="text-3xl font-bold text-white font-mono">
                         {(whaleStats.longPercentage / whaleStats.shortPercentage).toFixed(4)}
                      </div>
                      <div className="text-xs text-indigo-300/60 mt-1">Buy/Sell Volume Ratio</div>
                   </div>
                   <div className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${whaleStats.longPercentage > whaleStats.shortPercentage ? 'bg-bullish/10 border-bullish/30 text-bullish' : 'bg-bearish/10 border-bearish/30 text-bearish'}`}>
                      {whaleStats.longPercentage > whaleStats.shortPercentage ? 'NET LONG' : 'NET SHORT'}
                   </div>
                </div>
             </div>

          </div>
       </div>

       {/* Data Transparency Footer */}
       <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-[#121212] border border-white/5 rounded-lg p-3 flex items-start gap-3">
             <div className="p-1.5 bg-gray-800 rounded-md shrink-0">
                <Database className="w-4 h-4 text-gray-400" />
             </div>
             <div className="flex-1">
                <h4 className="text-xs font-bold text-gray-300 mb-1 flex items-center gap-2">
                   Data Source Verification
                   <ShieldCheck className="w-3 h-3 text-bullish" />
                </h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                   <strong>Primary Feed:</strong> Binance API (Real-time Taker Volume). 
                   <span className="mx-1">•</span>
                   <strong>Secondary Exchanges:</strong> Projected using global volume dominance ratios relative to Binance master signal.
                   <span className="mx-1">•</span>
                   <strong>Liquidation Data:</strong> Derived estimates based on real-time volatility index and volume flow.
                </p>
             </div>
          </div>
       </div>
    </div>
  );
};

export default WhaleAnalysis;