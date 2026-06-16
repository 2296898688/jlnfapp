import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Filter,
  Map as MapIcon,
  ChevronDown,
  X,
  PlusCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useUser } from '../UserContext';
import { mockMapPlots } from '../mockData';

const ORG_OPTIONS = ['白城牧场', '镇南种羊场', '长岭种马场'];
const TYPE_OPTIONS = ['田间管理', '播种', '施肥', '植保', '收获'];
const PROJECT_OPTIONS: Record<string, string[]> = {
  '田间管理': ['打药', '深耕', '除草', '灌水', '修剪'],
  '播种': ['平播', '精量播种', '条播'],
  '施肥': ['追肥', '基肥', '叶面肥'],
  '植保': ['除草剂', '杀虫剂', '杀菌剂'],
  '收获': ['机械收割', '人工收割'],
};

interface OpRecord {
  id: string;
  season: string;
  type: string;
  project: string;
  crop: string;
  variety: string;
  org: string;
  date: string;
  plotCount: number;
  area: number;
}

const MOCK_RECORDS: OpRecord[] = [
  { id: 'op1', season: '2026', type: '田间管理', project: '打药', crop: '玉米', variety: '郑单958', org: '白城牧场', date: '2026-06-15', plotCount: 4, area: 186.5 },
  { id: 'op2', season: '2026', type: '播种', project: '精量播种', crop: '大豆', variety: '中黄13', org: '镇南种羊场', date: '2026-05-02', plotCount: 6, area: 320.8 },
  { id: 'op3', season: '2026', type: '施肥', project: '追肥', crop: '小麦', variety: '蒙麦20', org: '长岭种马场', date: '2026-06-08', plotCount: 3, area: 145.2 },
  { id: 'op4', season: '2026', type: '田间管理', project: '除草', crop: '玉米', variety: '先育335', org: '白城牧场', date: '2026-05-20', plotCount: 5, area: 210.3 },
  { id: 'op5', season: '2025', type: '植保', project: '除草剂', crop: '大豆', variety: '黑河43', org: '镇南种羊场', date: '2025-06-12', plotCount: 4, area: 178.6 },
  { id: 'op6', season: '2025', type: '收获', project: '机械收割', crop: '小麦', variety: '京麦31', org: '长岭种马场', date: '2025-07-25', plotCount: 5, area: 265.0 },
  { id: 'op7', season: '2025', type: '田间管理', project: '灌水', crop: '玉米', variety: '京科968', org: '镇南种羊场', date: '2025-06-28', plotCount: 3, area: 132.4 },
  { id: 'op8', season: '2024', type: '播种', project: '平播', crop: '高粱', variety: '吉杂127', org: '白城牧场', date: '2024-05-10', plotCount: 2, area: 88.0 },
  { id: 'op9', season: '2024', type: '施肥', project: '基肥', crop: '大豆', variety: '合丰55', org: '长岭种马场', date: '2024-04-28', plotCount: 3, area: 156.7 },
];

export function AgriculturalOperation() {
  const { user } = useUser();
  const [season, setSeason] = useState('2026');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [projFilter, setProjFilter] = useState('全部');
  const [orgFilter, setOrgFilter] = useState('全部农场');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showPlotSelector, setShowPlotSelector] = useState(false);
  const [selectedPlotIds, setSelectedPlotIds] = useState<Set<string>>(new Set());
  const [detailRecord, setDetailRecord] = useState<OpRecord | null>(null);

  const [form, setForm] = useState({
    type: '田间管理',
    project: '打药',
    crop: '玉米',
    variety: '郑单958',
    org: '白城牧场',
  });
  const [showTypePick, setShowTypePick] = useState(false);
  const [showProjPick, setShowProjPick] = useState(false);
  const [showOrgPick, setShowOrgPick] = useState(false);

  const filtered = MOCK_RECORDS.filter(r => {
    if (user.orgFilter && r.org !== user.orgFilter) return false;
    if (r.season !== season) return false;
    if (typeFilter !== '全部' && r.type !== typeFilter) return false;
    if (projFilter !== '全部' && r.project !== projFilter) return false;
    if (orgFilter !== '全部农场' && r.org !== orgFilter) return false;
    if (dateFrom && r.date < dateFrom) return false;
    if (dateTo && r.date > dateTo) return false;
    if (search && !r.crop.includes(search) && !r.variety.includes(search) && !r.project.includes(search)) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, r) => {
    const k = r.type;
    if (!acc[k]) acc[k] = [];
    acc[k].push(r);
    return acc;
  }, {} as Record<string, OpRecord[]>);

  const selectedPlots = mockMapPlots.filter(p => selectedPlotIds.has(p.id));
  const totalArea = selectedPlots.reduce((s, p) => s + p.area, 0);

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-medium"
              placeholder="搜索作物、品种、项目..."
            />
          </div>
          <button onClick={() => setShowFilterDrawer(true)} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 active:scale-95">
            <Filter size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 shrink-0">
            {['2026', '2025', '2024'].map(s => (
              <button
                key={s}
                onClick={() => setSeason(s)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap",
                  season === s ? "bg-blue-700 text-white shadow" : "text-slate-500"
                )}
              >
                {s}种植季
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-5 pb-24">
          <span className="text-[11px] font-bold text-slate-400 px-1">共 {filtered.length} 条</span>
          {Object.entries(grouped).map(([type, records]) => (
            <div key={type} className="space-y-1">
              <div className="flex items-center gap-2 px-1 py-1">
                <div className="w-1 h-3.5 bg-blue-700 rounded-full" />
                <h4 className="text-[13px] font-bold text-slate-700">{type}</h4>
                <span className="text-[10px] text-slate-400">{records.length}</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                {records.map((r, idx) => (
                  <button
                    key={r.id}
                    onClick={() => setDetailRecord(r)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-slate-50",
                      idx < records.length - 1 && "border-b border-slate-50"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black rounded">{r.project}</span>
                      </div>
                      <p className="text-[13px] font-bold text-slate-800 truncate">
                        {r.crop} · {r.variety}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {r.plotCount}块 · {r.area}亩 · {r.org} · {r.date}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400 text-[13px] font-bold">暂无{season}种植季作业记录</div>
      )}

      {/* FAB */}
      <div className="fixed bottom-28 right-6 z-40">
        <button
          onClick={() => setShowForm(true)}
          className="w-16 h-16 bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-200 active:scale-90 transition-transform"
        >
          <Plus size={32} />
        </button>
      </div>

      {/* Detail Bottom Sheet */}
      <AnimatePresence>
        {detailRecord && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailRecord(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="relative w-full max-w-xl bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[75vh]">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3" />
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
                <h3 className="text-[16px] font-bold text-slate-800">作业详情</h3>
                <button onClick={() => setDetailRecord(null)} className="p-1 text-slate-400"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '作业类型', val: detailRecord.type },
                    { label: '作业项目', val: detailRecord.project },
                    { label: '作物', val: detailRecord.crop },
                    { label: '品种', val: detailRecord.variety },
                    { label: '组织', val: detailRecord.org },
                    { label: '日期', val: detailRecord.date },
                  ].map(f => (
                    <div key={f.label} className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400">{f.label}</span>
                      <p className="text-[13px] font-bold text-slate-800">{f.val}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-[13px] font-bold text-slate-700">{detailRecord.plotCount} 个地块</span>
                  <span className="text-[16px] font-mono font-bold text-blue-700">{detailRecord.area} 亩</span>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100">
                <button onClick={() => setDetailRecord(null)} className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl text-[12px] font-bold">关闭</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-auto max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-[18px] font-bold text-slate-800">作业填报</h3>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 active:bg-slate-50 rounded-full"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 作业类型 */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-600 block"><span className="text-rose-500 mr-1">*</span>作业类型</label>
                  <div className="relative">
                    <button onClick={() => setShowTypePick(!showTypePick)} className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] text-slate-800 font-bold">
                      {form.type} <ChevronDown size={14} className="opacity-40" />
                    </button>
                    {showTypePick && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-lg z-10 overflow-hidden">
                        {TYPE_OPTIONS.map(t => (
                          <button key={t} onClick={() => { setForm(p => ({ ...p, type: t, project: PROJECT_OPTIONS[t]?.[0] || '' })); setShowTypePick(false); }}
                            className={cn("w-full text-left px-4 py-3.5 text-[14px] font-bold active:bg-slate-50", form.type === t ? "text-blue-700 bg-blue-50/50" : "text-slate-700")}>{t}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 作业项目 */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-600 block"><span className="text-rose-500 mr-1">*</span>作业项目</label>
                  <div className="relative">
                    <button onClick={() => setShowProjPick(!showProjPick)} className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] text-slate-800 font-bold">
                      {form.project} <ChevronDown size={14} className="opacity-40" />
                    </button>
                    {showProjPick && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-lg z-10 overflow-hidden">
                        {(PROJECT_OPTIONS[form.type] || []).map(p => (
                          <button key={p} onClick={() => { setForm(pr => ({ ...pr, project: p })); setShowProjPick(false); }}
                            className={cn("w-full text-left px-4 py-3.5 text-[14px] font-bold active:bg-slate-50", form.project === p ? "text-blue-700 bg-blue-50/50" : "text-slate-700")}>{p}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 作物 + 品种 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-600 block">作物</label>
                    <div className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] text-slate-800 font-bold">{form.crop}</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-600 block">品种</label>
                    <div className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] text-slate-800 font-bold">{form.variety}</div>
                  </div>
                </div>

                {/* 组织 */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-600 block"><span className="text-rose-500 mr-1">*</span>组织</label>
                  <div className="relative">
                    <button onClick={() => setShowOrgPick(!showOrgPick)} className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] text-slate-800 font-bold">
                      {form.org} <ChevronDown size={14} className="opacity-40" />
                    </button>
                    {showOrgPick && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-lg z-10 overflow-hidden">
                        {ORG_OPTIONS.map(o => (
                          <button key={o} onClick={() => { setForm(p => ({ ...p, org: o })); setShowOrgPick(false); }}
                            className={cn("w-full text-left px-4 py-3.5 text-[14px] font-bold active:bg-slate-50", form.org === o ? "text-blue-700 bg-blue-50/50" : "text-slate-700")}>{o}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 地块选择 */}
                <div className="pt-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="w-1 h-4 bg-blue-700 rounded-full" /><h4 className="text-[14px] font-bold text-slate-800">作业地块</h4></div>
                    <button onClick={() => setShowPlotSelector(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white text-[11px] font-bold rounded-full shadow-lg shadow-blue-100 active:scale-95">
                      <Plus size={14} /> 选择地块
                    </button>
                  </div>
                  {selectedPlots.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPlots.map(plot => (
                        <div key={plot.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-slate-800 truncate">{plot.name}</p>
                            <p className="text-[10px] text-slate-400">{plot.crop || '—'} · {plot.area.toFixed(1)}亩</p>
                          </div>
                          <button onClick={() => setSelectedPlotIds(prev => { const n = new Set(prev); n.delete(plot.id); return n; })} className="text-[10px] font-bold text-rose-500 ml-3">移除</button>
                        </div>
                      ))}
                      <p className="text-right text-[11px] font-bold text-slate-500">共 {selectedPlots.length} 块 · 合计 {totalArea.toFixed(1)} 亩</p>
                    </div>
                  ) : (
                    <div className="py-10 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                      <Plus size={24} className="mb-1" /><p className="text-[11px] font-bold">点击上方选择地块</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400">合计面积</span>
                  <span className="text-[18px] font-mono font-bold text-slate-800">{totalArea.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">亩</span></span>
                </div>
                <button onClick={() => { setShowForm(false); setSelectedPlotIds(new Set()); }} className="flex-1 py-4 bg-blue-700 text-white rounded-2xl text-[14px] font-bold shadow-xl shadow-blue-200 active:scale-[0.98]">
                  提交填报
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Plot Selector (same as plan tab) */}
      <AnimatePresence>
        {showPlotSelector && (
          <div className="fixed inset-0 z-[70] flex flex-col bg-white">
            <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowPlotSelector(false)} className="p-1 active:bg-slate-50 rounded-lg"><X size={24} className="text-slate-400" /></button>
                <div className="flex flex-col">
                  <h3 className="text-[16px] font-bold text-slate-800">选择作业地块</h3>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{form.org}</span>
                </div>
              </div>
              <button onClick={() => setShowPlotSelector(false)} className="px-6 py-2 bg-blue-700 text-white rounded-full text-xs font-bold">完成 ({selectedPlotIds.size})</button>
            </header>

            <div className="flex-1 relative bg-slate-100 overflow-hidden">
              <div className="absolute inset-0 bg-[#e5e7eb] flex items-center justify-center">
                <div className="w-full h-full relative opacity-50 overflow-hidden">
                  <div className="absolute left-[20%] top-[30%] w-32 h-24 bg-white/40 border border-white/60 skew-x-12 rotate-12" />
                  <div className="absolute left-[40%] top-[20%] w-48 h-32 bg-blue-500/10 border-2 border-blue-500/20 rounded-full" />
                  <div className="absolute left-[10%] top-[60%] w-40 h-40 bg-blue-500/10 border-2 border-blue-500/20" />
                  <div className="absolute right-[20%] top-[40%] w-64 h-48 bg-slate-400/10 border-2 border-slate-400/20 rounded-[40px]" />
                </div>
                <div className="absolute flex flex-col items-center gap-2">
                  <MapIcon size={48} className="text-slate-300 animate-pulse" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Map Layer Loading...</p>
                </div>
              </div>

              <div className="absolute inset-0 p-10">
                {mockMapPlots.filter(p => p.farm === form.org).map((plot, idx) => {
                  const isSelected = selectedPlotIds.has(plot.id);
                  return (
                    <button key={plot.id} onClick={() => { setSelectedPlotIds(prev => { const n = new Set(prev); if (n.has(plot.id)) n.delete(plot.id); else n.add(plot.id); return n; }); }}
                      style={{ left: `${20 + (idx % 4) * 18}%`, top: `${25 + Math.floor(idx / 4) * 22}%` }}
                      className={cn("absolute p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 shadow-lg active:scale-95 group", isSelected ? "bg-blue-700 border-white text-white scale-110" : "bg-white border-blue-500/20 text-slate-600 hover:border-blue-500")}>
                      <MapIcon size={20} className={isSelected ? "text-white" : "text-blue-500"} />
                      <span className="text-[10px] font-bold whitespace-nowrap">{plot.name.length > 8 ? plot.name.slice(0, 8) + '…' : plot.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="absolute bottom-40 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/80 backdrop-blur rounded-full text-white text-[10px] font-bold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />当前定位：{form.org}
              </div>

              <div className="absolute bottom-0 left-0 right-0 max-h-[45%] bg-white rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col">
                <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto my-3" />
                <div className="px-6 flex items-center justify-between">
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-800">全部地块列表</h4>
                    <span className="text-[10px] text-slate-400 font-bold">范围：{form.org}</span>
                  </div>
                  <span className="text-[10px] bg-slate-50 px-3 py-1 rounded-full text-slate-400 font-bold">共 {mockMapPlots.filter(p => p.farm === form.org).length} 个</span>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 pb-8">
                  {mockMapPlots.filter(p => p.farm === form.org).map(plot => {
                    const isSelected = selectedPlotIds.has(plot.id);
                    return (
                      <div key={plot.id} onClick={() => { setSelectedPlotIds(prev => { const n = new Set(prev); if (n.has(plot.id)) n.delete(plot.id); else n.add(plot.id); return n; }); }}
                        className={cn("flex items-center justify-between p-4 rounded-2xl border cursor-pointer", isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-slate-50 hover:border-slate-100")}>
                        <div className="space-y-0.5">
                          <h5 className={cn("text-[13px] font-bold", isSelected ? "text-blue-700" : "text-slate-800")}>{plot.name}</h5>
                          <p className="text-[10px] text-slate-400 font-bold">{form.org}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={cn("text-[14px] font-mono font-bold", isSelected ? "text-blue-600" : "text-slate-600")}>{plot.area.toFixed(1)}<span className="text-[10px] text-slate-300 font-bold ml-1">亩</span></span>
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", isSelected ? "bg-blue-700 text-white" : "bg-slate-50 text-slate-200")}>{isSelected ? <X size={14} /> : <Plus size={14} />}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter Drawer */}
      <AnimatePresence>
        {showFilterDrawer && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilterDrawer(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="relative w-80 bg-white h-full shadow-2xl flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-slate-800">条件筛选</h3>
                <button onClick={() => setShowFilterDrawer(false)} className="p-2 text-slate-400"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">作业日期范围</label>
                  <div className="flex items-center gap-2">
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10" />
                    <span className="text-slate-300 text-xs">—</span>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">作业类型</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['全部', ...TYPE_OPTIONS].map(v => (
                      <button key={v} onClick={() => setTypeFilter(v)}
                        className={cn("py-3 px-4 rounded-xl text-xs font-bold border transition-colors", typeFilter === v ? "bg-blue-700 text-white border-blue-700" : "bg-slate-50 border-slate-100 text-slate-600")}>{v}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">作业项目</label>
                  <div className="flex flex-wrap gap-2">
                    {['全部', ...TYPE_OPTIONS.flatMap(t => PROJECT_OPTIONS[t] || []).filter((v, i, a) => a.indexOf(v) === i)].map(p => (
                      <button key={p} onClick={() => setProjFilter(p)}
                        className={cn("px-3 py-2 rounded-xl border text-xs font-bold transition-colors", projFilter === p ? "bg-blue-700 text-white border-blue-700" : "bg-slate-50 border-slate-100 text-slate-600")}>{p}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">组织机构</label>
                  <div className="space-y-2">
                    {(user.orgFilter ? [user.orgFilter] : ['全部农场', ...ORG_OPTIONS]).map(o => (
                      <button key={o} onClick={() => setOrgFilter(o)}
                        className={cn("w-full text-left p-3 rounded-xl border text-xs font-bold transition-colors", orgFilter === o ? "bg-blue-700 text-white border-blue-700" : "bg-slate-50 border-slate-100 text-slate-600")}>{o}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 gap-3">
                <button onClick={() => { setTypeFilter('全部'); setProjFilter('全部'); setOrgFilter('全部农场'); setDateFrom(''); setDateTo(''); }} className="py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold">重置</button>
                <button onClick={() => setShowFilterDrawer(false)} className="py-3 bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100">确定</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
