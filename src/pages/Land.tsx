/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Layers, Map as MapIcon, BarChart3, Filter } from 'lucide-react';

export default function Land() {
  const [activeTab, setActiveTab] = useState('map');
  const [activeLayer, setActiveLayer] = useState('zongdi');

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="bg-emerald-900 text-white px-6 pt-12 pb-6 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold tracking-tight">土地资源</h1>
            <p className="text-xs text-emerald-300/80 mt-1 uppercase tracking-widest font-bold">土地资源分布情况</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-emerald-800/50 rounded-lg border border-emerald-700/50">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-100 flex-shrink-0">
        <button
          onClick={() => setActiveTab('map')}
          className={cn(
            "flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2",
            activeTab === 'map' ? "text-emerald-600 bg-emerald-50/30" : "text-slate-400"
          )}
        >
          <MapIcon size={14} /> 分布地图
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={cn(
            "flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2",
            activeTab === 'analysis' ? "text-emerald-600 bg-emerald-50/30" : "text-slate-400"
          )}
        >
          <BarChart3 size={14} /> 数据分析
        </button>
      </div>

      <div className="flex-1 relative bg-slate-200">
        {activeTab === 'map' ? (
          <div className="absolute inset-0">
            {/* Map Placeholder */}
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-emerald-900/10 mix-blend-multiply" />
            
            {/* Layer Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {[
                { id: 'zongdi', label: '宗地' },
                { id: 'gaobiao', label: '高标准' },
                { id: 'yanjian', label: '盐碱地' },
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg transition-all border",
                    activeLayer === layer.id 
                      ? "bg-emerald-900 text-white border-emerald-900" 
                      : "bg-white text-slate-600 border-slate-200"
                  )}
                >
                  {layer.label}
                </button>
              ))}
            </div>

            {/* Bottom Info Sheet Mockup */}
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="absolute bottom-6 left-6 right-6 bg-white rounded-2xl p-4 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-10 bg-emerald-900 rounded-full" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800">当前视角数据概览</h4>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono">所属区域: 长春市 · 管理站 04</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-600">452.8</span>
                  <span className="text-[10px] text-slate-400 ml-1 font-bold">亩</span>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="p-6 space-y-6 bg-slate-50 overflow-y-auto h-full pb-20">
             <div className="bg-white border-2 border-slate-100 p-4 rounded-2xl h-48 flex flex-col justify-between shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">全集团土地权属占比分析</span>
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-8 border-emerald-900 flex items-center justify-center">
                    <span className="text-xl font-bold text-emerald-900">72%</span>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-900 rounded-full" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">统种地</span>
                  </div>
                   <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-100 rounded-full" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">承租/个人</span>
                  </div>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                {[
                  { label: '高标准农田', value: '3.2万', unit: '亩' },
                  { label: '盐碱地治理', value: '8,500', unit: '亩' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white border-2 border-slate-100 p-4 rounded-2xl h-28 flex flex-col justify-between shadow-sm">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</span>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold leading-none text-emerald-900">{stat.value}</span>
                      <span className="text-[10px] text-slate-400 pb-0.5">{stat.unit}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
