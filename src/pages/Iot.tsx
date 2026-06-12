/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { mockDevices } from '../mockData';
import { ArrowLeft, Cpu, Power, Activity, History, AlertTriangle, ChevronRight } from 'lucide-react';

export default function Iot() {
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const currentDevice = mockDevices.find(d => d.id === selectedDevice);

  return (
    <div className="flex flex-col min-h-screen pb-12">
      <header className="bg-emerald-900 text-white px-6 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 mb-2 hover:bg-white/10 rounded-lg">
          <ArrowLeft size={20} className="text-white/80" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">物联网设备</h1>
        <p className="text-xs text-emerald-300/80 mt-1 uppercase tracking-widest font-bold">智能化感知与控制中心</p>
      </header>

      {selectedDevice && currentDevice ? (
        <div className="p-4 space-y-6">
          <button
            onClick={() => setSelectedDevice(null)}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft size={14} /> 返回列表
          </button>
          
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={cn(
                  "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                  currentDevice.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-600' : 
                  currentDevice.status === 'FAULT' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
                )}>
                  {currentDevice.status === 'ONLINE' ? '在线' : currentDevice.status === 'FAULT' ? '故障' : '离线'}
                </span>
                <h2 className="text-lg font-bold text-slate-800 mt-2">{currentDevice.name}</h2>
                <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-tighter">序列号: {currentDevice.id.toUpperCase()}-X01</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-slate-100">
                <Cpu size={24} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
              {Object.entries(currentDevice.lastData).map(([key, value]) => (
                <div key={key} className="text-center group">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-tighter">{key === 'humidity' ? '湿度' : key === 'temp' ? '温度' : key === 'ph' ? 'PH值' : key}</p>
                  <p className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button className="bg-emerald-900 text-white p-6 rounded-3xl flex flex-col items-center gap-3 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all">
                <Power size={24} />
                <span className="text-xs font-bold uppercase tracking-widest">远程控制</span>
             </button>
             <button className="bg-white border-2 border-slate-100 p-6 rounded-3xl flex flex-col items-center gap-3 shadow-sm active:bg-slate-50 transition-all font-bold text-slate-400">
                <History size={24} />
                <span className="text-xs uppercase tracking-widest">历史曲线</span>
             </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-red-400 rounded-full" />
                 <div>
                    <h4 className="text-xs font-bold text-slate-800">最新告警信息</h4>
                    <p className="text-[10px] text-slate-400">检测到电压不稳定 (2小时前)</p>
                 </div>
             </div>
             <AlertTriangle size={16} className="text-red-400" />
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4 pt-6">
           <div className="flex justify-between items-baseline mb-2">
             <h3 className="text-sm font-bold text-slate-800 tracking-tight">设备列表 ({mockDevices.length})</h3>
             <span className="text-[10px] font-bold text-emerald-600 uppercase">实时更新中</span>
           </div>
           {mockDevices.map((device) => (
             <div 
                key={device.id} 
                onClick={() => setSelectedDevice(device.id)}
                className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm active:border-emerald-200 transition-all cursor-pointer group"
             >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  device.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                )}>
                  <Cpu size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{device.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">位置: 第一农场 · 管理站 02</p>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
