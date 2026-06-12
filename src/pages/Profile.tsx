/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../App';
import { DEMO_USERS } from '../mockData';
import { User, FileText, Info, LogOut, ChevronRight, Building2, Warehouse, HardHat, Check, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';

const ROLE_META: Record<UserRole, { icon: typeof Building2; label: string; color: string }> = {
  GROUP_ADMIN: { icon: Building2, label: '集团管理员', color: 'indigo' },
  FARM_ADMIN: { icon: Warehouse, label: '农场管理员', color: 'emerald' },
  OPERATOR: { icon: HardHat, label: '一线操作员', color: 'amber' },
  NONGKEN_ADMIN: { icon: Building2, label: '农垦集团管理', color: 'teal' },
  LAND_COMPANY_ADMIN: { icon: Building2, label: '土地资源公司', color: 'sky' },
};

export default function Profile({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const { user, switchRole } = useUser();
  const [showSwitcher, setShowSwitcher] = useState(false);

  const roleMeta = ROLE_META[user.role];

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    onLogout();
  };

  const sections = [
    { icon: User, label: '个人信息', sub: '修改头像' },
    { icon: FileText, label: '服务协议', sub: '用户协议及隐私政策' },
    { icon: Info, label: '关于', sub: '版本信息、功能介绍' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-28 bg-slate-50">
      {/* Profile Header */}
      <div className={cn(
        "pt-20 pb-16 px-6 relative overflow-hidden",
        roleMeta.color === 'indigo' ? 'bg-indigo-900' : roleMeta.color === 'emerald' ? 'bg-slate-900' : roleMeta.color === 'teal' ? 'bg-teal-900' : roleMeta.color === 'sky' ? 'bg-sky-900' : 'bg-amber-900'
      )}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-24 h-24 rounded-[32px] border-4 border-white/10 shadow-2xl object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-[32px] border-4 border-white/10 shadow-2xl flex items-center justify-center bg-white/10">
                <span className="text-white font-bold text-2xl">{user.realName.slice(0, 2)}</span>
              </div>
            )}
            {/* 在线状态 */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-[3px] border-white rounded-full" />
          </div>
          <h2 className="text-xl font-bold text-white mt-6 tracking-tight">{user.realName}</h2>
          <div className="flex items-center gap-2 mt-1">
            <roleMeta.icon size={14} className="text-white/60" />
            <p className="text-white/50 text-[10px] uppercase font-bold tracking-[0.15em]">
              {roleMeta.label} · {user.orgName}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6 -mt-8 relative z-20">
        {/* ─── 演示角色切换器 ─── */}
        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <button
            onClick={() => setShowSwitcher(!showSwitcher)}
            className="w-full px-6 py-5 flex items-center gap-4 transition-all active:bg-slate-50"
          >
            <div className={cn(
              'w-11 h-11 rounded-2xl flex items-center justify-center',
              roleMeta.color === 'indigo' ? 'bg-indigo-50 text-indigo-500' :
              roleMeta.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' :
              roleMeta.color === 'teal' ? 'bg-teal-50 text-teal-500' :
              roleMeta.color === 'sky' ? 'bg-sky-50 text-sky-500' :
              'bg-amber-50 text-amber-500'
            )}>
              <RefreshCw size={22} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[14px] font-bold text-slate-800 tracking-tight">切换演示角色</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                当前：<span className={cn(
                  'font-bold',
                  roleMeta.color === 'indigo' ? 'text-indigo-500' :
                  roleMeta.color === 'emerald' ? 'text-emerald-500' :
                  roleMeta.color === 'teal' ? 'text-teal-500' :
                  roleMeta.color === 'sky' ? 'text-sky-500' :
                  'text-amber-500'
                )}>{roleMeta.label}</span>
              </p>
            </div>
            <ChevronRight
              size={16}
              className={cn(
                'text-slate-300 transition-transform',
                showSwitcher && 'rotate-90'
              )}
            />
          </button>

          <AnimatePresence>
            {showSwitcher && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 space-y-2 border-t border-slate-50 pt-4">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-1 mb-1">
                    选择演示身份
                  </p>
                  {Object.entries(DEMO_USERS).map(([key, demoUser]) => {
                    const isActive = user.username === demoUser.username;
                    const meta = ROLE_META[demoUser.role];
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          switchRole(key);
                          setShowSwitcher(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all active:scale-[0.98]',
                          isActive
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-white border-slate-100 hover:border-slate-200'
                        )}
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center',
                          meta.color === 'indigo' ? 'bg-indigo-50 text-indigo-500' :
                          meta.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' :
                          'bg-amber-50 text-amber-500'
                        )}>
                          <meta.icon size={18} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-[13px] font-bold text-slate-800">{demoUser.realName}</div>
                          <div className="text-[11px] text-slate-400">{meta.label} · {demoUser.orgName}</div>
                        </div>
                        {isActive && (
                          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 常规菜单 */}
        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {sections.map((section, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (section.label === '服务协议') navigate('/agreement');
                else if (section.label === '关于') navigate('/about');
              }}
              className={cn(
                "w-full px-6 py-6 flex items-center gap-4 transition-all active:bg-slate-50",
                idx !== sections.length - 1 && "border-b border-slate-50"
              )}
            >
              <div className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                <section.icon size={22} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-bold text-slate-800 tracking-tight">{section.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{section.sub}</p>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-4.5 bg-white border border-red-100 text-red-500 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm active:bg-red-50 transition-all mt-4"
        >
          <LogOut size={16} />
          <span>退出当前账号</span>
        </button>

        <div className="text-center pt-8">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
            Digital Farming System v2.1.0
          </p>
          <p className="text-[10px] text-slate-300/60 font-medium mt-1">
            演示版本 · 角色切换测试
          </p>
        </div>
      </div>
    </div>
  );
}
