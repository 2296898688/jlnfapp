import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, X, ChevronRight, Edit2 } from 'lucide-react';
import { useUser } from '../UserContext';
import { cn } from '../lib/utils';

const ORG_OPTIONS = ['白城牧场', '镇南种羊场', '长岭种马场'];

interface EstimateRecord {
  id: string;
  season: string;
  crop: string;
  variety: string;
  org: string;
  plotName: string;
  area: number;
  estimatedYield: number;
  unitYield: number;
}

const INITIAL_DATA: EstimateRecord[] = [
  { id: 'e1', season: '2026', crop: '玉米', variety: '郑单958', org: '白城牧场', plotName: '二队3号地', area: 12425, estimatedYield: 14910000, unitYield: 1200 },
  { id: 'e2', season: '2026', crop: '玉米', variety: '先育335', org: '白城牧场', plotName: '渠东高标地块三', area: 5200, estimatedYield: 6760000, unitYield: 1300 },
  { id: 'e3', season: '2026', crop: '玉米', variety: '京科968', org: '镇南种羊场', plotName: '镇南-东岗6号地', area: 3800, estimatedYield: 4180000, unitYield: 1100 },
  { id: 'e4', season: '2026', crop: '小麦', variety: '蒙麦20', org: '长岭种马场', plotName: '长岭-东大甸子', area: 6700, estimatedYield: 4690000, unitYield: 700 },
  { id: 'e5', season: '2026', crop: '小麦', variety: '京麦31', org: '镇南种羊场', plotName: '镇南-苇塘西地', area: 4500, estimatedYield: 3375000, unitYield: 750 },
  { id: 'e6', season: '2026', crop: '大豆', variety: '中黄13', org: '白城牧场', plotName: '白城河西一号地', area: 7200, estimatedYield: 2520000, unitYield: 350 },
  { id: 'e7', season: '2026', crop: '大豆', variety: '黑河43', org: '长岭种马场', plotName: '长岭-南大甸子', area: 3100, estimatedYield: 992000, unitYield: 320 },
  { id: 'e8', season: '2026', crop: '高粱', variety: '吉杂127', org: '白城牧场', plotName: '白城-南岗4号地', area: 1500, estimatedYield: 1200000, unitYield: 800 },
  { id: 'e9', season: '2025', crop: '玉米', variety: '郑单958', org: '白城牧场', plotName: '二队3号地', area: 12425, estimatedYield: 13667500, unitYield: 1100 },
  { id: 'e10', season: '2025', crop: '小麦', variety: '宁春4号', org: '长岭种马场', plotName: '长岭-北甸子2号', area: 4500, estimatedYield: 3150000, unitYield: 700 },
  { id: 'e11', season: '2024', crop: '大豆', variety: '合丰55', org: '镇南种羊场', plotName: '镇南-东风3号地', area: 3100, estimatedYield: 1085000, unitYield: 350 },
  { id: 'e12', season: '2024', crop: '高粱', variety: '吉杂127', org: '白城牧场', plotName: '白城-新立屯地', area: 1500, estimatedYield: 1200000, unitYield: 800 },
];

export function YieldEstimation() {
  const { user } = useUser();
  const [data, setData] = useState(INITIAL_DATA);
  const [season, setSeason] = useState('2026');
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('全部');
  const [orgFilter, setOrgFilter] = useState('全部农场');
  const [showFilter, setShowFilter] = useState(false);
  const [detailRecord, setDetailRecord] = useState<EstimateRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<EstimateRecord | null>(null);
  const [editForm, setEditForm] = useState({ estimatedYield: '', unitYield: '' });

  const filtered = data.filter(r => {
    if (user.orgFilter && r.org !== user.orgFilter) return false;
    if (r.season !== season) return false;
    if (cropFilter !== '全部' && r.crop !== cropFilter) return false;
    if (orgFilter !== '全部农场' && r.org !== orgFilter) return false;
    if (search && !r.crop.includes(search) && !r.variety.includes(search) && !r.plotName.includes(search)) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, r) => {
    if (!acc[r.crop]) acc[r.crop] = [];
    acc[r.crop].push(r);
    return acc;
  }, {} as Record<string, EstimateRecord[]>);

  const totalArea = filtered.reduce((s, r) => s + r.area, 0);
  const totalYield = filtered.reduce((s, r) => s + r.estimatedYield, 0);

  const openEdit = (r: EstimateRecord) => {
    setEditingRecord(r);
    setEditForm({ estimatedYield: String(r.estimatedYield), unitYield: String(r.unitYield) });
  };

  const saveEdit = () => {
    if (!editingRecord) return;
    setData(prev => prev.map(r =>
      r.id === editingRecord.id ? { ...r, estimatedYield: Number(editForm.estimatedYield), unitYield: Number(editForm.unitYield) } : r
    ));
    setEditingRecord(null);
  };

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
          <button onClick={() => setShowFilter(true)} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 active:scale-95"><Filter size={18} /></button>
        </div>
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 w-fit">
          {['2026', '2025', '2024'].map(s => (
            <button key={s} onClick={() => setSeason(s)}
              className={cn("px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all", season === s ? "bg-blue-700 text-white shadow" : "text-slate-500")}>{s}种植季</button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: '预估总产', val: `${(totalYield/10000).toFixed(1)}万斤`, color: 'text-blue-700' },
          { label: '核算面积', val: `${(totalArea/10000).toFixed(1)}万亩`, color: 'text-slate-700' },
          { label: '涉及地块', val: `${filtered.length}块`, color: 'text-slate-700' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-3">
            <p className="text-[10px] text-slate-400 font-bold mb-0.5">{s.label}</p>
            <p className={cn("text-[16px] font-black", s.color)}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-5 pb-24">
          {Object.entries(grouped).map(([crop, records]) => {
            const cropYield = records.reduce((s, r) => s + r.estimatedYield, 0);
            const cropArea = records.reduce((s, r) => s + r.area, 0);
            return (
            <div key={crop} className="space-y-1">
              <div className="flex items-center gap-2 px-1 py-1">
                <div className="w-1 h-3.5 bg-blue-700 rounded-full" />
                <h4 className="text-[13px] font-bold text-slate-700">{crop}</h4>
                <span className="text-[10px] text-slate-400">{records.length}条</span>
                <span className="text-[10px] font-bold text-blue-700 ml-auto">{(cropYield / 10000).toFixed(1)}万斤</span>
                <span className="text-[10px] text-slate-400">亩均{Math.round(cropYield / cropArea)}斤</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                {records.map((r, idx) => (
                  <div key={r.id}
                    className={cn("flex items-center gap-3 px-4 py-3.5", idx < records.length - 1 && "border-b border-slate-50")}>
                    <button onClick={() => setDetailRecord(r)} className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-black rounded">{r.variety}</span>
                        <span className="text-[10px] text-slate-400">{r.plotName}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">{r.org} · {r.area.toLocaleString()}亩 · 预估 {r.estimatedYield.toLocaleString()}斤 · {r.unitYield}斤/亩</p>
                    </button>
                    <button onClick={() => openEdit(r)} className="p-1.5 text-slate-300 hover:text-blue-600 active:bg-slate-50 rounded-lg">
                      <Edit2 size={14} />
                    </button>
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          );})}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400 text-[13px] font-bold">暂无数据</div>
      )}

      {/* Detail Sheet */}
      <AnimatePresence>
        {detailRecord && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailRecord(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="relative w-full max-w-xl bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[70vh]">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3" />
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
                <h3 className="text-[16px] font-bold text-slate-800">预估详情</h3>
                <button onClick={() => setDetailRecord(null)} className="p-1 text-slate-400"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '作物', val: detailRecord.crop },{ label: '品种', val: detailRecord.variety },
                    { label: '组织', val: detailRecord.org },{ label: '地块', val: detailRecord.plotName },
                    { label: '面积', val: `${detailRecord.area.toLocaleString()}亩` },{ label: '亩产预估', val: `${detailRecord.unitYield}斤/亩` },
                  ].map(f => (
                    <div key={f.label} className="space-y-0.5"><span className="text-[10px] font-bold text-slate-400">{f.label}</span><p className="text-[13px] font-bold text-slate-800">{f.val}</p></div>
                  ))}
                </div>
                <div className="bg-blue-50 rounded-2xl p-5 text-center">
                  <span className="text-[10px] font-bold text-blue-500">预估产量</span>
                  <div className="text-[32px] font-black text-blue-700 mt-1">{detailRecord.estimatedYield.toLocaleString()}<span className="text-[14px] font-bold text-blue-400 ml-1">斤</span></div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100"><button onClick={() => setDetailRecord(null)} className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl text-[12px] font-bold">关闭</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingRecord && (
          <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingRecord(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-bold text-slate-800">编辑预估</h3>
                  <p className="text-[10px] text-slate-400 font-medium">{editingRecord.plotName} · {editingRecord.crop} {editingRecord.variety}</p>
                </div>
                <button onClick={() => setEditingRecord(null)} className="p-2 text-slate-400"><X size={22} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-600 block">预估产量（斤）</label>
                  <input type="number" value={editForm.estimatedYield} onChange={e => setEditForm(p => ({ ...p, estimatedYield: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-600 block">亩产预估（斤/亩）</label>
                  <input type="number" value={editForm.unitYield} onChange={e => setEditForm(p => ({ ...p, unitYield: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/10" />
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button onClick={() => setEditingRecord(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[14px] font-bold">取消</button>
                <button onClick={saveEdit} className="flex-1 py-3 bg-blue-700 text-white rounded-2xl text-[14px] font-bold shadow-lg shadow-blue-100 active:scale-[0.98]">保存</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter Drawer */}
      <AnimatePresence>
        {showFilter && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilter(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="relative w-80 bg-white h-full shadow-2xl flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between"><h3 className="text-[16px] font-bold text-slate-800">条件筛选</h3><button onClick={() => setShowFilter(false)} className="p-2 text-slate-400"><X size={20} /></button></div>
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
                <button onClick={() => setShowFilter(false)} className="py-3 bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100">确定</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
