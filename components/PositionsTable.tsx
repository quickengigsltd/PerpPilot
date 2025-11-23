import React, { useState } from 'react';
import { Position } from '../types';
import { TrendingUp, TrendingDown, Wallet, Skull, AlertTriangle, X } from 'lucide-react';
import TokenIcon from './TokenIcon';

interface PositionsTableProps {
  positions: Position[];
  currentPrices: Record<string, number>;
  onClosePosition: (id: string) => void;
}

const PositionsTable: React.FC<PositionsTableProps> = ({ positions, currentPrices, onClosePosition }) => {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleCloseClick = (id: string) => {
    setConfirmId(id);
  };

  const handleConfirmClose = () => {
    if (confirmId) {
      onClosePosition(confirmId);
      setConfirmId(null);
    }
  };

  const handleCancel = () => {
    setConfirmId(null);
  };

  // Derived state for the modal
  const positionToClose = positions.find(p => p.id === confirmId);
  let pnlDisplay = 0;
  let isProfit = false;
  
  if (positionToClose) {
      const currentPrice = currentPrices[positionToClose.pair] || positionToClose.entryPrice;
      const isLong = positionToClose.type === 'LONG';
      const sizeInCoin = (positionToClose.amount * positionToClose.leverage) / positionToClose.entryPrice;
      const rawPnL = (currentPrice - positionToClose.entryPrice) * sizeInCoin * (isLong ? 1 : -1);
      pnlDisplay = rawPnL;
      isProfit = rawPnL >= 0;
  }

  return (
    <>
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col border border-white/5 shadow-xl bg-[#0a0a0a]">
        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2">
              Open Positions
          </h3>
          <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-full font-mono">
              {positions.length} Active
          </span>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          {positions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-sm gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 opacity-30" />
                  </div>
                  <p>No active positions found</p>
              </div>
          ) : (
              <table className="w-full text-sm text-left text-gray-400 min-w-[600px]">
              <thead className="text-xs text-gray-500 uppercase bg-black/20 sticky top-0 backdrop-blur-sm z-10">
                  <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">Asset</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-right">Size (Margin)</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-right">Entry / Liq</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-right">Mark Price</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-right">PnL (ROE)</th>
                  <th className="px-6 py-4 text-right">Action</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                  {positions.map((pos) => {
                  const currentPrice = currentPrices[pos.pair] || pos.entryPrice;
                  const isLong = pos.type === 'LONG';
                  
                  // Calculate PnL dynamically
                  const sizeInCoin = (pos.amount * pos.leverage) / pos.entryPrice;
                  const rawPnL = (currentPrice - pos.entryPrice) * sizeInCoin * (isLong ? 1 : -1);
                  const pnlPercentage = (rawPnL / pos.amount) * 100;
                  const isProfitRow = rawPnL >= 0;

                  // Calculate Position Value
                  const positionValue = pos.amount * pos.leverage;

                  // Risk Warning for Liquidation
                  const distToLiq = Math.abs((currentPrice - pos.liquidationPrice) / currentPrice) * 100;
                  const isHighRisk = distToLiq < 5; // < 5% distance

                  return (
                      <tr key={pos.id} className="hover:bg-white/5 transition-colors group">
                      {/* ASSET */}
                      <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                              <TokenIcon pair={pos.pair} size="md" />
                              <div>
                                  <div className="text-white font-bold">{pos.pair.split('/')[0]}</div>
                                  <div className={`text-[10px] font-bold flex items-center gap-1 mt-0.5 uppercase tracking-wide px-1.5 py-0.5 rounded w-fit ${isLong ? 'bg-bullish/10 text-bullish' : 'bg-bearish/10 text-bearish'}`}>
                                      {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                      {pos.leverage}x {pos.type}
                                  </div>
                              </div>
                          </div>
                      </td>

                      {/* SIZE & MARGIN */}
                      <td className="px-6 py-4 text-right">
                          <div className="text-white font-mono font-medium">${positionValue.toLocaleString()}</div>
                          <div className="text-[11px] text-gray-500 flex items-center justify-end gap-1 mt-1">
                              <Wallet className="w-3 h-3 opacity-70" />
                              Margin: <span className="text-gray-300">${pos.amount.toLocaleString()}</span>
                          </div>
                      </td>

                      {/* ENTRY & LIQ */}
                      <td className="px-6 py-4 text-right font-mono">
                          <div className="text-gray-300 flex items-center justify-end gap-1">
                              <span className="text-xs text-gray-500">Entry</span> ${pos.entryPrice.toFixed(2)}
                          </div>
                          <div className={`text-[11px] flex items-center justify-end gap-1 mt-1 ${isHighRisk ? 'text-red-500 font-bold animate-pulse' : 'text-orange-400/80'}`}>
                              <Skull className="w-3 h-3" />
                              <span className="text-gray-600 mr-1">Liq</span> ${pos.liquidationPrice.toFixed(2)}
                          </div>
                      </td>

                      {/* MARK PRICE */}
                      <td className="px-6 py-4 text-right font-mono">
                          <div className="text-neonBlue font-medium">${currentPrice.toFixed(2)}</div>
                          <div className="text-[10px] text-gray-500 mt-1">Current</div>
                      </td>

                      {/* PNL */}
                      <td className="px-6 py-4 text-right">
                          <div className={`font-bold font-mono text-sm ${isProfitRow ? 'text-bullish' : 'text-bearish'}`}>
                          {rawPnL > 0 ? '+' : ''}{rawPnL.toFixed(2)}
                          </div>
                          <div className={`text-[11px] font-medium mt-1 ${isProfitRow ? 'text-bullish/70' : 'text-bearish/70'}`}>
                          {pnlPercentage.toFixed(2)}%
                          </div>
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4 text-right">
                          <button
                          onClick={() => handleCloseClick(pos.id)}
                          className="bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/30 text-gray-400 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                          >
                              Close
                          </button>
                      </td>
                      </tr>
                  );
                  })}
              </tbody>
              </table>
          )}
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmId && positionToClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="glass-panel w-full max-w-sm p-6 rounded-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative bg-[#0f0f0f]">
              <button 
                onClick={handleCancel} 
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center mb-6">
                 <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 border border-yellow-500/20 shadow-lg shadow-yellow-500/5">
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-1">Close Position?</h3>
                 <p className="text-sm text-gray-400 max-w-[240px]">
                    Are you sure you want to market close this position?
                 </p>
              </div>

              {/* Summary of Position being closed */}
              <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/5">
                 <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                       <TokenIcon pair={positionToClose.pair} size="sm" />
                       <span className="font-bold text-gray-200">{positionToClose.pair}</span>
                    </div>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${positionToClose.type === 'LONG' ? 'bg-bullish/10 text-bullish' : 'bg-bearish/10 text-bearish'}`}>
                        {positionToClose.leverage}x {positionToClose.type}
                    </span>
                 </div>
                 
                 <div className="flex justify-between items-end border-t border-white/5 pt-3 mt-1">
                    <span className="text-xs text-gray-500">Unrealized PnL</span>
                    <span className={`font-mono font-bold text-lg ${isProfit ? 'text-bullish' : 'text-bearish'}`}>
                       {pnlDisplay > 0 ? '+' : ''}{pnlDisplay.toFixed(2)} USDT
                    </span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button 
                    onClick={handleCancel}
                    className="py-3 rounded-xl border border-white/10 text-gray-300 font-medium hover:bg-white/5 transition-colors text-sm"
                 >
                    Cancel
                 </button>
                 <button 
                    onClick={handleConfirmClose}
                    className="py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold hover:bg-red-500/20 transition-all shadow-lg hover:shadow-red-500/10 text-sm flex items-center justify-center gap-2"
                 >
                    Confirm Close
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default PositionsTable;