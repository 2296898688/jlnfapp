/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUser } from '../App';
import { ROLE_TODOS } from '../mockData';
import type { TodoItem } from '../types';

const TYPE_LABEL: Record<string, string> = {
  TASK: '任务',
  APPROVAL: '审批',
  REPORT: '上报',
};

const TYPE_COLOR: Record<string, string> = {
  TASK: 'bg-blue-50 text-blue-600 border-blue-100',
  APPROVAL: 'bg-amber-50 text-amber-600 border-amber-100',
  REPORT: 'bg-purple-50 text-purple-600 border-purple-100',
};

export default function Alerts() {
  const navigate = useNavigate();
  const { user } = useUser();
  const todos = ROLE_TODOS[user.role] || ROLE_TODOS.FARM_ADMIN;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pending = todos.filter((t) => t.status === 'PENDING');
  const completed = todos.filter((t) => t.status === 'COMPLETED');

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 flex items-center gap-3 px-6 py-4 sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="p-1 active:bg-slate-50 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-400" />
        </button>
        <div>
          <h1 className="text-[17px] font-bold text-slate-800">待办告警</h1>
          <p className="text-[10px] text-slate-400 font-medium">
            {pending.length} 条待处理 · {completed.length} 条已完成
          </p>
        </div>
      </header>

      <div className="p-4 space-y-5">
        {/* 待处理 */}
        {pending.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Clock size={14} className="text-amber-500" />
              <h2 className="text-[13px] font-bold text-slate-700">待处理</h2>
              <span className="text-[11px] text-slate-400 font-medium ml-auto">{pending.length} 项</span>
            </div>
            <div className="space-y-2">
              {pending.map((item) => (
                <AlertCard
                  key={item.id}
                  item={item}
                  expanded={expandedId === item.id}
                  onToggle={() =>
                    setExpandedId(expandedId === item.id ? null : item.id)
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* 已完成 */}
        {completed.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <h2 className="text-[13px] font-bold text-slate-700">已完成</h2>
              <span className="text-[11px] text-slate-400 font-medium ml-auto">{completed.length} 项</span>
            </div>
            <div className="space-y-2">
              {completed.map((item) => (
                <AlertCard
                  key={item.id}
                  item={item}
                  expanded={expandedId === item.id}
                  onToggle={() =>
                    setExpandedId(expandedId === item.id ? null : item.id)
                  }
                />
              ))}
            </div>
          </section>
        )}

        {todos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <CheckCircle2 size={48} className="mb-3 opacity-30" />
            <p className="text-[14px] font-bold">暂无待办事项</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertCard({
  item,
  expanded,
  onToggle,
}: {
  item: TodoItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isDone = item.status === 'COMPLETED';

  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full bg-white rounded-2xl border shadow-sm transition-all active:scale-[0.99] text-left',
        isDone ? 'opacity-60 border-slate-100' : 'border-slate-100',
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'p-2 rounded-xl shrink-0 mt-0.5',
              isDone ? 'bg-emerald-50' : 'bg-amber-50',
            )}
          >
            {isDone ? (
              <CheckCircle2 size={16} className="text-emerald-500" />
            ) : (
              <AlertTriangle size={16} className="text-amber-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  'text-[9px] font-black px-1.5 py-0.5 rounded border',
                  TYPE_COLOR[item.type] || TYPE_COLOR.TASK,
                )}
              >
                {TYPE_LABEL[item.type] || item.type}
              </span>
              {isDone && (
                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">
                  已完成
                </span>
              )}
            </div>
            <p className="text-[13px] font-bold text-slate-800 leading-snug">
              {item.title}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1.5">
              {item.createTime}
            </p>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            className="text-slate-300 shrink-0"
          >
            <ChevronDown size={16} />
          </motion.div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">告警编号</span>
                  <span className="text-slate-600 font-bold">{item.id}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">类型</span>
                  <span className="text-slate-600 font-bold">
                    {TYPE_LABEL[item.type] || item.type}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">状态</span>
                  <span
                    className={cn(
                      'font-bold',
                      isDone ? 'text-emerald-600' : 'text-amber-600',
                    )}
                  >
                    {isDone ? '已完成' : '待处理'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">创建时间</span>
                  <span className="text-slate-600 font-bold">
                    {item.createTime}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}
