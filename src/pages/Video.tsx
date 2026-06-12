/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Clock } from 'lucide-react';
import { VIDEO_LIST, CONTENT_CATEGORIES } from '../constants';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function Video() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState(CONTENT_CATEGORIES[0]);

  const item = id ? VIDEO_LIST.find((v) => v.id === Number(id)) : undefined;

  // ─── 详情 ───
  if (id && item) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F1F5F9] pb-24">
        <header className="bg-white px-5 pt-10 pb-4 border-b border-slate-100 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
            <ArrowLeft size={22} className="text-slate-600" />
          </button>
          <h1 className="text-base font-bold text-slate-800 truncate">视频详情</h1>
        </header>

        <div className="flex-1">
          <div className="relative aspect-video w-full bg-slate-900">
            <img src={item.image} className="w-full h-full object-cover opacity-50" alt="" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 bg-[#0D665E] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                <Play size={24} fill="white" className="text-white ml-1" />
              </div>
              <span className="text-white text-sm font-medium">{item.duration}</span>
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="text-[11px] font-bold text-[#0D665E] bg-[#E8F4F4] px-2.5 py-0.5 rounded-md">
                {item.category}
              </span>
              <span className="flex items-center gap-1"><Clock size={12} /> {item.duration}</span>
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F9] pb-24">
        <p className="text-slate-400 text-sm mb-4">视频不存在</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-[#0D665E] text-white text-sm font-bold rounded-lg">
          返回
        </button>
      </div>
    );
  }

  // ─── 列表 ───
  const filteredVideos = VIDEO_LIST.filter(
    (v) => v.category === activeTab || activeTab === CONTENT_CATEGORIES[0],
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F1F5F9] pb-24">
      <header className="bg-white px-5 pt-10 pb-0 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
            <ArrowLeft size={22} className="text-slate-600" />
          </button>
          <h1 className="text-base font-bold text-slate-800">视频讲座</h1>
        </div>
        <div className="flex gap-0 overflow-x-auto border-b border-slate-200">
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
      </header>

      <div className="flex-1 px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredVideos.map((v) => (
            <div
              key={v.id}
              onClick={() => navigate(`/video/${v.id}`)}
              className="group active:scale-[0.98] transition-transform"
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 shadow-sm mb-2.5">
                <img src={v.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" alt="" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-9 h-9 bg-black/40 rounded-full flex items-center justify-center">
                    <Play size={16} fill="white" className="text-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/55 text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                  {v.duration}
                </div>
              </div>
              <div className="space-y-1">
                <h5 className="text-[13px] font-bold text-slate-800 line-clamp-2 leading-snug">{v.title}</h5>
                <p className="text-xs text-slate-400 font-medium">{v.duration}</p>
              </div>
            </div>
          ))}
        </div>
        {filteredVideos.length === 0 && (
          <div className="text-center text-slate-400 py-20 text-sm">暂无相关视频</div>
        )}
      </div>
    </div>
  );
}
