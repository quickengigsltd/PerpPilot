import React, { useState } from 'react';
import { MarketState } from '../types';
import { ArrowUp, ArrowDown, DollarSign, AlertTriangle, Target, MinusCircle } from 'lucide-react';

interface TradePanelProps {
  marketState: MarketState | null;
  balance: number;
  onExecuteTrade: (type: 'LONG' | 'SHORT', amount: number, leverage: number, sl: number, tp: number) => void;
}

const TradePanel: React.FC<TradePanelProps> = ({ marketState, balance, onExecuteTrade }) => {
  const [amount, setAmount] = useState<string>('1000');
  const [leverage, setLeverage] = useState<number>(5);
  const [slPercent, setSlPercent] = useState<number>(1.5);
  const [tpPercent, setTpPercent] = useState<number>(3.0);

  if (!marketState) return <div className="glass-panel h-full animate-pulse"></div>;

  const price = marketState.price;
  const amountNum = parseFloat(amount) || 0;
  const positionSize = amountNum * leverage;
  
  // Calculations
  // Ensure TP/SL are positive numbers for calculation
  const safeTp = Math.max(0.1, tpPercent);
  const safeSl = Math.max(0.1, slPercent);

  const longSlPrice = price * (1 - safeSl / 100);
  const longTpPrice = price * (1 + safeTp / 100);
  const shortSlPrice = price * (1 + safeSl / 100);
  const shortTpPrice = price * (1 - safeTp / 100);

  const estimatedFee = positionSize * 0.0006; // 0.06% taker fee
  
  // Calculate estimated PnL value
  const estProfitValue = (positionSize * safeTp) / 100;
  const estLossValue = (positionSize * safeSl) / 100;

  return (
    <div className="glass-panel p-6 rounded-xl h-full flex flex-col overflow-y-auto custom-scrollbar">
      <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-primary" />
        Execution {marketState.isRealtime && <span className="ml-auto text-[10px] text-green-400 animate-pulse uppercase border border-green-500/50 px-2 rounded-full">Live</span>}
      </h3>

      {/* Leverage Slider */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Leverage</span>
            <span className="text-primary font-mono font-bold">{leverage}x</span>
        </div>
        <input 
            type="range" 
            min="1" 
            max="50" 
            value={leverage} 
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-blue-400"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>1x</span>
            <span>25x</span>
            <span>50x</span>
        </div>
      </div>

      {/* Order Size */}
      <div className="mb-6">
        <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">Margin (USDT)</label>
        <div className="relative">
            <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black/20 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
            />
            <span className="absolute right-4 top-3.5 text-gray-500 text-sm">USDT</span>
        </div>
        <div className="text-right mt-1 text-xs text-gray-500">
            Bal: ${balance.toLocaleString()}
        </div>
      </div>

      {/* Risk Management Inputs */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
           <label className="flex items-center gap-1 text-xs text-gray-400 mb-2">
             <Target className="w-3 h-3" /> Take Profit (%)
           </label>
           <div className="relative">
              <input 
                type="number" 
                step="0.1"
                min="0.1"
                value={tpPercent}
                onChange={(e) => setTpPercent(parseFloat(e.target.value))}
                className="w-full bg-black/20 border border-gray-700 rounded-lg py-2 px-3 text-bullish focus:outline-none focus:border-bullish ring-1 ring-transparent focus:ring-bullish/20 font-mono text-sm"
              />
              <span className="absolute right-3 top-2 text-gray-600 text-xs">%</span>
           </div>
           <div className="text-[10px] text-bullish/70 mt-1 text-right font-mono">
             +${estProfitValue.toFixed(2)}
           </div>
        </div>
        <div>
           <label className="flex items-center gap-1 text-xs text-gray-400 mb-2">
             <MinusCircle className="w-3 h-3" /> Stop Loss (%)
           </label>
           <div className="relative">
              <input 
                type="number" 
                step="0.1"
                min="0.1"
                value={slPercent}
                onChange={(e) => setSlPercent(parseFloat(e.target.value))}
                className="w-full bg-black/20 border border-gray-700 rounded-lg py-2 px-3 text-danger focus:outline-none focus:border-danger ring-1 ring-transparent focus:ring-danger/20 font-mono text-sm"
              />
              <span className="absolute right-3 top-2 text-gray-600 text-xs">%</span>
           </div>
           <div className="text-[10px] text-danger/70 mt-1 text-right font-mono">
             -${estLossValue.toFixed(2)}
           </div>
        </div>
      </div>
      
      <div className="bg-white/5 rounded-lg p-3 mb-6 space-y-2">
        <div className="flex justify-between text-xs">
            <span className="text-gray-400">Position Size</span>
            <span className="text-white font-mono">${positionSize.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs">
            <span className="text-gray-400">Entry Price</span>
            <span className="text-white font-mono">${price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs">
            <span className="text-gray-400">Est. Fee</span>
            <span className="text-gray-300 font-mono">${estimatedFee.toFixed(2)}</span>
        </div>
        {amountNum > balance && (
            <div className="flex items-center gap-1 text-danger text-xs pt-1 border-t border-white/5 mt-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Insufficient Balance</span>
            </div>
        )}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-auto">
        <button
          disabled={amountNum > balance || amountNum <= 0}
          onClick={() => onExecuteTrade('LONG', amountNum, leverage, longSlPrice, longTpPrice)}
          className="group relative overflow-hidden bg-bullish/10 hover:bg-bullish/20 border border-bullish/50 text-bullish py-4 rounded-xl font-bold flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
             <ArrowUp className="w-5 h-5" /> LONG
          </div>
          <span className="text-[10px] opacity-70 mt-1 font-mono group-hover:opacity-100">TP: ${longTpPrice.toFixed(2)}</span>
        </button>
        <button
          disabled={amountNum > balance || amountNum <= 0}
          onClick={() => onExecuteTrade('SHORT', amountNum, leverage, shortSlPrice, shortTpPrice)}
          className="group relative overflow-hidden bg-bearish/10 hover:bg-bearish/20 border border-bearish/50 text-bearish py-4 rounded-xl font-bold flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            <ArrowDown className="w-5 h-5" /> SHORT
          </div>
          <span className="text-[10px] opacity-70 mt-1 font-mono group-hover:opacity-100">TP: ${shortTpPrice.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
};

export default TradePanel;