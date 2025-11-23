import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Candle, IndicatorValues } from '../types';
import TokenIcon from './TokenIcon';

interface ChartProps {
  data: Candle[];
  indicators: IndicatorValues;
  pair: string;
}

const Chart: React.FC<ChartProps> = ({ data, pair }) => {
  // Format data for Recharts
  // We only show last 50 candles for performance in this demo
  const displayData = data.slice(-60).map(c => ({
    ...c,
    dateStr: new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  const lastPrice = displayData.length > 0 ? displayData[displayData.length - 1].close : 0;
  const firstPrice = displayData.length > 0 ? displayData[0].close : 0;
  const isPositive = lastPrice >= firstPrice;

  return (
    <div className="h-[450px] w-full glass-panel rounded-xl p-4 relative overflow-hidden group">
      {/* Chart Header */}
      <div className="absolute top-5 left-5 z-10 flex items-center gap-3">
        <TokenIcon pair={pair} size="lg" className="shadow-lg shadow-black/40" />
        <div>
           <h2 className="text-2xl font-bold text-white leading-none">
             {pair.split('/')[0]} <span className="text-lg text-gray-500 font-normal">/USDT</span>
           </h2>
           <div className="flex items-center gap-2 mt-1">
             <span className="text-xs font-mono bg-white/10 px-1.5 py-0.5 rounded text-gray-300">1m Timeframe</span>
             <span className={`text-xs font-bold ${isPositive ? 'text-bullish' : 'text-bearish'}`}>
                Live
             </span>
           </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={displayData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <defs>
             <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0}/>
             </linearGradient>
             <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
             </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis 
            dataKey="dateStr" 
            stroke="#444" 
            tick={{ fontSize: 10, fill: '#666' }} 
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            yAxisId="price"
            domain={['auto', 'auto']} 
            orientation="right" 
            stroke="#444" 
            tick={{ fontSize: 11, fill: '#666' }} 
            tickFormatter={(val) => val.toFixed(2)}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <YAxis 
            yAxisId="volume"
            orientation="left"
            tick={false}
            axisLine={false}
            domain={[0, 'dataMax * 4']} // Push volume down
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(5, 5, 5, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
            itemStyle={{ color: '#ccc', fontSize: '12px', fontFamily: 'monospace' }}
            labelStyle={{ color: '#666', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
            cursor={{ stroke: '#ffffff20', strokeWidth: 1 }}
            formatter={(value: number, name: string) => [value.toFixed(2), name === 'close' ? 'Price' : name.charAt(0).toUpperCase() + name.slice(1)]}
          />
          
          <Bar yAxisId="volume" dataKey="volume" fill="url(#colorVolume)" barSize={4} radius={[2, 2, 0, 0]} />
          
          <Line 
            yAxisId="price" 
            type="monotone" 
            dataKey="close" 
            stroke="#00f3ff" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 6, fill: '#fff', stroke: '#00f3ff', strokeWidth: 2 }}
            animationDuration={300}
          />
          
          {/* Simulated EMA Lines */}
           <Line 
            yAxisId="price" 
            type="monotone" 
            dataKey="close" 
            stroke="#10B981" 
            strokeWidth={1} 
            strokeOpacity={0.5}
            strokeDasharray="5 5"
            dot={false} 
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;