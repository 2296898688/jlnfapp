import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, Calendar, ChevronDown, X, ChevronRight, ArrowRight, ChevronLeft, Package, ClipboardCheck, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUser } from '../App';
import { mockRecipes, mockPlanting } from '../mockData';

const ORG_OPTIONS = ['白城牧场', '镇南种羊场', '长岭种马场'];
const TYPE_OPTIONS = ['田间管理', '播种', '施肥', '植保', '收获'];

interface InputRecord {
  id: string;
  season: string;
  type: string;
  project: string;
  crop: string;
  variety: string;
  org: string;
  date: string;
  recipe: string;
  materialCount: number;
  totalCost: number;
  plotCount: number;
  operator: string;
}

const MOCK_RECORDS: InputRecord[] = [
  { id: 'in1', season: '2026', type: '田间管理', project: '打药', crop: '玉米', variety: '郑单958', org: '白城牧场', date: '2026-06-15', recipe: '玉米苗期控旺配方', materialCount: 2, totalCost: 2850, plotCount: 4, operator: '王总' },
  { id: 'in2', season: '2026', type: '施肥', project: '追肥', crop: '小麦', variety: '蒙麦20', org: '镇南种羊场', date: '2026-06-10', recipe: '小麦一喷三防配方', materialCount: 3, totalCost: 4200, plotCount: 6, operator: '饼饼' },
  { id: 'in3', season: '2026', type: '播种', project: '精量播种', crop: '大豆', variety: '中黄13', org: '长岭种马场', date: '2026-05-05', recipe: '玉米苗期控旺配方', materialCount: 2, totalCost: 1800, plotCount: 3, operator: '老李' },
  { id: 'in4', season: '2026', type: '植保', project: '除草剂', crop: '玉米', variety: '先育335', org: '白城牧场', date: '2026-05-22', recipe: '小麦一喷三防配方', materialCount: 3, totalCost: 3600, plotCount: 5, operator: '王总' },
  { id: 'in5', season: '2025', type: '施肥', project: '基肥', crop: '大豆', variety: '黑河43', org: '镇南种羊场', date: '2025-04-30', recipe: '玉米苗期控旺配方', materialCount: 2, totalCost: 5200, plotCount: 4, operator: '饼饼' },
  { id: 'in6', season: '2025', type: '田间管理', project: '灌水', crop: '小麦', variety: '京麦31', org: '长岭种马场', date: '2025-06-20', recipe: '小麦一喷三防配方', materialCount: 3, totalCost: 1500, plotCount: 2, operator: '老李' },
  { id: 'in7', season: '2024', type: '收获', project: '机械收割', crop: '玉米', variety: '京科968', org: '白城牧场', date: '2024-10-15', recipe: '玉米苗期控旺配方', materialCount: 2, totalCost: 3000, plotCount: 5, operator: '王总' },
];

export function InputMaterialRecording() {
  const { user } = useUser();
  const [season, setSeason] = useState('2026');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [orgFilter, setOrgFilter] = useState('全部农场');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [detailRecord, setDetailRecord] = useState<InputRecord | null>(null);

  const [formStep, setFormStep] = useState(1);
  const [form, setForm] = useState({
    operation: null as any,
    recipe: null as any,
    date: new Date().toISOString().split('T')[0],
  });
  const calculateResults = () => {
    if (!form.recipe) return { totalCost: 0, materialDetails: [] };
    const area = form.operation ? form.operation.area : 1;
    const details = form.recipe.materials.map((m: any) => {
      const dosageVal = parseFloat(m.dosage.match(/[\d.]+/)?.[0] || '0');
      const unit = m.dosage.replace(/[\d. ]/g, '').replace('/', '');
      const cost = dosageVal * parseFloat(m.unitPrice) * area;
      const amount = dosageVal * area;
      return { name: m.name, amount: amount.toFixed(2), unit, cost: cost.toFixed(2) };
    });
    const total = details.reduce((sum: number, d: any) => sum + parseFloat(d.cost), 0);
    return { totalCost: total, materialDetails: details, areaUsed: area };
  };

  const filtered = MOCK_RECORDS.filter(r => {
    if (user.orgFilter && r.org !== user.orgFilter) return false;
    if (r.season !== season) return false;
    if (typeFilter !== '全部' && r.type !== typeFilter) return false;
    if (orgFilter !== '全部农场' && r.org !== orgFilter) return false;
    if (dateFrom && r.date < dateFrom) return false;
    if (dateTo && r.date > dateTo) return false;
    if (search && !r.crop.includes(search) && !r.project.includes(search) && !r.recipe.includes(search)) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, r) => {
    const k = r.type;
    if (!acc[k]) acc[k] = [];
    acc[k].push(r);
    return acc;
  }, {} as Record<string, InputRecord[]>);

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-medium"
              placeholder="搜索作物、项目、配方..." />
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
                  <button key={r.id} onClick={() => setDetailRecord(r)}
                    className={cn("w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-slate-50", idx < records.length - 1 && "border-b border-slate-50")}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black rounded">{r.project}</span>
                        <span className="text-[10px] text-slate-400">{r.recipe}</span>
                      </div>
                      <p className="text-[13px] font-bold text-slate-800 truncate">{r.crop} · {r.variety}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{r.plotCount}块 · {r.materialCount}种物料 · ¥{r.totalCost.toLocaleString()} · {r.org} · {r.operator} · {r.date}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400 text-[13px] font-bold">暂无{season}种植季投入记录</div>
      )}

      {/* FAB */}
      <div className="fixed bottom-28 right-6 z-40">
        <button onClick={() => { setForm({ operation: null, recipe: null, date: new Date().toISOString().split('T')[0] }); setFormStep(1); setShowForm(true); }} className="w-16 h-16 bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-200 active:scale-90 transition-transform"><Plus size={32} /></button>
      </div>

      {/* Detail Bottom Sheet */}
      <AnimatePresence>
        {detailRecord && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailRecord(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="relative w-full max-w-xl bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[75vh]">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3" />
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
                <h3 className="text-[16px] font-bold text-slate-800">投入详情</h3>
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
                    { label: '填报人', val: detailRecord.operator },
                    { label: '涉及地块', val: `${detailRecord.plotCount}块` },
                    { label: '日期', val: detailRecord.date },
                  ].map(f => (
                    <div key={f.label} className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400">{f.label}</span>
                      <p className="text-[13px] font-bold text-slate-800">{f.val}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-400">使用配方</span>
                  <p className="text-[13px] font-bold text-slate-800 mt-1">{detailRecord.recipe}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-[13px] font-bold text-slate-700">{detailRecord.materialCount} 种物料</span>
                  <span className="text-[16px] font-mono font-bold text-blue-700">¥{detailRecord.totalCost.toLocaleString()}</span>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100">
                <button onClick={() => setDetailRecord(null)} className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl text-[12px] font-bold">关闭</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Form — Step-based Wizard */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-xl bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-auto max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-[18px] font-bold text-slate-800">
                    {formStep === 3 ? '选择作业' : formStep === 4 ? '选择配方' : '确认投入信息'}
                  </h3>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 active:bg-slate-50 rounded-full"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {formStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                      {/* Result Card */}
                      {form.operation && form.recipe ? (
                        <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-10"><ClipboardCheck size={120} /></div>
                          <div className="relative z-10 space-y-6">
                            <div className="space-y-1">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />投入核算已完成
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-[40px] font-mono font-bold leading-none">¥{calculateResults().totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-[13px] font-bold">
                              <div className="flex items-center gap-2 text-slate-400 font-medium"><Package size={14} /> {calculateResults().materialDetails.length} 种物料</div>
                              <div className="flex items-center gap-2 text-slate-400 font-medium justify-end"><ArrowRight size={14} /> {calculateResults().areaUsed} 亩</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 bg-slate-50 border border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-slate-400 space-y-3">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-300"><Package size={24} /></div>
                          <p className="text-[12px] font-bold">请选择对应作业及配方进行自动核算</p>
                        </div>
                      )}

                      {/* Step 1: Select Operation */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-300 uppercase tracking-widest pl-1">第一步：选择填报作业</label>
                        {form.operation ? (
                          <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-[28px] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white"><Zap size={20} /></div>
                              <div><span className="text-[14px] font-bold text-blue-900">{form.operation.unitName}</span><br /><span className="text-[11px] font-bold text-blue-400">{form.operation.crop} - {form.operation.area}亩</span></div>
                            </div>
                            <button onClick={() => setForm({ ...form, operation: null })} className="w-8 h-8 flex items-center justify-center bg-white border border-blue-100 rounded-full text-blue-400 hover:text-rose-500"><X size={16} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setFormStep(3)} className="w-full p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500"><Zap size={20} /></div>
                              <div className="text-left"><span className="text-[14px] font-bold text-slate-800">关联已填报作业</span><br /><span className="text-[11px] text-slate-400">从历次作业记录中选择一项</span></div>
                            </div>
                            <ArrowRight size={18} className="text-slate-300" />
                          </button>
                        )}
                      </div>

                      {/* Step 2: Select Recipe */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-300 uppercase tracking-widest pl-1">第二步：选择农艺配方</label>
                        {form.recipe ? (
                          <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-[28px] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white"><ClipboardCheck size={20} /></div>
                              <div><span className="text-[14px] font-bold text-blue-900">{form.recipe.name}</span><br /><span className="text-[11px] font-bold text-blue-400">{form.recipe.materials.length} 种投入物料</span></div>
                            </div>
                            <button onClick={() => setForm({ ...form, recipe: null })} className="w-8 h-8 flex items-center justify-center bg-white border border-blue-100 rounded-full text-blue-400 hover:text-rose-500"><X size={16} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setFormStep(4)} className="w-full p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500"><ClipboardCheck size={20} /></div>
                              <div className="text-left"><span className="text-[14px] font-bold text-slate-800">采用科学配方</span><br /><span className="text-[11px] text-slate-400">使用预置的投入品核算公式</span></div>
                            </div>
                            <ArrowRight size={18} className="text-slate-300" />
                          </button>
                        )}
                      </div>

                      {/* Calculation detail */}
                      {form.recipe && (
                        <div className="pt-4 space-y-4">
                          <label className="text-[11px] font-black text-slate-300 uppercase tracking-widest pl-1">核算明细</label>
                          <div className="space-y-3">
                            {calculateResults().materialDetails.map((m: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                <div><span className="text-[13px] font-bold text-slate-700">{m.name}</span><br /><span className="text-[10px] text-slate-400">用量: {m.amount}{m.unit}</span></div>
                                <div className="text-right"><span className="text-[14px] font-mono font-bold text-slate-800">¥{m.cost}</span><br /><span className="text-[9px] text-slate-400">预估小计</span></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 space-y-2">
                        <label className="text-[11px] font-black text-slate-300 uppercase tracking-widest pl-1">填报日期</label>
                        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold text-slate-800">
                          <span>{form.date}</span><Calendar size={14} className="text-slate-300" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {formStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setFormStep(1)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><ChevronLeft size={20} /></button>
                        <div><h4 className="text-[16px] font-bold text-slate-800">关联填报作业</h4></div>
                      </div>
                      <div className="space-y-3">
                        {mockPlanting.map((op: any) => (
                          <button key={op.id} onClick={() => { setForm(p => ({ ...p, operation: op })); setFormStep(1); }}
                            className="w-full p-5 bg-white border border-slate-100 rounded-[28px] text-left hover:border-blue-200 active:scale-[0.98] transition-all shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[14px] font-bold text-slate-800">{op.unitName}</span>
                              <span className="px-2 py-1 bg-slate-50 text-[9px] font-bold text-slate-400 rounded-lg">{op.startTime}</span>
                            </div>
                            <div className="flex items-center gap-4 text-[12px] text-slate-500 font-medium">
                              <span>{op.crop}作业</span><span>{op.area}亩</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {formStep === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setFormStep(1)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><ChevronLeft size={20} /></button>
                        <div><h4 className="text-[16px] font-bold text-slate-800">采用农艺配方</h4></div>
                      </div>
                      <div className="space-y-3">
                        {mockRecipes.map((recipe: any) => (
                          <button key={recipe.id} onClick={() => { setForm(p => ({ ...p, recipe })); setFormStep(1); }}
                            className="w-full p-5 bg-white border border-slate-100 rounded-[28px] text-left hover:border-blue-200 active:scale-[0.98] transition-all shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1.5 h-4 bg-blue-700 rounded-full" />
                              <span className="text-[14px] font-bold text-slate-800">{recipe.name}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-3">{recipe.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {recipe.materials.map((m: any, i: number) => (
                                <span key={i} className="px-2 py-1 bg-blue-50 text-[10px] font-bold text-blue-600 rounded-lg">{m.name}</span>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <button
                  disabled={!form.operation || !form.recipe}
                  onClick={() => setShowForm(false)}
                  className={cn("w-full py-4 rounded-2xl text-[15px] font-bold shadow-xl transition-all active:scale-[0.98]", (!form.operation || !form.recipe) ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-blue-700 text-white shadow-blue-200")}>
                  保存填报记录
                </button>
              </div>
            </motion.div>
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
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10" />
                    <span className="text-slate-300 text-xs">—</span>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">作业类型</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['全部', ...TYPE_OPTIONS].map(v => (
                      <button key={v} onClick={() => setTypeFilter(v)} className={cn("py-3 px-4 rounded-xl text-xs font-bold border transition-colors", typeFilter === v ? "bg-blue-700 text-white border-blue-700" : "bg-slate-50 border-slate-100 text-slate-600")}>{v}</button>
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
                <button onClick={() => { setTypeFilter('全部'); setOrgFilter('全部农场'); setDateFrom(''); setDateTo(''); }} className="py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold">重置</button>
                <button onClick={() => setShowFilterDrawer(false)} className="py-3 bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100">确定</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
