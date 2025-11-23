import React from 'react';
import { MarketState } from '../types';
import { Activity, BarChart2, DollarSign, Layers, Flame, MousePointerClick, TrendingUp, Zap, Box, Globe, Info } from 'lucide-react';

interface IndicatorMetricsProps {
  marketState: MarketState | null;
}

const IndicatorMetrics: React.FC<IndicatorMetricsProps> = ({ marketState }) => {
  if (!marketState) return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-pulse mb-6">
       {[...Array(10)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/5"></div>)}
    </div>
  );

  const { indicators, metrics } = marketState;

  // Helpers
  const formatCompact = (num: number) => Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);

  const MetricItem = ({ label, value, subValue, color, icon: Icon, span = 1 }: any) => (
    <div className={`glass-panel p-3 rounded-xl border border-white/5 flex flex-col justify-between hover:bg-white/5 transition-all group col-span-${span} relative overflow-hidden`}>
       <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-10 transition-opacity">
          <Icon className="w-8 h-8" />
       </div>
       <div className="flex justify-between items-start mb-1 z-10">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
             {label}
          </div>
          <Icon className={`w-3.5 h-3.5 ${color} opacity-80`} />
       </div>
       <div className="z-10">
         <div className={`text-sm md:text-base font-mono font-bold text-white tracking-tight truncate`}>{value}</div>
         {subValue && <div className={`text-[9px] ${color} font-medium uppercase tracking-wide truncate mt-0.5`}>{subValue}</div>}
       </div>
    </div>
  );

  // Derive Trend Status text
  const trendStatus = indicators.trendScore > 0 ? 'Bullish' : indicators.trendScore < 0 ? 'Bearish' : 'Neutral';
  const trendColor = indicators.trendScore > 0 ? 'text-bullish' : indicators.trendScore < 0 ? 'text-bearish' : 'text-gray-400';

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-widest">
            <Activity className="w-3 h-3 text-primary" /> Core Indicators (7)
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-widest">
            <Globe className="w-3 h-3 text-secondary" /> Context (3)
          </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* --- 7 CORE INDICATORS --- */}
        
        {/* 1. EMA Trend */}
        <MetricItem 
          label="EMA Trend" 
          value={indicators.ema20 > indicators.ema50 ? 'UPTREND' : 'DOWNTREND'} 
          subValue={trendStatus}
          color={trendColor}
          icon={TrendingUp} 
        />
        
        {/* 2. RSI */}
        <MetricItem 
          label="RSI Divergence" 
          value={indicators.rsi.toFixed(1)} 
          subValue={indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
          color={indicators.rsi > 70 ? 'text-bearish' : indicators.rsi < 30 ? 'text-bullish' : 'text-gray-400'}
          icon={Activity} 
        />
        
        {/* 3. CVD (Smart Money) */}
        <MetricItem 
          label="CVD (Smart Money)" 
          value={formatCompact(metrics.cvd)} 
          subValue={metrics.cvd > 0 ? 'Accumulation' : 'Distribution'}
          color={metrics.cvd > 0 ? 'text-bullish' : 'text-bearish'}
          icon={MousePointerClick} 
        />

        {/* 4. FVG */}
        <MetricItem 
          label="FVG Zone" 
          value={indicators.fvgPrice ? indicators.fvgPrice.toFixed(2) : 'None'} 
          subValue={indicators.fvgPrice ? 'Magnet Level' : 'Balanced'}
          color="text-yellow-400"
          icon={Box} 
        />

        {/* 5. VPA */}
        <MetricItem 
          label="Vol. Spread" 
          value={indicators.vpaStatus} 
          subValue={indicators.vpaStatus === 'ANOMALY' ? 'Reversal Risk' : 'Confirmation'}
          color={indicators.vpaStatus === 'STRONG' ? 'text-bullish' : indicators.vpaStatus === 'ANOMALY' ? 'text-purple-400' : 'text-gray-400'}
          icon={BarChart2} 
        />

        {/* 6. Funding Rate */}
        <MetricItem 
          label="Funding Rate" 
          value={`${(metrics.fundingRate * 100).toFixed(4)}%`} 
          subValue={metrics.fundingRate < 0 ? 'Short Squeeze' : 'Long Heavy'}
          color={metrics.fundingRate < 0 ? 'text-bullish' : 'text-bearish'}
          icon={DollarSign} 
        />

        {/* 7. Open Interest */}
        <MetricItem 
          label="Open Interest" 
          value={formatCompact(metrics.openInterest)} 
          subValue={indicators.oiScore > 0 ? 'Trend Strong' : 'Trend Weak'}
          color={indicators.oiScore > 0 ? 'text-primary' : 'text-gray-500'}
          icon={Layers} 
        />

        {/* --- 3 CONTEXT METRICS --- */}

        {/* 8. Liq Heat */}
        <MetricItem 
          label="Liq. Heatmap" 
          value={metrics.liquidationHeat.toFixed(2)} 
          subValue={metrics.liquidationHeat > 0.5 ? 'Shorts Rekt' : metrics.liquidationHeat < -0.5 ? 'Longs Rekt' : 'Safe'}
          color={Math.abs(metrics.liquidationHeat) > 0.5 ? 'text-orange-500' : 'text-gray-400'}
          icon={Flame} 
        />

        {/* 9. Market Structure */}
        <MetricItem 
          label="Mkt Structure" 
          value={indicators.marketStructure} 
          subValue={indicators.marketStructure === 'BULLISH' ? 'HH + HL' : indicators.marketStructure === 'BEARISH' ? 'LH + LL' : 'Consolidation'}
          color={indicators.marketStructure === 'BULLISH' ? 'text-bullish' : indicators.marketStructure === 'BEARISH' ? 'text-bearish' : 'text-gray-400'}
          icon={Zap} 
        />

        {/* 10. BTC Dominance */}
        <MetricItem 
          label="BTC Dom" 
          value={`${metrics.btcDominance.toFixed(1)}%`} 
          subValue="Macro Context"
          color="text-orange-300"
          icon={Globe} 
        />
      </div>
    </div>
  );
};

export default IndicatorMetrics;