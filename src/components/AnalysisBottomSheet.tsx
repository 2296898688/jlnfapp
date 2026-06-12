import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { ChevronUp, MapPin, Activity, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';
import type { MapViewType } from '../types';

/* ──────────── constants ──────────── */

const PEEK_VISIBLE = 88; // px shown above bottom nav in peek state
const HALF_RATIO = 0.38; // fraction of viewport in half state
const FULL_RATIO = 0.84; // fraction of viewport in full state

/* ──────────── mock chart data ──────────── */

const LAND_TYPE_DATA = [
  { name: '宗地', value: 45, color: '#3b82f6' },
  { name: '高标准农田', value: 30, color: '#10b981' },
  { name: '盐碱地', value: 15, color: '#f59e0b' },
  { name: '租赁地', value: 10, color: '#8b5cf6' },
];

const CROP_AREA_DATA = [
  { name: '玉米', area: 12.5, color: '#fbbf24' },
  { name: '小麦', area: 8.2, color: '#34d399' },
  { name: '大豆', area: 5.5, color: '#60a5fa' },
  { name: '闲置', area: 2.1, color: '#94a3b8' },
];

const IOT_STATUS_DATA = [
  { name: '在线', value: 148, color: '#10b981' },
  { name: '离线', value: 15, color: '#94a3b8' },
  { name: '故障', value: 2, color: '#ef4444' },
];

const ALARM_TREND = [
  { day: '6/1', 高温: 3, 湿度: 1, 离线: 2 },
  { day: '6/2', 高温: 2, 湿度: 1, 离线: 1 },
  { day: '6/3', 高温: 4, 湿度: 2, 离线: 3 },
  { day: '6/4', 高温: 1, 湿度: 0, 离线: 1 },
  { day: '6/5', 高温: 2, 湿度: 1, 离线: 0 },
  { day: '6/6', 高温: 3, 湿度: 1, 离线: 2 },
  { day: '6/7', 高温: 1, 湿度: 0, 离线: 1 },
];

/* ──────────── helpers ──────────── */

function snapToOffset(snap: 'peek' | 'half' | 'full', sheetH: number) {
  if (snap === 'peek') return sheetH - PEEK_VISIBLE;
  if (snap === 'half') return sheetH * (1 - HALF_RATIO);
  return 0; // full
}

function nearestSnap(offset: number, sheetH: number): 'peek' | 'half' | 'full' {
  const peek = sheetH - PEEK_VISIBLE;
  const half = sheetH * (1 - HALF_RATIO);
  const distPeek = Math.abs(offset - peek);
  const distHalf = Math.abs(offset - half);
  const distFull = Math.abs(offset - 0);
  const min = Math.min(distPeek, distHalf, distFull);
  if (min === distFull) return 'full';
  if (min === distHalf) return 'half';
  return 'peek';
}

/* ──────────── component ──────────── */

interface Props {
  activeTab: MapViewType;
}

export function AnalysisBottomSheet({ activeTab }: Props) {
  const [snap, setSnap] = useState<'peek' | 'half' | 'full'>('peek');
  const [viewH, setViewH] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight : 800,
  );

  useEffect(() => {
    const onResize = () => setViewH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const sheetH = Math.round(viewH * FULL_RATIO);
  const peekOffset = sheetH - PEEK_VISIBLE;
  const offset = snapToOffset(snap, sheetH);

  // dynamic drag constraints so the sheet stays between full & peek
  const dragConstraints = {
    top: -offset,               // can drag up to y = 0 (full)
    bottom: peekOffset - offset, // can drag down to y = peekOffset
  };

  const handleDragEnd = useCallback(
    (_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
      // compute accumulated drag offset relative to the current snap's base
      const dragY = offset + info.offset.y;
      // velocity-assisted snapping
      const threshold = info.velocity.y > 300
        ? 'down'
        : info.velocity.y < -300
          ? 'up'
          : null;
      let next: 'peek' | 'half' | 'full';
      if (threshold === 'down') {
        // flick down → go to next lower snap
        if (snap === 'full') next = 'half';
        else if (snap === 'half') next = 'peek';
        else next = 'peek';
      } else if (threshold === 'up') {
        // flick up → go to next higher snap
        if (snap === 'peek') next = 'half';
        else if (snap === 'half') next = 'full';
        else next = 'full';
      } else {
        next = nearestSnap(dragY, sheetH);
      }
      setSnap(next);
    },
    [offset, snap, sheetH],
  );

  /* ── peek row content ── */
  const PeekRow = () => {
    if (activeTab === 'land') {
      return (
        <div className="flex items-center gap-4 text-white/80 text-[11px] font-bold whitespace-nowrap">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            宗地 45块
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            高标准 30块
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            盐碱地 15块
          </span>
        </div>
      );
    }
    if (activeTab === 'crops') {
      return (
        <div className="flex items-center gap-4 text-white/80 text-[11px] font-bold whitespace-nowrap">
          <span>🌽 玉米 12.5万亩</span>
          <span>🌾 小麦 8.2万亩</span>
          <span>🫛 大豆 5.5万亩</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-4 text-white/80 text-[11px] font-bold whitespace-nowrap">
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          在线 148
        </span>
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          离线 15
        </span>
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          故障 2
        </span>
      </div>
    );
  };

  /* ── half content ── */
  const HalfContent = () => {
    if (activeTab === 'land') {
      return (
        <div className="px-6 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">
              土地权属构成
            </span>
            <span className="text-[10px] font-bold text-white/20">上滑查看更多 ›</span>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={LAND_TYPE_DATA}
                  cx="50%" cy="45%"
                  innerRadius={40} outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {LAND_TYPE_DATA.map((d, i) => (
                    <Cell key={i} fill={d.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12, background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                    fontSize: 11,
                  }}
                />
                <Legend
                  verticalAlign="bottom" align="center" iconType="circle" iconSize={6}
                  formatter={(v: string) => (
                    <span className="text-[10px] font-bold text-white/50">{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }
    if (activeTab === 'crops') {
      return (
        <div className="px-6 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">作物种植面积（万亩）</span>
            <span className="text-[10px] font-bold text-white/20">上滑查看更多 ›</span>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CROP_AREA_DATA} layout="vertical" margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} width={50} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ borderRadius: 12, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11 }} formatter={(val: number) => [`${val}万亩`]} />
                <Bar dataKey="area" radius={[0, 6, 6, 0]} barSize={14}>
                  {CROP_AREA_DATA.map((d, i) => (<Cell key={i} fill={d.color} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }
    return (
      <div className="px-6 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">设备运行状态</span>
          <span className="text-[10px] font-bold text-white/20">上滑查看更多 ›</span>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={IOT_STATUS_DATA}
                cx="50%" cy="45%"
                innerRadius={40} outerRadius={70}
                dataKey="value" stroke="none"
              >
                {IOT_STATUS_DATA.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12, background: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                  fontSize: 11,
                }}
              />
              <Legend
                verticalAlign="bottom" iconSize={6}
                formatter={(v: string) => (
                  <span className="text-[10px] font-bold text-white/50">{v}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  /* ── full content ── */
  const FullContent = () => {
    if (activeTab === 'land') {
      return (
        <div className="px-6 space-y-6 overflow-y-auto" style={{ maxHeight: viewH * FULL_RATIO - 120 }}>
          {/* summary cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '管理规模', val: '30.8万亩', clr: 'text-blue-400' },
              { label: '数字化覆盖', val: '100%', clr: 'text-emerald-400' },
              { label: '宗地总数', val: '124块', clr: 'text-amber-400' },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <div className="text-[9px] font-bold text-white/20 uppercase mb-0.5">{s.label}</div>
                <div className={cn('text-[16px] font-black', s.clr)}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* pie chart */}
          <div>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
              土地类型分布
            </span>
            <div className="h-[200px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={LAND_TYPE_DATA}
                    cx="50%" cy="45%"
                    innerRadius={45} outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {LAND_TYPE_DATA.map((d, i) => (
                      <Cell key={i} fill={d.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12, background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                      fontSize: 11,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom" align="center" iconType="circle" iconSize={8}
                    formatter={(v: string) => (
                      <span className="text-[10px] font-bold text-white/40">{v}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* detail table */}
          <div>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
              各类型明细
            </span>
            <div className="mt-2 space-y-1">
              {LAND_TYPE_DATA.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl border border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-[12px] font-bold text-white/80">{d.name}</span>
                  </div>
                  <span className="text-[12px] font-black text-white">{d.value} 块</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    if (activeTab === 'crops') {
      return (
        <div className="px-6 space-y-6 overflow-y-auto" style={{ maxHeight: viewH * FULL_RATIO - 120 }}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '种植任务', val: '25.5万亩', clr: 'text-blue-400' },
              { label: '完成率', val: '87.8%', clr: 'text-emerald-400' },
              { label: '作物种类', val: '6种', clr: 'text-amber-400' },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <div className="text-[9px] font-bold text-white/20 uppercase mb-0.5">{s.label}</div>
                <div className={cn('text-[16px] font-black', s.clr)}>{s.val}</div>
              </div>
            ))}
          </div>
          <div>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">种植面积分布</span>
            <div className="h-[220px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CROP_AREA_DATA} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} width={60} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ borderRadius: 12, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11 }} formatter={(val: number) => [`${val}万亩`]} />
                  <Bar dataKey="area" radius={[0, 8, 8, 0]} barSize={18}>
                    {CROP_AREA_DATA.map((d, i) => (<Cell key={i} fill={d.color} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">作物明细</span>
            <div className="mt-2 space-y-1">
              {CROP_AREA_DATA.map((d, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: d.color }} /><span className="text-[12px] font-bold text-white/80">{d.name}</span></div>
                  <span className="text-[12px] font-black text-white">{d.area} 万亩</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="px-6 space-y-6 overflow-y-auto" style={{ maxHeight: viewH * FULL_RATIO - 120 }}>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '在线设备', val: 148, clr: 'text-emerald-400' },
            { label: '异常告警', val: 2, clr: 'text-rose-400' },
            { label: '待维保', val: 5, clr: 'text-amber-400' },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <div className="text-[9px] font-bold text-white/20 uppercase mb-0.5">{s.label}</div>
              <div className={cn('text-[16px] font-black', s.clr)}>{s.val}</div>
            </div>
          ))}
        </div>
        <div>
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
            设备状态分布
          </span>
          <div className="h-[180px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={IOT_STATUS_DATA}
                  cx="50%" cy="45%"
                  innerRadius={40} outerRadius={70}
                  dataKey="value" stroke="none"
                >
                  {IOT_STATUS_DATA.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12, background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                    fontSize: 11,
                  }}
                />
                <Legend
                  verticalAlign="bottom" iconSize={8}
                  formatter={(v: string) => (
                    <span className="text-[10px] font-bold text-white/50">{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
            近7日告警趋势
          </span>
          <div className="h-[180px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ALARM_TREND} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12, background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                    fontSize: 11,
                  }}
                />
                <Legend
                  iconSize={6}
                  formatter={(v: string) => (
                    <span className="text-[10px] font-bold text-white/50">{v}</span>
                  )}
                />
                <Bar dataKey="高温" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="湿度" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="离线" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  /* ──────────── render ──────────── */

  const title = activeTab === 'land' ? '土地分析' : activeTab === 'crops' ? '种植分析' : '设备分析';
  const Icon = activeTab === 'land' ? MapPin : activeTab === 'crops' ? Activity : Cpu;

  return (
    <motion.div
      drag="y"
      dragConstraints={dragConstraints}
      dragElastic={0.08}
      onDragEnd={handleDragEnd}
      animate={{ y: offset }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      initial={{ y: snapToOffset('peek', sheetH) }}
      className="fixed left-2 right-2 z-40 rounded-t-[28px] overflow-hidden"
      style={{
        height: sheetH,
        bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
        y: snapToOffset('peek', sheetH),
      }}
    >
      {/* backdrop */}
      <div
        className={cn(
          'absolute inset-0 transition-colors duration-300',
          snap === 'full'
            ? 'bg-slate-900/95 backdrop-blur-2xl'
            : 'bg-slate-900/88 backdrop-blur-xl',
        )}
      />

      <div className="relative h-full flex flex-col">
        {/* ── drag handle ── */}
        <div className="shrink-0 pt-3 pb-1 flex justify-center">
          <button
            onClick={() => {
              if (snap === 'peek') setSnap('half');
              else if (snap === 'half') setSnap('full');
              else setSnap('peek');
            }}
            className="w-full flex flex-col items-center gap-1.5 cursor-grab active:cursor-grabbing touch-none"
            aria-label="拖拽调整分析面板"
          >
            <div className="w-10 h-1 bg-white/25 rounded-full group-hover:bg-white/40 transition-colors" />
            {snap === 'peek' && (
              <ChevronUp size={12} className="text-white/20" />
            )}
          </button>
        </div>

        {/* ── peek row ── */}
        <div className="shrink-0 px-5 flex items-center justify-between h-[44px]">
          <div className="flex items-center gap-2 min-w-0">
            <Icon size={14} className="text-white/40 shrink-0" />
            <span className="text-[11px] font-black text-white/50 uppercase tracking-wider shrink-0">
              {title}
            </span>
            <div className="w-[1px] h-3 bg-white/10 shrink-0" />
            <div className="overflow-x-auto scrollbar-none">
              <PeekRow />
            </div>
          </div>
          {snap !== 'peek' && (
            <button
              onClick={() => setSnap('peek')}
              className="text-white/30 hover:text-white/60 ml-2 shrink-0"
            >
              <ChevronUp size={16} className="rotate-180" />
            </button>
          )}
        </div>

        {/* ── divider ── */}
        <div className="shrink-0 mx-5 h-px bg-white/5" />

        {/* ── scrollable body ── */}
        <div
          className={cn(
            'flex-1 overflow-y-auto',
            snap === 'peek' ? 'hidden' : 'visible',
          )}
        >
          {snap === 'half' && <HalfContent />}
          {(snap === 'full') && <FullContent />}
        </div>

        {/* ── bottom safe padding ── */}
        <div className="shrink-0 h-4" />
      </div>
    </motion.div>
  );
}
