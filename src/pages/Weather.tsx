/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { ArrowLeft, Cloud, Sun, Wind, Droplets, Thermometer, Map as MapIcon, Layers, Maximize2, Share2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const WEATHER_STATIONS = [
  { id: 'S1', name: '前郭站-01', temp: '26℃', humidity: '38%', wind: '南风 2级' },
  { id: 'S2', name: '管理局中心站', temp: '25℃', humidity: '42%', wind: '南风 3级' },
  { id: 'S3', name: '农场东侧基站', temp: '27℃', humidity: '35%', wind: '西南风 2级' },
];

const HISTORICAL_TEMP = [
  { time: '00:00', val: 18 },
  { time: '04:00', val: 16 },
  { time: '08:00', val: 22 },
  { time: '12:00', val: 26 },
  { time: '16:00', val: 25 },
  { time: '20:00', val: 21 },
];

export default function Weather() {
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState<'HEAT' | 'RAIN' | 'WIND'>('HEAT');

  return (
    <div className="flex flex-col min-h-screen pb-12 bg-slate-50">
      <header className="bg-emerald-900 text-white px-5 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft size={18} className="text-white/80" />
          </button>
          <h1 className="text-[17px] font-bold tracking-tight">气象监测</h1>
          <button className="ml-auto w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform">
            <Share2 size={15} />
          </button>
        </div>
      </header>

      {/* Heatmap Area */}
      <div className="p-4 space-y-4">
        <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm relative">
          <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-slate-800">气象热力图分布</span>
            </div>
            <div className="flex gap-2">
              {[
                { id: 'HEAT', label: '温度' },
                { id: 'RAIN', label: '降水' },
              ].map(layer => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id as any)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[11px] font-bold transition-all border",
                    activeLayer === layer.id ? "bg-emerald-900 text-white border-emerald-900" : "bg-slate-50 text-slate-400 border-slate-100"
                  )}
                >
                  {layer.label}
                </button>
              ))}
            </div>
          </div>

          {/* Map Simulation */}
          <div className="h-64 bg-slate-200 relative">
            <img 
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200" 
              alt="Terrain" 
              className="w-full h-full object-cover grayscale opacity-50"
            />
            {/* Heatmap Overlays */}
            <div className="absolute inset-0">
               {/* Simulated Heatmap Blobs */}
               <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-orange-500/40 rounded-full blur-3xl animate-pulse" />
               <div className="absolute top-1/2 left-2/3 w-40 h-40 bg-red-500/30 rounded-full blur-3xl" />
               <div className="absolute bottom-1/4 ledt-1/3 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl" />
            </div>
            {/* Map Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <button className="p-2 bg-white rounded-lg shadow-lg text-slate-600"><Layers size={16} /></button>
              <button className="p-2 bg-white rounded-lg shadow-lg text-slate-600"><Maximize2 size={16} /></button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-28">
              <div className="flex items-center gap-2 text-slate-400">
                <Thermometer size={14} />
                <span className="text-[10px] font-bold">区域均温</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-slate-800">26.4</span>
                <span className="text-[10px] text-emerald-600 font-bold mb-1">℃</span>
              </div>
              <div className="h-1 bg-slate-50 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-orange-400 w-3/4" />
              </div>
           </div>
           <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-28">
              <div className="flex items-center gap-2 text-slate-400">
                <Droplets size={14} />
                <span className="text-[10px] font-bold">平均湿度</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-slate-800">42</span>
                <span className="text-[10px] text-emerald-600 font-bold mb-1">%</span>
              </div>
              <div className="h-1 bg-slate-50 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-blue-400 w-1/2" />
              </div>
           </div>
        </div>

        {/* Real-time Stations */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
             <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
             站点实时监测数据
          </h3>
          {WEATHER_STATIONS.map(station => (
            <div key={station.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm active:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <MapIcon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{station.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{station.wind} · {station.humidity}</p>
                </div>
              </div>
              <span className="text-lg font-bold text-emerald-600">{station.temp}</span>
            </div>
          ))}
        </div>

        {/* Prediction Chart */}
        <div className="bg-emerald-900 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/20">
           <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-sm font-bold">气温变化趋势分析</h4>
                <p className="text-[10px] text-emerald-100/60 mt-1 font-mono">24小时气温走势</p>
              </div>
              <div className="bg-emerald-800 p-2 rounded-xl">
                 <Wind size={18} />
              </div>
           </div>
           <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={HISTORICAL_TEMP}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FB923C" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FB923C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)' }} />
                    <YAxis hide />
                    <Area type="monotone" dataKey="val" stroke="#FB923C" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
