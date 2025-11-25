
import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceDot,
  Label
} from 'recharts';
import { Candle, IndicatorValues, AISignal } from '../types';
import { calculateRSISeries, detectSniperSignals } from '../services/indicators';
import TokenIcon from './TokenIcon';
import { CandlestickChart, LineChart as LineChartIcon, Activity, Bot, Zap, TrendingUp, TrendingDown, Clock, Eye, EyeOff, Target } from 'lucide-react';

interface ChartProps {
  data: Candle[];
  indicators: IndicatorValues;
  pair: string;
  aiSignal?: AISignal | null;
  isAIActive?: boolean;
}

// Define the extended data point type
interface ChartDataPoint extends Candle {
  rsi: number;
  divergence?: 'BULLISH' | 'BEARISH';
  sniperSignal?: 'BUY' | 'SELL';
  signalReason?: string;
  buyDotY?: number | null;
  sellDotY?: number | null;
  dateStr: string;
  candleBody: number[];
  candleWick: number[];
  isBullish: boolean;
  color: string;
  // AI Properties (Optional)
  aiActive?: boolean;
  aiAction?: string;
  aiConfidence?: number;
  aiReasoning?: string;
  aiTimestamp?: number;
}

// Custom SVG Markers for better UI/UX - NEON STYLE
const BuyMarker = ({ cx, cy }: any) => {
  if (!cx || !cy) return null;
  return (
    <svg x={cx - 14} y={cy - 14} width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ overflow: 'visible', zIndex: 50 }}>
      {/* Outer Glow */}
      <circle cx="12" cy="12" r="10" fill="#10B981" fillOpacity="0.2" className="animate-pulse" />
      {/* Inner Dot */}
      <circle cx="12" cy="12" r="4" fill="#059669" stroke="#34D399" strokeWidth="2" />
      {/* Up Arrow */}
      <path d="M12 18V22M8 20L12 16L16 20" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const SellMarker = ({ cx, cy }: any) => {
  if (!cx || !cy) return null;
  return (
    <svg x={cx - 14} y={cy - 14} width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ overflow: 'visible', zIndex: 50 }}>
      {/* Outer Glow */}
      <circle cx="12" cy="12" r="10" fill="#EF4444" fillOpacity="0.2" className="animate-pulse" />
      {/* Inner Dot */}
      <circle cx="12" cy="12" r="4" fill="#B91C1C" stroke="#F87171" strokeWidth="2" />
      {/* Down Arrow */}
      <path d="M12 6V2M16 4L12 8L8 4" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// AI Live Marker (Pulsing Arrow)
const AISignalMarker = ({ cx, cy, type }: { cx?: number, cy?: number, type: 'LONG' | 'SHORT' }) => {
    if (!cx || !cy) return null;
    const color = type === 'LONG' ? '#10B981' : '#EF4444';
    return (
        <svg x={cx - 24} y={cy - 24} width="48" height="48" viewBox="0 0 48 48" style={{ overflow: 'visible', zIndex: 100 }}>
             {/* Large Pulsing Aura */}
             <circle cx="24" cy="24" r="20" fill={color} fillOpacity="0.2">
                 <animate attributeName="r" from="20" to="32" dur="1.5s" repeatCount="indefinite" />
                 <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
             </circle>
             {/* Solid Core */}
             <circle cx="24" cy="24" r="12" fill={color} stroke="white" strokeWidth="3" className="drop-shadow-lg" />
             {/* Directional Arrow */}
             {type === 'LONG' ? (
                 <path d="M24 16L17 25H31L24 16Z" fill="white" transform="translate(0, 2)" />
             ) : (
                 <path d="M24 32L17 23H31L24 32Z" fill="white" transform="translate(0, -2)" />
             )}
        </svg>
    );
};

const CustomTooltip = ({ active, payload, label, chartType, showRSI }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const rsiVal = data.rsi ? data.rsi.toFixed(1) : 'N/A';
    
    return (
      <div className="bg-[#0a0a0a]/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md min-w-[220px]">
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">{label}</p>
            {showRSI && data.divergence && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${data.divergence === 'BULLISH' ? 'bg-bullish/20 border-bullish/50 text-bullish' : 'bg-bearish/20 border-bearish/50 text-bearish'}`}>
                    {data.divergence} DIV
                </span>
            )}
        </div>
        
        {/* HISTORICAL ALGO SIGNAL */}
        {data.sniperSignal && (
            <div className={`mb-3 text-xs font-bold px-3 py-2 rounded flex flex-col gap-1 border shadow-lg ${data.sniperSignal === 'BUY' ? 'bg-green-900/40 border-green-500/30 shadow-green-900/20' : 'bg-red-900/40 border-red-500/30 shadow-red-900/20'}`}>
                <div className="flex items-center gap-2 border-b border-white/5 pb-1 mb-1">
                  <Target className={`w-3.5 h-3.5 ${data.sniperSignal === 'BUY' ? 'text-green-400' : 'text-red-400'}`} />
                  <span className={data.sniperSignal === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                    {data.sniperSignal === 'BUY' ? 'ALGO BUY' : 'ALGO SELL'}
                  </span>
                </div>
                <div className="text-[10px] text-gray-300 font-mono opacity-80">
                  Trigger: {data.signalReason}
                </div>
            </div>
        )}

        {/* AI LIVE SIGNAL */}
        {data.aiActive && (
             <div className="mb-3 p-3 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-lg shadow-lg backdrop-blur-md animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">AI Live Signal</span>
                    </div>
                    <span className="text-[9px] text-gray-400 font-mono">
                        {new Date(data.aiTimestamp).toLocaleTimeString([], {minute:'2-digit', second:'2-digit'})}
                    </span>
                </div>
                
                <div className="flex items-center gap-3 mb-2">
                    <div className={`text-lg font-black tracking-tighter ${data.aiAction.includes('LONG') ? 'text-bullish drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-bearish drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}>
                        {data.aiAction}
                    </div>
                    <div className="flex flex-col flex-1">
                        <div className="flex justify-between text-[9px] text-gray-400 uppercase font-bold mb-1">
                            <span>Confidence</span>
                            <span className="text-white">{data.aiConfidence}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full ${data.aiAction.includes('LONG') ? 'bg-bullish' : 'bg-bearish'}`} style={{width: `${data.aiConfidence}%`}}></div>
                        </div>
                    </div>
                </div>
                
                <div className="relative pl-3 border-l-2 border-white/20 mt-2">
                    <p className="text-[10px] text-gray-300 leading-relaxed italic">
                        "{data.aiReasoning}"
                    </p>
                </div>
             </div>
        )}

        {/* CHART DATA */}
        {chartType === 'AREA' ? (
           <>
             <div className="flex justify-between gap-4 text-xs font-mono mb-1 items-center">
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00f3ff]"></div>
                  <span className="text-gray-400">Price</span>
               </div>
               <span className="text-white font-bold">${data.close.toFixed(2)}</span>
             </div>
             {showRSI && (
               <div className="flex justify-between gap-4 text-xs font-mono mb-1 items-center">
                 <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                    <span className="text-gray-400">RSI</span>
                 </div>
                 <span className={`font-bold ${data.rsi > 70 ? 'text-bearish' : data.rsi < 30 ? 'text-bullish' : 'text-gray-300'}`}>{rsiVal}</span>
               </div>
             )}
           </>
        ) : (
           <div className="space-y-1.5">
             <div className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded w-fit ${data.isBullish ? 'bg-bullish/20 text-bullish' : 'bg-bearish/20 text-bearish'}`}>
                {data.isBullish ? 'BULLISH' : 'BEARISH'}
             </div>
             <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono text-gray-400">
               <span className="flex justify-between">O: <span className="text-white ml-2">{data.open.toFixed(2)}</span></span>
               <span className="flex justify-between">H: <span className="text-white ml-2">{data.high.toFixed(2)}</span></span>
               <span className="flex justify-between">L: <span className="text-white ml-2">{data.low.toFixed(2)}</span></span>
               <span className="flex justify-between">C: <span className="text-white ml-2">{data.close.toFixed(2)}</span></span>
             </div>
           </div>
        )}
      </div>
    );
  }
  return null;
};

const Chart: React.FC<ChartProps> = ({ data, pair, aiSignal, isAIActive }) => {
  const [chartType, setChartType] = useState<'AREA' | 'CANDLE'>('AREA');
  const [showRSI, setShowRSI] = useState(true);

  // --- DATA PROCESSING & INDICATOR LOGIC ---
  const processedData = useMemo(() => {
     // 1. Calculate RSI Series for entire dataset
     const closes = data.map(c => c.close);
     const rsiSeries = calculateRSISeries(closes, 14);
     
     // 2. DETECT SNIPER SIGNALS (THE GREEN/RED DOTS - Historical/Algo)
     const signals = detectSniperSignals(data, rsiSeries);
     const signalMap: Record<number, { type: 'BUY' | 'SELL', reason: string }> = {};
     signals.forEach(s => {
         // Find index from time
         const idx = data.findIndex(d => d.time === s.time);
         if (idx !== -1) signalMap[idx] = { type: s.type, reason: s.reason };
     });

     // 3. Identify Divergences
     const pivots: { index: number, type: 'HIGH' | 'LOW', val: number, rsi: number }[] = [];
     for (let i = 2; i < data.length - 2; i++) {
        const c = data[i];
        const l = data[i-1]; const ll = data[i-2];
        const r = data[i+1]; const rr = data[i+2];
        if (c.low < l.low && c.low < ll.low && c.low < r.low && c.low < rr.low) pivots.push({ index: i, type: 'LOW', val: c.low, rsi: rsiSeries[i] });
        if (c.high > l.high && c.high > ll.high && c.high > r.high && c.high > rr.high) pivots.push({ index: i, type: 'HIGH', val: c.high, rsi: rsiSeries[i] });
     }
     const divergences: Record<number, 'BULLISH' | 'BEARISH'> = {};
     for (let i = pivots.length - 1; i > 0; i--) {
        const curr = pivots[i]; const prev = pivots[i-1];
        if (curr.type === prev.type && (curr.index - prev.index) < 20) {
            if (curr.type === 'LOW' && curr.val < prev.val && curr.rsi > prev.rsi) divergences[curr.index] = 'BULLISH';
            else if (curr.type === 'HIGH' && curr.val > prev.val && curr.rsi < prev.rsi) divergences[curr.index] = 'BEARISH';
        }
     }

     // 4. Map to Display Data (Last 60 candles)
     const mappedData: ChartDataPoint[] = data.slice(-60).map((c, i) => {
        const originalIndex = data.length - 60 + i;
        const isBullish = c.close >= c.open;
        
        const bodyLow = Math.min(c.open, c.close);
        const bodyHigh = Math.max(c.open, c.close);
        const minHeight = c.close * 0.0001; 
        
        const range = c.high - c.low;
        const padding = range * 0.6; 
        
        const buyDotY = c.low - padding; 
        const sellDotY = c.high + padding;

        const signalInfo = signalMap[originalIndex];

        return {
          ...c,
          rsi: rsiSeries[originalIndex],
          divergence: divergences[originalIndex],
          sniperSignal: signalInfo?.type,
          signalReason: signalInfo?.reason,
          buyDotY: signalInfo?.type === 'BUY' ? buyDotY : null,
          sellDotY: signalInfo?.type === 'SELL' ? sellDotY : null,
          dateStr: new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          candleBody: Math.abs(c.open - c.close) < minHeight 
              ? [bodyLow - minHeight, bodyHigh + minHeight] 
              : [bodyLow, bodyHigh],
          candleWick: [c.low, c.high],
          isBullish,
          color: isBullish ? '#10B981' : '#EF4444'
        };
     });

     // 5. INJECT AI SIGNAL (Live) into the last candle data
     if (aiSignal && mappedData.length > 0) {
        const lastIdx = mappedData.length - 1;
        // Only attach if fresh (< 5 mins) to keep it "Real-time"
        const isFresh = (Date.now() - aiSignal.timestamp) < 5 * 60 * 1000;
        
        if (isFresh) {
            mappedData[lastIdx] = {
                ...mappedData[lastIdx],
                aiActive: true,
                aiAction: aiSignal.action,
                aiConfidence: aiSignal.confidence,
                aiReasoning: aiSignal.reasoning,
                aiTimestamp: aiSignal.timestamp
            };
        }
     }

     return mappedData;
  }, [data, aiSignal]);

  const lastPrice = processedData.length > 0 ? processedData[processedData.length - 1].close : 0;
  const firstPrice = processedData.length > 0 ? processedData[0].close : 0;
  const isPositive = lastPrice >= firstPrice;

  // Determine Live Marker Position (Standard Trading Convention: Buy Below, Sell Above)
  const lastCandle = processedData[processedData.length - 1];
  let aiMarkerY = 0;
  if (aiSignal && lastCandle) {
      const offset = lastPrice * 0.002; // 0.2% Price Offset
      aiMarkerY = aiSignal.action === 'GO LONG' ? lastCandle.low - offset : lastCandle.high + offset;
  }

  return (
    <div className="h-[350px] md:h-[450px] w-full glass-panel rounded-xl p-4 relative overflow-hidden group">
      
      {/* AI AGENT STATUS OVERLAY (Corner) */}
      {isAIActive && (
          <div className="absolute top-16 md:top-20 right-5 z-30 pointer-events-none">
             <div className="bg-black/60 backdrop-blur-md border border-primary/20 rounded-lg p-2 flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                <div className={`w-2 h-2 rounded-full ${aiSignal ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`}></div>
                <span className="text-[10px] font-mono text-primary font-bold">
                    {aiSignal ? 'SIGNAL LOCKED' : 'AI SCANNING...'}
                </span>
             </div>
          </div>
      )}

      {/* Chart Header Info */}
      <div className="absolute top-5 left-5 z-10 flex items-center gap-3 pointer-events-none">
        <TokenIcon pair={pair} size="lg" className="shadow-lg shadow-black/40" />
        <div>
           <h2 className="text-xl md:text-2xl font-bold text-white leading-none">
             {pair.split('/')[0]} <span className="text-sm md:text-lg text-gray-500 font-normal">/USDT</span>
           </h2>
           <div className="flex items-center gap-2 mt-1">
             <span className={`text-[10px] md:text-xs font-bold flex items-center gap-1 ${isPositive ? 'text-bullish' : 'text-bearish'}`}>
                {chartType === 'AREA' && <Activity className="w-3 h-3" />}
                Live
             </span>
             {showRSI && (
               <span className="text-[10px] md:text-xs font-bold text-secondary flex items-center gap-1 ml-2">
                   RSI Active
               </span>
             )}
           </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-5 right-5 z-20 flex bg-black/40 backdrop-blur-sm rounded-lg p-1 border border-white/10 gap-1">
         <button 
           onClick={() => setShowRSI(!showRSI)}
           className={`p-2 rounded-md transition-all ${showRSI ? 'bg-secondary/20 text-secondary shadow-sm border border-secondary/30' : 'text-gray-500 hover:text-white'}`}
           title={showRSI ? "Hide RSI" : "Show RSI"}
         >
           {showRSI ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
         </button>
         
         <div className="w-px bg-white/10 mx-0.5"></div>

         <button 
           onClick={() => setChartType('AREA')}
           className={`p-2 rounded-md transition-all ${chartType === 'AREA' ? 'bg-white/10 text-neonBlue shadow-sm border border-white/5' : 'text-gray-500 hover:text-white'}`}
           title="Line Chart"
         >
           <LineChartIcon className="w-4 h-4" />
         </button>
         <button 
           onClick={() => setChartType('CANDLE')}
           className={`p-2 rounded-md transition-all ${chartType === 'CANDLE' ? 'bg-white/10 text-bullish shadow-sm border border-white/5' : 'text-gray-500 hover:text-white'}`}
           title="Candle Chart"
         >
           <CandlestickChart className="w-4 h-4" />
         </button>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={processedData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
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
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
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
            width={50}
            padding={{ top: 40, bottom: 40 }} // Increased padding for markers
          />
          
          <YAxis 
            yAxisId="volume"
            orientation="left"
            tick={false}
            axisLine={false}
            domain={[0, 'dataMax * 5']} 
          />

          <YAxis 
            yAxisId="rsi"
            orientation="left"
            domain={[0, 100]}
            hide={true} 
          />
          
          <Tooltip content={<CustomTooltip chartType={chartType} showRSI={showRSI} />} cursor={{ stroke: '#ffffff20', strokeWidth: 1, strokeDasharray: "4 4" }} />
          
          <Bar yAxisId="volume" dataKey="volume" fill="url(#colorVolume)" barSize={4} radius={[2, 2, 0, 0]} />
          
          {showRSI && (
            <Line 
               yAxisId="rsi"
               type="monotone"
               dataKey="rsi"
               stroke="#8B5CF6" 
               strokeWidth={1.5}
               dot={false}
               strokeOpacity={0.6}
            />
          )}

          {/* DIVERGENCE MARKERS */}
          {showRSI && processedData.map((entry, index) => {
             if (!entry.divergence) return null;
             return (
                 <ReferenceDot 
                    key={`div-${index}`}
                    yAxisId="price"
                    x={entry.dateStr}
                    y={entry.divergence === 'BULLISH' ? entry.low : entry.high}
                    r={3}
                    fill="transparent"
                    stroke={entry.divergence === 'BULLISH' ? '#10B981' : '#EF4444'}
                    strokeWidth={1}
                 >
                     <Label 
                        value={entry.divergence === 'BULLISH' ? '▲' : '▼'} 
                        position="center" 
                        fill={entry.divergence === 'BULLISH' ? '#10B981' : '#EF4444'} 
                        fontSize={8} 
                        fontWeight="bold"
                     />
                 </ReferenceDot>
             );
          })}
          
          {/* HISTORICAL ALGO DOTS */}
          {processedData.map((entry, index) => {
             if (entry.sniperSignal === 'BUY') {
                 return (
                     <ReferenceDot
                        key={`buy-${index}`}
                        yAxisId="price"
                        x={entry.dateStr}
                        y={entry.buyDotY}
                        shape={<BuyMarker />}
                        ifOverflow="extendDomain"
                        style={{ zIndex: 50 }}
                     />
                 );
             }
             if (entry.sniperSignal === 'SELL') {
                 return (
                    <ReferenceDot
                        key={`sell-${index}`}
                        yAxisId="price"
                        x={entry.dateStr}
                        y={entry.sellDotY}
                        shape={<SellMarker />}
                        ifOverflow="extendDomain"
                        style={{ zIndex: 50 }}
                    />
                 );
             }
             return null;
          })}

          {/* LIVE AI SIGNAL MARKER (PROMINENT ARROW) */}
          {aiSignal && lastCandle && (
             <ReferenceDot
                yAxisId="price"
                x={lastCandle.dateStr}
                y={aiMarkerY}
                shape={<AISignalMarker type={aiSignal.action === 'GO LONG' ? 'LONG' : 'SHORT'} />}
                ifOverflow="extendDomain"
             >
                <Label 
                    value={aiSignal.action} 
                    position={aiSignal.action === 'GO LONG' ? 'bottom' : 'top'} 
                    offset={30}
                    fill={aiSignal.action === 'GO LONG' ? '#10B981' : '#EF4444'} 
                    fontWeight="bold"
                    fontSize={11}
                    className="drop-shadow-md"
                />
             </ReferenceDot>
          )}

          {chartType === 'AREA' ? (
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
          ) : (
              <>
                <Bar yAxisId="price" dataKey="candleWick" barSize={1} isAnimationActive={false}>
                    {processedData.map((entry, index) => (
                        <Cell key={`wick-${index}`} fill={entry.color} />
                    ))}
                </Bar>
                <Bar yAxisId="price" dataKey="candleBody" barSize={8} isAnimationActive={false}>
                    {processedData.map((entry, index) => (
                        <Cell key={`body-${index}`} fill={entry.color} />
                    ))}
                </Bar>
              </>
          )}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
