/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Eye, EyeOff, Building2, Warehouse, HardHat } from 'lucide-react';
import { cn } from '../lib/utils';

// ─── 演示账号定义 ───
const DEMO_ACCOUNTS = [
  {
    key: 'admin',
    username: 'admin',
    label: '农发集团管理',
    desc: '全集团视角 · 全部板块',
    icon: Building2,
    color: 'blue',
  },
  {
    key: 'farm',
    username: 'farm',
    label: '白城牧场管理员',
    desc: '白城牧场 · 农事管理',
    icon: Warehouse,
    color: 'blue',
  },
];

interface LoginProps {
  onLogin: (username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if ((username === 'admin' || username === 'farm' || username === 'operator') && password === '123456') {
        localStorage.setItem('isLoggedIn', 'true');
        onLogin(username);
      } else {
        setError('用户名或密码错误');
        setIsLoading(false);
      }
    }, 600);
  };

  const handleDemoLogin = (accountKey: string, accountUsername: string) => {
    setUsername(accountUsername);
    setPassword('123456');
    localStorage.setItem('isLoggedIn', 'true');
    onLogin(accountKey);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col justify-center px-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mx-auto space-y-10"
        >
          {/* Logo */}
          <div className="text-center space-y-5">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center shadow-xl">
                <div className="w-6 h-6 border-2 border-white rotate-45 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white"></div>
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-lg font-bold leading-tight uppercase tracking-wider text-blue-900">吉林农发<br />智慧农业</h1>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">移动端系统 v2.1.0 · 演示版</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <div className="group space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">登录账号</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                    placeholder="请输入账号"
                  />
                </div>
              </div>

              <div className="group space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">安全密码</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-500 text-[10px] font-bold text-center uppercase tracking-wider"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-3.5 bg-blue-900 text-white rounded-2xl font-bold tracking-widest uppercase shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100",
                isLoading && "animate-pulse"
              )}
            >
              {isLoading ? "验证中..." : "开启智慧农业"}
            </button>
          </form>

          {/* ─── 演示账号快速入口 ─── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-[1px] bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">演示账号快速进入</span>
              <div className="flex-1 h-[1px] bg-slate-100" />
            </div>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <motion.button
                  key={account.key}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDemoLogin(account.key, account.username)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all",
                    "active:ring-2 active:ring-offset-1",
                    account.color === 'indigo'
                      ? 'bg-indigo-50/50 border-indigo-100 active:ring-indigo-300 hover:bg-indigo-50'
                      : account.color === 'blue'
                      ? 'bg-blue-50/50 border-blue-100 active:ring-blue-300 hover:bg-blue-50'
                      : 'bg-amber-50/50 border-amber-100 active:ring-amber-300 hover:bg-amber-50'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      account.color === 'indigo'
                        ? 'bg-indigo-100 text-indigo-600'
                        : account.color === 'blue'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-amber-100 text-amber-600'
                    )}
                  >
                    <account.icon size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[13px] font-bold text-slate-800">{account.label}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{account.desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-bold text-slate-500">{account.username}</div>
                    <div className="text-[10px] text-slate-300">123456</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-400 font-mono tracking-widest uppercase">
            © 2024 吉林省农业投资集团有限公司
          </p>
        </motion.div>
      </div>
    </div>
  );
}
