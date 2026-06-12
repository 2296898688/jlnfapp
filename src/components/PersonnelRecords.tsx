import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, ChevronLeft, X, User, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

interface StaffRecord {
  id: string;
  name: string;
  gender: string;
  age: number;
  role: string;
  org: string;
  post: string;
  phone: string;
  lastLogin: string;
  operations: { type: string; item: string; date: string; plots: number; area: number; crop: string }[];
}

const MOCK_STAFF: StaffRecord[] = [
  { id: 's1', name: '王总', gender: '男', age: 42, role: '管理员', org: '白城牧场', post: '场长', phone: '138****0001', lastLogin: '2026-06-12',
    operations: [{ type: '田间管理', item: '打药', date: '2026-06-10', plots: 4, area: 186, crop: '玉米' },{ type: '播种', item: '精量播种', date: '2026-05-02', plots: 6, area: 320, crop: '大豆' }] },
  { id: 's2', name: '饼饼', gender: '男', age: 35, role: '技术员', org: '镇南种羊场', post: '农艺师', phone: '139****0002', lastLogin: '2026-06-11',
    operations: [{ type: '施肥', item: '追肥', date: '2026-06-08', plots: 3, area: 145, crop: '小麦' },{ type: '植保', item: '除草剂', date: '2026-05-22', plots: 5, area: 210, crop: '玉米' }] },
  { id: 's3', name: '老李', gender: '男', age: 50, role: '操作员', org: '长岭种马场', post: '作业队长', phone: '136****0003', lastLogin: '2026-06-09',
    operations: [{ type: '播种', item: '平播', date: '2026-05-10', plots: 2, area: 88, crop: '高粱' },{ type: '收获', item: '机械收割', date: '2025-10-15', plots: 5, area: 265, crop: '玉米' }] },
  { id: 's4', name: '李大壮', gender: '男', age: 38, role: '操作员', org: '白城牧场', post: '机械手', phone: '135****0004', lastLogin: '2026-06-10',
    operations: [{ type: '田间管理', item: '除草', date: '2026-05-20', plots: 3, area: 132, crop: '玉米' }] },
  { id: 's5', name: '周技术员', gender: '男', age: 31, role: '技术员', org: '镇南种羊场', post: '植保员', phone: '137****0005', lastLogin: '2026-06-08',
    operations: [{ type: '植保', item: '杀虫剂', date: '2026-06-05', plots: 2, area: 76, crop: '大豆' },{ type: '施肥', item: '基肥', date: '2026-04-28', plots: 3, area: 156, crop: '小麦' }] },
  { id: 's6', name: '赵丽', gender: '女', age: 29, role: '管理员', org: '长岭种马场', post: '调度员', phone: '134****0006', lastLogin: '2026-06-12',
    operations: [{ type: '收获', item: '机械收割', date: '2025-07-25', plots: 4, area: 178, crop: '小麦' }] },
];

export function PersonnelRecords() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null);
  const [search, setSearch] = useState('');

  const filtered = MOCK_STAFF.filter(s => s.name.includes(search) || s.role.includes(search) || s.org.includes(search));

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-medium"
                placeholder="搜索姓名、角色、组织..." />
            </div>

            <div className="space-y-5 pb-24">
              <span className="text-[11px] font-bold text-slate-400 px-1">共 {filtered.length} 人</span>
              {filtered.map(staff => (
                <button key={staff.id} onClick={() => { setSelectedStaff(staff); setView('detail'); }}
                  className="w-full bg-white rounded-2xl border border-slate-100 overflow-hidden text-left">
                  <div className="flex items-center gap-4 px-4 py-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <User size={22} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-[14px] font-bold text-slate-800">{staff.name}</h4>
                        <span className="text-[10px] text-slate-400">{staff.gender} · {staff.age}岁</span>
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold rounded ml-auto">{staff.role}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">{staff.org} · {staff.post}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'detail' && selectedStaff && (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 font-bold text-[13px]">
              <ChevronLeft size={18} /> 返回人员列表
            </button>

            {/* Profile card */}
            <div className="bg-slate-800 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center"><User size={28} /></div>
                <div>
                  <h3 className="text-[18px] font-bold">{selectedStaff.name}</h3>
                  <p className="text-[12px] text-white/50">{selectedStaff.gender} · {selectedStaff.age}岁 · {selectedStaff.role}</p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-white/10">
                {[
                  { label: '组织', val: selectedStaff.org },
                  { label: '岗位', val: selectedStaff.post },
                  { label: '电话', val: selectedStaff.phone },
                  { label: '最后活跃', val: selectedStaff.lastLogin },
                ].map(f => (
                  <div key={f.label} className="flex justify-between text-[12px]">
                    <span className="text-white/40">{f.label}</span><span className="font-bold">{f.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operations */}
            <div className="space-y-2">
              <h4 className="text-[13px] font-bold text-slate-700 px-1">作业记录</h4>
              {selectedStaff.operations.map((op, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold rounded">{op.type}</span>
                    <span className="text-[10px] text-slate-400">{op.item}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
                    <span>{op.date}</span><span>{op.plots}块</span><span>{op.area}亩</span><span>{op.crop}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
