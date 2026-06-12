import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Calendar, HardDrive, ShieldCheck, AlertTriangle, LineChart as ChartIcon, FileText, Activity } from 'lucide-react';
import { Device } from '../types';
import { cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DeviceDetailDrawerProps {
  device: Device | null;
  onClose: () => void;
}

type TabType = 'OVERVIEW' | 'ALARM' | 'HISTORY' | 'LOG';

export const DeviceDetailDrawer: React.FC<DeviceDetailDrawerProps> = ({ device, onClose }) => {
  if (!device) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'bg-emerald-500';
      case 'OFFLINE': return 'bg-slate-400';
      case 'FAULT': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ONLINE': return '在线';
      case 'OFFLINE': return '离线';
      case 'FAULT': return '故障';
      default: return '未知';
    }
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col md:inset-y-0 md:left-auto md:right-0 md:w-[480px] md:h-screen"
    >
      {/* Top Banner / Satellite Image */}
      <div className="h-64 relative shrink-0">
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800"
          className="w-full h-full object-cover"
          alt="Satellite view"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        <div className="absolute top-4 left-0 right-0 flex justify-center">
          <div className="w-12 h-1.5 bg-white/40 rounded-full" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 -mt-10 relative z-10 space-y-8 pb-32">
        {/* Device Header */}
        <div className="bg-white rounded-t-[32px] pt-6 flex flex-col items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-[20px] font-black text-slate-900 tracking-tight">设备名称 {device.name}</h2>
            <div className="px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-[10px] font-bold text-blue-500">
              {getStatusText(device.status)}
            </div>
          </div>
        </div>

        {/* Real-time Monitoring Data */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <h3 className="text-[15px] font-black text-slate-800">实时监测数据</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 grid grid-cols-2 gap-y-4 gap-x-8 shadow-sm">
            {[
              { label: '温度', value: device.lastData.temp, unit: '℃', color: 'text-blue-600' },
              { label: '温度', value: device.lastData.temp, unit: '℃', color: 'text-blue-600' }, // Doubled in UI for some reason?
              { label: '风速', value: device.lastData.wind, color: 'text-blue-600' },
              { label: '湿度', value: device.lastData.humidity, color: 'text-blue-600' },
              { label: '降水量', value: device.lastData.rain || '0 mm', color: 'text-blue-600' },
              { label: 'AQI', value: device.lastData.aqi || '--', color: 'text-blue-600' },
            ].map((stat, i) => (
              <div key={i} className="flex items-baseline justify-between">
                <span className="text-[13px] font-bold text-slate-800">{stat.label}</span>
                <span className={cn("text-[15px] font-black ml-2", stat.color)}>
                  {stat.value} {stat.unit && stat.unit}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Alarm Info */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <h3 className="text-[15px] font-black text-slate-800">告警信息</h3>
          </div>
          <div className="space-y-4">
            {device.alarms && device.alarms.length > 0 ? (
              device.alarms.map(alarm => (
                <div key={alarm.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-slate-700">{alarm.content}</span>
                  </div>
                  <span className="text-[12px] font-medium text-slate-400">{alarm.time}</span>
                </div>
              ))
            ) : (
              <div className="text-[12px] text-slate-400 py-4 text-center">暂无告警信息</div>
            )}
          </div>
        </section>

        {/* Basic Info */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <h3 className="text-[15px] font-black text-slate-800">基本信息</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: '设备类型', value: device.deviceInfo?.type },
              { label: '设备名称', value: device.deviceInfo?.name },
              { label: '所属农场', value: device.deviceInfo?.farm },
              { label: '所属行政区划', value: device.deviceInfo?.adminRegion },
              { label: '生产厂家', value: device.deviceInfo?.manufacturer },
              { label: '设备型号', value: device.deviceInfo?.model },
              { label: '是否支持远程操控', value: device.deviceInfo?.remoteControlSupported ? '支持' : '不支持' },
            ].map((info, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-[13px] font-medium text-slate-500 min-w-[100px]">{info.label}:</span>
                <span className="text-[13px] font-bold text-slate-800 flex-1">{info.value || '--'}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Remote Debugging Section (Conditional) */}
        {device.deviceInfo?.remoteControlSupported && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-emerald-500 rounded-full" />
              <h3 className="text-[15px] font-black text-slate-800">远程控制中心</h3>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Activity size={20} />
                     </div>
                     <div>
                        <div className="text-[13px] font-bold text-slate-800">系统在线配置</div>
                        <div className="text-[11px] text-slate-400">已加密连接 (SSL 256-bit)</div>
                     </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">重启</button>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm">开启</button>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 mb-1">采样频率</div>
                    <div className="text-[14px] font-black text-slate-800">15min/次</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 mb-1">上报频率</div>
                    <div className="text-[14px] font-black text-slate-800">30min/次</div>
                  </div>
               </div>
            </div>
          </section>
        )}
      </div>

      {/* Return Button */}
      <div className="absolute bottom-10 left-6 right-6 z-20">
        <button 
          onClick={onClose}
          className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all uppercase tracking-widest text-[14px]"
        >
          返回
        </button>
      </div>
    </motion.div>
  );
};
