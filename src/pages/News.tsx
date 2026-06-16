/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Search } from 'lucide-react';
import { NEWS_LIST, CONTENT_CATEGORIES } from '../constants';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function News() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(CONTENT_CATEGORIES[0]);

  const item = id ? NEWS_LIST.find((n) => n.id === Number(id)) : undefined;

  // ─── 详情 ───
  if (id && item) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
        {/* 全屏图片 + 浮动返回按钮 */}
        <div className="relative aspect-video w-full">
          <img src={item.image} className="w-full h-full object-cover" alt="" />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
        </div>

        <div className="flex-1">
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="text-[11px] font-bold text-[#0D665E] bg-[#E8F4F4] px-2.5 py-0.5 rounded-md">
                {item.category}
              </span>
              <span className="flex items-center gap-1"><Clock size={12} /> {item.date}</span>
            </div>

            <h2 className="text-lg font-bold text-slate-800 leading-snug">{item.title}</h2>

            <div className="w-full h-px bg-slate-100" />

            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {item.description}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (id && !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 pb-20">
        <p className="text-slate-400 text-sm mb-4">资讯不存在</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-[#0D665E] text-white text-sm font-bold rounded-lg">
          返回
        </button>
      </div>
    );
  }

  // ─── 列表 ───
  const filteredNews = NEWS_LIST.filter((n) => {
    const matchesTab = activeTab === '全部' || n.category === activeTab;
    const matchesSearch = search === '' || n.title.includes(search) || n.category.includes(search);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <div className="px-5 pt-5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center active:scale-95 transition-transform mb-3">
          <ArrowLeft size={18} className="text-slate-500" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">每日资讯</h1>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="搜索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#0D665E] shadow-sm transition-colors"
          />
        </div>
      </div>
      <div className="flex gap-0 overflow-x-auto px-5 mt-3 border-b border-slate-200">
        {CONTENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
              'px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap relative',
              activeTab === cat ? 'text-[#0A4D4A] font-bold' : 'text-slate-500',
            )}
          >
            {cat}
            {activeTab === cat && (
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#0D665E] rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 px-5 py-4 space-y-3">
        {filteredNews.map((n) => (
          <div
            key={n.id}
            onClick={() => navigate(`/news/${n.id}`)}
            className="bg-white rounded-xl p-3 flex gap-3 shadow-sm active:scale-[0.99] transition-transform"
          >
            <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0">
              <img src={n.image} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <span className="text-[10px] font-bold text-[#0D665E] bg-[#E8F4F4] px-2 py-0.5 rounded-md">
                  {n.category}
                </span>
                <h3 className="text-sm font-bold text-slate-800 mt-1.5 line-clamp-2 leading-snug">{n.title}</h3>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1"><Clock size={11} /> {n.date}</span>
                <span className="flex items-center gap-1"><Clock size={11} /> {n.date}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredNews.length === 0 && (
          <div className="text-center text-slate-400 py-20 text-sm">暂无相关资讯</div>
        )}
      </div>
    </div>
  );
}
