import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, X, Plus, PlusCircle, Map as MapIcon, ChevronRight, TrendingUp, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUser } from '../UserContext';
import { mockMapPlots } from '../mockData';

const ORG_OPTIONS = ['白城牧场', '镇南种羊场', '长岭种马场'];
const CROP_OPTIONS = ['玉米', '小麦', '大豆', '高粱'];
const VARIETY_OPTIONS: Record<string, string[]> = {
  '玉米': ['郑单958', '先育335', '京科968', '良玉99'],
  '小麦': ['蒙麦20', '京麦31', '宁春4号'],
  '大豆': ['中黄13', '黑河43', '合丰55'],
  '高粱': ['吉杂127', '龙杂17'],
};
const DEFAULT_UNIT_YIELD: Record<string, number> = {
  '郑单958': 1200, '先育335': 1300, '京科968': 1100, '良玉99': 1150,
  '蒙麦20': 700, '京麦31': 750, '宁春4号': 680,
  '中黄13': 350, '黑河43': 320, '合丰55': 340,
  '吉杂127': 800, '龙杂17': 780,
};

interface YieldRecord {
  id: string;
  season: string;
  crop: string;
  variety: string;
  org: string;
  plotName: string;
  area: number;
  estimatedYield: number; // 斤
  unitYield: number; // 斤/亩
}

const MOCK_YIELDS: YieldRecord[] = [
  { id: 'y1', season: '2026', crop: '玉米', variety: '郑单958', org: '白城牧场', plotName: '二队3号地', area: 12425, estimatedYield: 14910000, unitYield: 1200 },
  { id: 'y2', season: '2026', crop: '玉米', variety: '先育335', org: '白城牧场', plotName: '渠东高标地块三', area: 5200, estimatedYield: 6760000, unitYield: 1300 },
  { id: 'y3', season: '2026', crop: '玉米', variety: '京科968', org: '镇南种羊场', plotName: '镇南-东岗6号地', area: 3800, estimatedYield: 4180000, unitYield: 1100 },
  { id: 'y4', season: '2026', crop: '小麦', variety: '蒙麦20', org: '长岭种马场', plotName: '长岭-东大甸子', area: 6700, estimatedYield: 4690000, unitYield: 700 },
  { id: 'y5', season: '2026', crop: '小麦', variety: '京麦31', org: '镇南种羊场', plotName: '镇南-苇塘西地', area: 4500, estimatedYield: 3375000, unitYield: 750 },
  { id: 'y6', season: '2026', crop: '大豆', variety: '中黄13', org: '白城牧场', plotName: '白城河西一号地', area: 7200, estimatedYield: 2520000, unitYield: 350 },
  { id: 'y7', season: '2026', crop: '大豆', variety: '黑河43', org: '长岭种马场', plotName: '长岭-南大甸子', area: 3100, estimatedYield: 992000, unitYield: 320 },
  { id: 'y8', season: '2025', crop: '玉米', variety: '郑单958', org: '白城牧场', plotName: '二队3号地', area: 12425, estimatedYield: 13667500, unitYield: 1100 },
  { id: 'y9', season: '2025', crop: '小麦', variety: '宁春4号', org: '长岭种马场', plotName: '长岭-北甸子2号', area: 4500, estimatedYield: 3150000, unitYield: 700 },
  { id: 'y10', season: '2024', crop: '大豆', variety: '合丰55', org: '镇南种羊场', plotName: '镇南-东风3号地', area: 3100, estimatedYield: 1085000, unitYield: 350 },
  { id: 'y11', season: '2024', crop: '高粱', variety: '吉杂127', org: '白城牧场', plotName: '白城-南岗4号地', area: 1500, estimatedYield: 1200000, unitYield: 800 },
];

export function YieldReporting() {
  const { user } = useUser();
  const [season, setSeason] = useState('2026');
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('全部');
  const [orgFilter, setOrgFilter] = useState('全部农场');
  const [showForm, setShowForm] = useState(false);
  const [showPlotPicker, setShowPlotPicker] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedPlotIds, setSelectedPlotIds] = useState<Set<string>>(new Set());
  const [detailRecord, setDetailRecord] = useState<YieldRecord | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    totalYield: '',
    crop: '玉米',
    variety: '郑单958',
  });
  const [formOrg, setFormOrg] = useState('白城牧场');
  const [showCropPick, setShowCropPick] = useState(false);
  const [showVarPick, setShowVarPick] = useState(false);
  const unitYield = DEFAULT_UNIT_YIELD[form.variety] || 0;

  const filtered = MOCK_YIELDS.filter(r => {
    if (user.orgFilter && r.org !== user.orgFilter) return false;
    if (r.season !== season) return false;
    if (cropFilter !== '全部' && r.crop !== cropFilter) return false;
    if (orgFilter !== '全部农场' && r.org !== orgFilter) return false;
    if (search && !r.crop.includes(search) && !r.variety.includes(search) && !r.plotName.includes(search)) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, r) => {
    const k = r.crop;
    if (!acc[k]) acc[k] = [];
    acc[k].push(r);
    return acc;
  }, {} as Record<string, YieldRecord[]>);

  const totalArea = filtered.reduce((s, r) => s + r.area, 0);
  const totalYield = filtered.reduce((s, r) => s + r.estimatedYield, 0);
  const selectedPlots = mockMapPlots.filter(p => selectedPlotIds.has(p.id));
  const plotTotalArea = selectedPlots.reduce((s, p) => s + p.area, 0);

  return (
    <div className="space-y-4">
      {/* Search + Season */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-medium"
              placeholder="搜索作物、品种、地块..." />
          </div>
          <button onClick={() => setShowFilterDrawer(true)} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 active:scale-95"><Filter size={18} /></button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 shrink-0">
            {['2026', '2025', '2024'].map(s => (
              <button key={s} onClick={() => setSeason(s)}
                className={cn("px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap", season === s ? "bg-blue-700 text-white shadow" : "text-slate-500")}>{s}种植季</button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-700 rounded-2xl p-4 text-white">
          <p className="text-[10px] font-bold opacity-60 mb-1">预估总产量</p>
          <div className="flex items-baseline gap-1"><span className="text-[22px] font-black">{(totalYield / 10000).toFixed(1)}</span><span className="text-[11px] opacity-60">万斤</span></div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 text-white">
          <p className="text-[10px] font-bold opacity-60 mb-1">核算总面积</p>
          <div className="flex items-baseline gap-1"><span className="text-[22px] font-black">{(totalArea / 10000).toFixed(1)}</span><span className="text-[11px] opacity-60">万亩</span></div>
        </div>
      </div>

      {/* List */}
      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-5 pb-24">
          <span className="text-[11px] font-bold text-slate-400 px-1">共 {filtered.length} 条</span>
          {Object.entries(grouped).map(([crop, records]) => (
            <div key={crop} className="space-y-1">
              <div className="flex items-center gap-2 px-1 py-1">
                <div className="w-1 h-3.5 bg-blue-700 rounded-full" />
                <h4 className="text-[13px] font-bold text-slate-700">{crop}</h4>
                <span className="text-[10px] text-slate-400">{records.length}</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                {records.map((r, idx) => (
                  <button key={r.id} onClick={() => setDetailRecord(r)}
                    className={cn("w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-slate-50", idx < records.length - 1 && "border-b border-slate-50")}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-black rounded">{r.variety}</span>
                        <span className="text-[10px] text-slate-400">{r.plotName}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {r.org} · {r.area.toLocaleString()}亩 · 预估 {r.estimatedYield.toLocaleString()}斤 · {r.unitYield}斤/亩
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
        <div className="text-center py-20 text-slate-400 text-[13px] font-bold">暂无{season}种植季产量数据</div>
      )}

      {/* FAB */}
      <div className="fixed bottom-28 right-6 z-40">
        <button onClick={() => { setForm({ date: new Date().toISOString().split('T')[0], totalYield: '', crop: '玉米', variety: '郑单958' }); setShowForm(true); }} className="w-16 h-16 bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-200 active:scale-90 transition-transform"><Plus size={28} /></button>
      </div>

      {/* Detail Bottom Sheet */}
      <AnimatePresence>
        {detailRecord && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailRecord(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="relative w-full max-w-xl bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[75vh]">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3" />
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
                <h3 className="text-[16px] font-bold text-slate-800">产量详情</h3>
                <button onClick={() => setDetailRecord(null)} className="p-1 text-slate-400"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '作物', val: detailRecord.crop },
                    { label: '品种', val: detailRecord.variety },
                    { label: '组织', val: detailRecord.org },
                    { label: '地块', val: detailRecord.plotName },
                    { label: '种植面积', val: `${detailRecord.area.toLocaleString()}亩` },
                    { label: '亩产', val: `${detailRecord.unitYield}斤/亩` },
                  ].map(f => (
                    <div key={f.label} className="space-y-0.5"><span className="text-[10px] font-bold text-slate-400">{f.label}</span><p className="text-[13px] font-bold text-slate-800">{f.val}</p></div>
                  ))}
                </div>
                <div className="bg-blue-50 rounded-2xl p-5 text-center">
                  <span className="text-[10px] font-bold text-blue-500 uppercase">预估产量</span>
                  <div className="text-[32px] font-black text-blue-700 mt-1">{detailRecord.estimatedYield.toLocaleString()}<span className="text-[14px] font-bold text-blue-400 ml-1">斤</span></div>
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
                <div><h3 className="text-[18px] font-bold text-slate-800">产量上报</h3></div>
                <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 active:bg-slate-50 rounded-full"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 进场日期 */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-600 block"><span className="text-rose-500 mr-1">*</span>进场日期</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10" />
                </div>

                {/* 总进场产量 */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-600 block"><span className="text-rose-500 mr-1">*</span>总进场产量（吨）</label>
                  <input type="number" value={form.totalYield} onChange={e => setForm(p => ({ ...p, totalYield: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/10" placeholder="请输入总产量" />
                </div>

                {/* 作物 */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-600 block"><span className="text-rose-500 mr-1">*</span>作物</label>
                  <div className="relative">
                    <button onClick={() => setShowCropPick(!showCropPick)} className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold">{form.crop}<ChevronDown size={14} className="opacity-40" /></button>
                    {showCropPick && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-lg z-10 overflow-hidden">
                        {CROP_OPTIONS.map(c => (
                          <button key={c} onClick={() => { setForm(p => ({ ...p, crop: c, variety: VARIETY_OPTIONS[c]?.[0] || '' })); setShowCropPick(false); }}
                            className={cn("w-full text-left px-4 py-3.5 text-[14px] font-bold active:bg-slate-50", form.crop === c ? "text-blue-700 bg-blue-50/50" : "text-slate-700")}>{c}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 品种 */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-600 block"><span className="text-rose-500 mr-1">*</span>品种</label>
                  <div className="relative">
                    <button onClick={() => setShowVarPick(!showVarPick)} className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold">{form.variety}<ChevronDown size={14} className="opacity-40" /></button>
                    {showVarPick && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-lg z-10 overflow-hidden">
                        {(VARIETY_OPTIONS[form.crop] || []).map(v => (
                          <button key={v} onClick={() => { setForm(p => ({ ...p, variety: v })); setShowVarPick(false); }}
                            className={cn("w-full text-left px-4 py-3.5 text-[14px] font-bold active:bg-slate-50", form.variety === v ? "text-blue-700 bg-blue-50/50" : "text-slate-700")}>{v}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 品种亩产（回显） */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-600 block">品种亩产（斤/亩）</label>
                  <div className="w-full px-4 py-3.5 bg-blue-50/30 border border-blue-100 rounded-2xl text-[14px] font-bold text-blue-700 font-mono">{unitYield} 斤/亩</div>
                </div>

                {/* 组织 */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-600 block"><span className="text-rose-500 mr-1">*</span>组织</label>
                  <div className="flex gap-2">
                    {ORG_OPTIONS.map(o => (
                      <button key={o} onClick={() => setFormOrg(o)}
                        className={cn("flex-1 py-3 rounded-2xl text-[13px] font-bold border transition-colors", formOrg === o ? "bg-blue-700 text-white border-blue-700" : "bg-slate-50 text-slate-500 border-slate-100")}>{o}</button>
                    ))}
                  </div>
                </div>

                {/* 选择地块 */}
                <div className="pt-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="w-1 h-4 bg-blue-700 rounded-full" /><h4 className="text-[14px] font-bold text-slate-800">选择地块</h4></div>
                    <button onClick={() => setShowPlotPicker(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white text-[11px] font-bold rounded-full shadow-lg shadow-blue-100 active:scale-95"><Plus size={14} /> 选择地块</button>
                  </div>
                  {selectedPlots.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPlots.map(plot => (
                        <div key={plot.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                          <div className="flex-1 min-w-0"><p className="text-[13px] font-bold text-slate-800 truncate">{plot.name}</p><p className="text-[10px] text-slate-400">{plot.crop || '—'} · {plot.area.toFixed(1)}亩</p></div>
                          <button onClick={() => setSelectedPlotIds(prev => { const n = new Set(prev); n.delete(plot.id); return n; })} className="text-[10px] font-bold text-rose-500 ml-3">移除</button>
                        </div>
                      ))}
                      <p className="text-right text-[11px] font-bold text-slate-500">共 {selectedPlots.length} 块 · 合计 {plotTotalArea.toFixed(1)} 亩</p>
                    </div>
                  ) : (
                    <div className="py-10 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300"><Plus size={24} className="mb-1" /><p className="text-[11px] font-bold">点击上方选择地块</p></div>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <button onClick={() => setShowForm(false)} className="w-full py-4 bg-blue-700 text-white rounded-2xl text-[15px] font-bold shadow-xl shadow-blue-200 active:scale-[0.98]">保存填报记录</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Plot Picker */}
      <AnimatePresence>
        {showPlotPicker && (
          <div className="fixed inset-0 z-[70] flex flex-col bg-white">
            <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowPlotPicker(false)} className="p-1 active:bg-slate-50 rounded-lg"><X size={24} className="text-slate-400" /></button>
                <div><h3 className="text-[16px] font-bold text-slate-800">选择上报地块</h3><span className="text-[10px] font-bold text-slate-300">{formOrg}</span></div>
              </div>
              <button onClick={() => setShowPlotPicker(false)} className="px-6 py-2 bg-blue-700 text-white rounded-full text-xs font-bold">完成 ({selectedPlotIds.size})</button>
            </header>
            <div className="flex-1 relative bg-slate-100 overflow-hidden">
              <div className="absolute inset-0 bg-[#e5e7eb] flex items-center justify-center">
                <div className="w-full h-full relative opacity-50 overflow-hidden">
                  <div className="absolute left-[20%] top-[30%] w-32 h-24 bg-white/40 border border-white/60 skew-x-12 rotate-12" />
                  <div className="absolute left-[40%] top-[20%] w-48 h-32 bg-blue-500/10 border-2 border-blue-500/20 rounded-full" />
                  <div className="absolute left-[10%] top-[60%] w-40 h-40 bg-blue-500/10 border-2 border-blue-500/20" />
                </div>
                <div className="absolute flex flex-col items-center gap-2"><MapIcon size={48} className="text-slate-300 animate-pulse" /><p className="text-[10px] font-bold text-slate-400">Map Layer Loading...</p></div>
              </div>
              <div className="absolute inset-0 p-10">
                {mockMapPlots.filter(p => p.farm === formOrg).map((plot, idx) => {
                  const isSelected = selectedPlotIds.has(plot.id);
                  return (
                    <button key={plot.id} onClick={() => { setSelectedPlotIds(prev => { const n = new Set(prev); if (n.has(plot.id)) n.delete(plot.id); else n.add(plot.id); return n; }); }}
                      style={{ left: `${20 + (idx % 4) * 18}%`, top: `${25 + Math.floor(idx / 4) * 22}%` }}
                      className={cn("absolute p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 shadow-lg active:scale-95", isSelected ? "bg-blue-700 border-white text-white scale-110" : "bg-white border-blue-500/20 text-slate-600")}>
                      <MapIcon size={20} className={isSelected ? "text-white" : "text-blue-500"} />
                      <span className="text-[10px] font-bold whitespace-nowrap">{plot.name.length > 8 ? plot.name.slice(0,8)+'…' : plot.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="absolute bottom-40 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/80 backdrop-blur rounded-full text-white text-[10px] font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400" />{formOrg}</div>
              <div className="absolute bottom-0 left-0 right-0 max-h-[45%] bg-white rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col">
                <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto my-3" />
                <div className="px-6 flex items-center justify-between">
                  <div><h4 className="text-[14px] font-bold text-slate-800">全部地块列表</h4><span className="text-[10px] text-slate-400 font-bold">范围：{formOrg}</span></div>
                  <span className="text-[10px] bg-slate-50 px-3 py-1 rounded-full text-slate-400 font-bold">共 {mockMapPlots.filter(p => p.farm === formOrg).length} 个</span>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 pb-8">
                  {mockMapPlots.filter(p => p.farm === formOrg).map(plot => {
                    const isSelected = selectedPlotIds.has(plot.id);
                    return (
                      <div key={plot.id} onClick={() => { setSelectedPlotIds(prev => { const n = new Set(prev); if (n.has(plot.id)) n.delete(plot.id); else n.add(plot.id); return n; }); }}
                        className={cn("flex items-center justify-between p-4 rounded-2xl border cursor-pointer", isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-slate-50 hover:border-slate-100")}>
                        <div className="space-y-0.5"><h5 className={cn("text-[13px] font-bold", isSelected ? "text-blue-700" : "text-slate-800")}>{plot.name}</h5><p className="text-[10px] text-slate-400 font-bold">{formOrg}</p></div>
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
              <div className="p-6 border-b border-slate-100 flex items-center justify-between"><h3 className="text-[16px] font-bold text-slate-800">条件筛选</h3><button onClick={() => setShowFilterDrawer(false)} className="p-2 text-slate-400"><X size={20} /></button></div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">选择作物</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['全部', '玉米', '小麦', '大豆', '高粱'].map(c => (
                      <button key={c} onClick={() => setCropFilter(c)} className={cn("py-3 px-4 rounded-xl text-xs font-bold border transition-colors", cropFilter === c ? "bg-blue-700 text-white border-blue-700" : "bg-slate-50 border-slate-100 text-slate-600")}>{c}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">组织机构</label>
                  <div className="space-y-2">
                    {(user.orgFilter ? [user.orgFilter] : ['全部农场', ...ORG_OPTIONS]).map(o => (
                      <button key={o} onClick={() => setOrgFilter(o)} className={cn("w-full text-left p-3 rounded-xl border text-xs font-bold transition-colors", orgFilter === o ? "bg-blue-700 text-white border-blue-700" : "bg-slate-50 border-slate-100 text-slate-600")}>{o}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 gap-3">
                <button onClick={() => { setCropFilter('全部'); setOrgFilter('全部农场'); }} className="py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold">重置</button>
                <button onClick={() => setShowFilterDrawer(false)} className="py-3 bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100">确定</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
