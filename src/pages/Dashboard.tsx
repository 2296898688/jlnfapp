/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  ChevronRight,
  FileEdit,
  FlaskConical,
  LineChart,
  Package,
  Plus,
  Satellite,
  TrendingUp,
  Wind,
  Droplets,
  Play,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useUser } from '../UserContext';
import { ROLE_TODOS, ROLE_KPIS, mockWeather, mockCropAnalysis } from '../mockData';
import { NEWS_LIST, VIDEO_LIST, CONTENT_CATEGORIES, BANNERS } from '../constants';

/* ═══════════════════════════════ 统一内容卡片 ═══════════════════════════════ */

interface CardItem {
  id: number;
  image: string;
  title: string;
  meta?: string;
}

function ContentGrid({
  items,
  onItemClick,
  showPlayIcon,
}: {
  items: CardItem[];
  onItemClick: (id: number) => void;
  showPlayIcon?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className="group active:scale-[0.98] transition-transform"
        >
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-2.5">
            <img
              src={item.image}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
              alt=""
            />
            {showPlayIcon && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-9 h-9 bg-black/40 rounded-full flex items-center justify-center">
                  <Play size={16} fill="white" className="text-white ml-0.5" />
                </div>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h5 className="text-[13px] font-bold text-slate-800 line-clamp-2 leading-snug">
              {item.title}
            </h5>
            {item.meta && (
              <p className="text-xs text-slate-400 font-medium">{item.meta}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════ 主页 ═══════════════════════════════ */

export default function Home() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [activeNewsTab, setActiveNewsTab] = useState(CONTENT_CATEGORIES[0]);
  const [activeVideoTab, setActiveVideoTab] = useState(CONTENT_CATEGORIES[0]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [alertIdx, setAlertIdx] = useState(0);

  const todos = ROLE_TODOS[user.role] || ROLE_TODOS.FARM_ADMIN;
  const isGroupRole = user.role === 'NONGKEN_ADMIN';
  const isGroupAdmin = user.role === 'GROUP_ADMIN';
  const isLandCompany = user.role === 'LAND_COMPANY_ADMIN';

  // 动态问候
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
  const unreadCount = todos.filter(t => !t.done).length;

  useEffect(() => {
    const t = setInterval(() => setCurrentBanner((prev) => (prev + 1) % BANNERS.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setAlertIdx((prev) => (prev + 1) % todos.length), 4000);
    return () => clearInterval(t);
  }, [todos.length]);

  const filteredNews =
    activeNewsTab === '全部'
      ? NEWS_LIST
      : NEWS_LIST.filter((n) => n.category === activeNewsTab);

  const filteredVideos =
    activeVideoTab === '全部'
      ? VIDEO_LIST
      : VIDEO_LIST.filter((v) => v.category === activeVideoTab);

  const newsItems: CardItem[] = filteredNews.map((n) => ({
    id: n.id,
    image: n.image,
    title: n.title,
    meta: n.date,
  }));

  const videoItems: CardItem[] = filteredVideos.map((v) => ({
    id: v.id,
    image: v.image,
    title: v.title,
    meta: v.duration,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      {/* ═══════ 1. Header — 紧凑移动端 ═══════ */}
      <header className="bg-gradient-to-b from-[#1e3a5f] to-[#1a4971] pt-5 pb-3 px-5">
        {/* 第一行：用户信息 + 通知 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border-2 border-white/30 overflow-hidden shadow-sm bg-white/10 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-white font-bold text-xs">{user.realName.slice(0, 2)}</span>
              )}
            </div>
            <div>
              <p className="text-[11px] text-white/60 font-medium">{greeting}</p>
              <h2 className="text-[17px] font-bold text-white leading-tight">{user.realName}</h2>
            </div>
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="relative w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Bell size={20} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-[#1e3a5f] flex items-center justify-center">
                <span className="text-[10px] font-bold text-white leading-none">{unreadCount > 99 ? '99+' : unreadCount}</span>
              </span>
            )}
          </button>
        </div>

        {/* 第二行：天气概览 — 紧凑单行 */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-white/50">{mockWeather.location}</span>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="text-xl leading-none">{mockWeather.conditionIcon}</span>
          <span className="text-xl font-bold text-white leading-none">{mockWeather.temp}°</span>
          <span className="text-[13px] text-white/60 font-medium">{mockWeather.condition}</span>
          <span className="flex items-center gap-1 text-[11px] text-white/50 ml-0.5">
            <Droplets size={12} className="text-sky-300" />
            {mockWeather.humidity}%
          </span>
          <span className="flex items-center gap-1 text-[11px] text-white/50">
            <Wind size={12} className="text-white/40" />
            {mockWeather.windDir}{mockWeather.windSpeed}级
          </span>
        </div>

        {/* 第三行：降雨趋势 — 超紧凑 */}
        <div className="mt-1 text-[11px] text-white/45">
          🌧 今日降雨 {mockWeather.rainfall}mm · {mockWeather.trend}
        </div>
      </header>

      {/* ═══════ 2. Banner 轮播 ═══════ */}
      <div className="px-5 mt-4">
        <div className="h-32 rounded-2xl overflow-hidden shadow-md relative bg-slate-800">
          <img
            src={BANNERS[currentBanner].image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4 w-full h-full flex flex-col justify-end">
            <span className="text-emerald-300 text-[10px] font-bold mb-1.5">
              {BANNERS[currentBanner].tag}
            </span>
            <h3 className="text-white font-bold text-sm leading-snug mb-2.5 pr-8">
              {BANNERS[currentBanner].title}
            </h3>
            <div className="flex gap-1.5">
              {BANNERS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-400',
                    currentBanner === i ? 'w-5 bg-white' : 'w-1.5 bg-white/40',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ 3. 待办滚动 ═══════ */}
      <div className="px-5 mt-4">
        <button
          onClick={() => navigate('/alerts')}
          className="w-full bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm border border-slate-100 active:scale-[0.99] transition-transform"
        >
          <div className="bg-amber-50 p-1.5 rounded-lg shrink-0">
            <AlertTriangle size={15} className="text-amber-500" />
          </div>
          <div className="flex-1 min-w-0 h-5 overflow-hidden relative">
            <div key={alertIdx} className="absolute inset-0 flex items-center">
              <p className="text-[12px] text-slate-600 truncate leading-none">
                <span className="font-bold text-slate-700 mr-1.5">告警</span>
                {todos[alertIdx]?.title}
              </p>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-300 shrink-0" />
        </button>
      </div>

      {/* ═══════ 5. 快捷入口 ═══════ */}
      {isGroupAdmin && (
        <div className="px-5 mt-4 space-y-2.5">
          <button
            onClick={() => navigate('/planting?tab=agrireport')}
            className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-50 flex items-center gap-4 active:scale-[0.99] transition-transform"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#0D665E14' }}>
              <Satellite size={22} style={{ color: '#0D665E' }} strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[14px] font-bold text-slate-800">农情报告</p>
              <p className="text-[11px] text-slate-400 mt-0.5">遥感监测 · 气象专报 · 决策支持</p>
            </div>
            <ChevronRight size={18} className="text-slate-300 shrink-0" />
          </button>
        </div>
      )}

      {isGroupRole && (
        <div className="px-5 mt-4">
          <button
            onClick={() => navigate('/planting?tab=agrireport')}
            className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-50 flex items-center gap-4 active:scale-[0.99] transition-transform"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#0D665E14' }}>
              <Satellite size={22} style={{ color: '#0D665E' }} strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[14px] font-bold text-slate-800">农情报告</p>
              <p className="text-[11px] text-slate-400 mt-0.5">遥感监测 · 气象专报 · 决策支持</p>
            </div>
            <ChevronRight size={18} className="text-slate-300 shrink-0" />
          </button>
        </div>
      )}

      {isLandCompany && (
        <div className="px-5 mt-4">
          <button
            onClick={() => navigate('/planting?tab=agrireport')}
            className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-50 flex items-center gap-4 active:scale-[0.99] transition-transform"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#0D665E14' }}>
              <Satellite size={22} style={{ color: '#0D665E' }} strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[14px] font-bold text-slate-800">农情报告</p>
              <p className="text-[11px] text-slate-400 mt-0.5">遥感监测 · 气象专报 · 决策支持</p>
            </div>
            <ChevronRight size={18} className="text-slate-300 shrink-0" />
          </button>
        </div>
      )}

      {!isGroupAdmin && !isGroupRole && !isLandCompany && (
        <div className="px-5 mt-5">
          <div className="bg-white rounded-2xl shadow-sm px-2 py-5 grid grid-cols-4 gap-y-5">
            {[
              { label: '种植规划', icon: BookOpen, onClick: () => navigate('/planting?tab=plan') },
              { label: '作业填报', icon: FileEdit, onClick: () => navigate('/planting?tab=report') },
              { label: '作业投入', icon: Package, onClick: () => navigate('/planting?tab=input') },
              { label: '农艺配方', icon: FlaskConical, onClick: () => navigate('/planting?tab=recipe') },
              { label: '产量预估', icon: TrendingUp, onClick: () => navigate('/planting?tab=estimate') },
              { label: '产量上报', icon: Plus, onClick: () => navigate('/planting?tab=yield') },
              { label: '农情报告', icon: Satellite, onClick: () => navigate('/planting?tab=agrireport') },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.onClick}
                className="flex flex-col items-center gap-2.5 active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <item.icon size={22} className="text-slate-600" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-medium text-slate-600">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══════ 6. 每日资讯 ═══════ */}
      <div className="mt-6 space-y-4">
        <div className="px-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">每日资讯</h3>
          <button
            onClick={() => navigate('/news')}
            className="flex items-center gap-1 text-xs font-medium text-[#1a4971] py-2 -my-2 px-1"
          >
            更多 <ChevronRight size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 overflow-x-auto px-5 border-b border-slate-200">
          {CONTENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveNewsTab(cat)}
              className={cn(
                'px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap relative',
                activeNewsTab === cat
                  ? 'text-[#1e3a5f] font-bold'
                  : 'text-slate-500',
              )}
            >
              {cat}
              {activeNewsTab === cat && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#1a4971] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="px-5">
          <ContentGrid
            items={newsItems}
            onItemClick={(id) => navigate(`/news/${id}`)}
          />
        </div>
      </div>

      {/* ═══════ 7. 视频讲座 ═══════ */}
      <div className="mt-6 pt-6 space-y-4 bg-white border-t border-slate-100">
        <div className="px-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">视频讲座</h3>
          <button
            onClick={() => navigate('/video')}
            className="flex items-center gap-1 text-xs font-medium text-[#1a4971] py-2 -my-2 px-1"
          >
            更多 <ChevronRight size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 overflow-x-auto px-5 border-b border-slate-200">
          {CONTENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveVideoTab(cat)}
              className={cn(
                'px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap relative',
                activeVideoTab === cat
                  ? 'text-[#1e3a5f] font-bold'
                  : 'text-slate-500',
              )}
            >
              {cat}
              {activeVideoTab === cat && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#1a4971] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="px-5 pb-6">
          <ContentGrid
            items={videoItems}
            onItemClick={(id) => navigate(`/video/${id}`)}
            showPlayIcon
          />
        </div>
      </div>
    </div>
  );
}
