import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart as LucideBarChart, 
  PieChart as LucidePieChart, 
  TrendingUp, 
  ChevronUp, 
  ChevronDown,
  Info
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from 'recharts';
import { cn } from '../lib/utils';

export type MapViewType = 'land' | 'crops' | 'iot';

interface DataInsightPanelProps {
  activeTab: MapViewType;
}

export const DataInsightPanel: React.FC<DataInsightPanelProps> = ({ activeTab }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock Data for Charts
  const landData = [
    { name: '宗地', value: 45, color: '#3b82f6' },
    { name: '高标准', value: 30, color: '#10b981' },
    { name: '盐碱地', value: 15, color: '#f59e0b' },
    { name: '租赁', value: 10, color: '#8b5cf6' },
  ];

  const cropData = [
    { name: '玉米', area: 12.5, color: '#fbbf24' },
    { name: '小麦', area: 8.2, color: '#34d399' },
    { name: '大豆', area: 5.5, color: '#60a5fa' },
    { name: '闲置', area: 2.1, color: '#94a3b8' },
  ];

  const iotStatusData = [
    { status: '在线', count: 148, color: '#10b981' },
    { status: '故障', count: 2, color: '#ef4444' },
    { status: '离线', count: 15, color: '#94a3b8' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'land':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-white/30 uppercase mb-1 flex items-center gap-1.5">
                  <div className="w-1 h-2 bg-blue-500 rounded-full" />
                  管理规模
                </div>
                <div className="text-[18px] font-black text-white">30.8万亩</div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-white/30 uppercase mb-1 flex items-center gap-1.5">
                  <div className="w-1 h-2 bg-emerald-500 rounded-full" />
                  数字化覆盖
                </div>
                <div className="text-[18px] font-black text-emerald-400">100%</div>
              </div>
            </div>
            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={landData}
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {landData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontSize: '10px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center" 
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-[10px] font-bold text-white/40">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'crops':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-white/30 uppercase mb-1">2026年种植任务</div>
                <div className="text-[18px] font-black text-white">25.5万亩</div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-white/30 uppercase mb-1">当前完成进度</div>
                <div className="text-[18px] font-black text-blue-400">87.8%</div>
              </div>
            </div>
            <div className="h-[200px] w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cropData} layout="vertical" margin={{ left: -20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    width={60}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                  <Bar dataKey="area" radius={[0, 4, 4, 0]} barSize={12}>
                    {cropData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'iot':
        return (
          <div className="space-y-6">
             <div className="grid grid-cols-3 gap-2">
              {[
                { label: '在线设备', val: 148, color: 'text-emerald-400' },
                { label: '异常告警', val: 2, color: 'text-rose-400' },
                { label: '待维保', val: 5, color: 'text-amber-400' },
              ].map((s, idx) => (
                <div key={idx} className="bg-white/5 p-2 rounded-xl text-center border border-white/5">
                  <div className="text-[8px] font-bold text-white/20 uppercase mb-0.5 whitespace-nowrap">{s.label}</div>
                  <div className={cn("text-[14px] font-black", s.color)}>{s.val}</div>
                </div>
              ))}
            </div>
            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={iotStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={30}
                    outerRadius={60}
                    dataKey="count"
                    stroke="none"
                  >
                    {iotStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    itemStyle={{ fontSize: '10px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    iconSize={8}
                    formatter={(value) => <span className="text-[10px] font-bold text-white/40">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'land': return '土地权属构成分析';
      case 'crops': return '作物分布及其规模统计';
      case 'iot': return '物联设备运行状态监控';
    }
  };

  const getHeaderStat = () => {
    switch (activeTab) {
      case 'land': return '30.8万亩';
      case 'crops': return '72.7% 覆盖';
      case 'iot': return '148 在线';
    }
  };

  return (
    <div className="fixed bottom-24 left-0 right-0 z-40 px-6 pointer-events-none">
      <motion.div 
        layout
        initial={false}
        animate={{ 
          height: isExpanded ? '440px' : '64px',
        }}
        className={cn(
          "w-full max-w-lg mx-auto bg-slate-900/80 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl pointer-events-auto transition-colors",
          isExpanded ? "bg-slate-900/90" : "hover:bg-slate-900/70"
        )}
      >
        {/* Header Handle */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full h-[64px] px-6 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white/10 transition-colors">
              <TrendingUp size={18} />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">智能分析预览</div>
              <div className="text-[14px] font-black text-white leading-none">{getHeaderStat()}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/80">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
             </div>
          </div>
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 pb-8 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-6 text-white/20">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                 <span className="text-[11px] font-black uppercase tracking-tighter">{getTabTitle()}</span>
                 <Info size={12} className="ml-auto" />
              </div>
              
              {renderContent()}

              <div className="mt-8 pt-4 border-t border-white/5">
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[11px] font-bold text-white transition-all">
                  查看详细业务报表
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
