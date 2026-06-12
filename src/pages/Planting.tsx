/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Cloud,
  BookOpen,
  FlaskConical as Flask,
  FileEdit,
  Package,
  LineChart,
  TrendingUp,
  UserCircle,
  Satellite,
  Wind,
  ArrowLeft,
  ChevronRight,
  Plus,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit2,
  ChevronDown,
  Map as MapIcon,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { mockPlanting, mockPlantingPlans, mockRecipes, mockMapPlots } from '../mockData';
import { useUser } from '../App';
import { AgronomicRecipe } from '../types';
import { AgriculturalOperation } from '../components/AgriculturalOperation';
import { InputMaterialRecording } from '../components/InputMaterialRecording';
import { YieldReporting } from '../components/YieldReporting';
import { YieldEstimation } from '../components/YieldEstimation';
import { PersonnelRecords } from '../components/PersonnelRecords';
import { ResponsiveContainer, LineChart as ReLineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';

/* ─── 遥感报告列表 Mock 数据 ─── */
interface RemoteReportItem {
  id: string;
  season: string;
  week: string;
  dateRange: string;
  avgNdvi: number;
  coverage: number;
  anomalyPlots: number;
  plots: { plot: string; ndvi: number; area: number; crop: string; status: string; color: string }[];
}

const REMOTE_REPORT_LIST: RemoteReportItem[] = [
  { id: 'r2026-24', season: '2026', week: '第24周', dateRange: '6/10 - 6/16', avgNdvi: 0.72, coverage: 85, anomalyPlots: 1,
    plots: [{ plot: '二队3号地', ndvi: 0.76, area: 12425, crop: '玉米', status: '优', color: '#10b981' },{ plot: '渠东高标地块三', ndvi: 0.70, area: 2563, crop: '小麦', status: '优', color: '#10b981' },{ plot: '统种示范区-M1', ndvi: 0.65, area: 1500, crop: '玉米', status: '优', color: '#10b981' },{ plot: '长岭-东大甸子', ndvi: 0.62, area: 11240, crop: '玉米', status: '优', color: '#10b981' }] },
  { id: 'r2026-23', season: '2026', week: '第23周', dateRange: '6/3 - 6/9', avgNdvi: 0.68, coverage: 82, anomalyPlots: 1,
    plots: [{ plot: '二队3号地', ndvi: 0.72, area: 12425, crop: '玉米', status: '优', color: '#10b981' },{ plot: '渠东高标地块三', ndvi: 0.65, area: 2563, crop: '小麦', status: '优', color: '#10b981' },{ plot: '南村盐碱地二', ndvi: 0.41, area: 2563, crop: '闲置', status: '一般', color: '#f59e0b' },{ plot: '统种示范区-M1', ndvi: 0.58, area: 1500, crop: '玉米', status: '良好', color: '#3b82f6' }] },
  { id: 'r2026-22', season: '2026', week: '第22周', dateRange: '5/27 - 6/2', avgNdvi: 0.61, coverage: 78, anomalyPlots: 2,
    plots: [{ plot: '二队3号地', ndvi: 0.68, area: 12425, crop: '玉米', status: '优', color: '#10b981' },{ plot: '渠东高标地块三', ndvi: 0.60, area: 2563, crop: '小麦', status: '优', color: '#10b981' },{ plot: '白城河西一号地', ndvi: 0.52, area: 9876, crop: '小麦', status: '良好', color: '#3b82f6' }] },
  { id: 'r2026-21', season: '2026', week: '第21周', dateRange: '5/20 - 5/26', avgNdvi: 0.52, coverage: 75, anomalyPlots: 2,
    plots: [{ plot: '镇南-苇塘西地', ndvi: 0.55, area: 18350, crop: '小麦', status: '良好', color: '#3b82f6' },{ plot: '长岭-南大甸子', ndvi: 0.50, area: 14580, crop: '大豆', status: '良好', color: '#3b82f6' },{ plot: '白城-南岗4号地', ndvi: 0.48, area: 15320, crop: '大豆', status: '良好', color: '#3b82f6' }] },
  { id: 'r2026-20', season: '2026', week: '第20周', dateRange: '5/13 - 5/19', avgNdvi: 0.45, coverage: 71, anomalyPlots: 3,
    plots: [{ plot: '白城-新立屯地', ndvi: 0.42, area: 6450, crop: '玉米', status: '一般', color: '#f59e0b' },{ plot: '镇南-东岗6号地', ndvi: 0.47, area: 16200, crop: '玉米', status: '一般', color: '#f59e0b' }] },
  { id: 'r2026-19', season: '2026', week: '第19周', dateRange: '5/6 - 5/12', avgNdvi: 0.38, coverage: 65, anomalyPlots: 4,
    plots: [{ plot: '二队3号地', ndvi: 0.41, area: 12425, crop: '玉米', status: '一般', color: '#f59e0b' },{ plot: '渠东高标地块三', ndvi: 0.36, area: 2563, crop: '小麦', status: '一般', color: '#f59e0b' }] },
  { id: 'r2025-23', season: '2025', week: '第23周', dateRange: '6/5 - 6/11', avgNdvi: 0.64, coverage: 80, anomalyPlots: 2,
    plots: [{ plot: '二队3号地', ndvi: 0.69, area: 12425, crop: '玉米', status: '优', color: '#10b981' },{ plot: '渠东高标地块三', ndvi: 0.62, area: 2563, crop: '小麦', status: '优', color: '#10b981' },{ plot: '统种示范区-M1', ndvi: 0.55, area: 1500, crop: '玉米', status: '良好', color: '#3b82f6' }] },
  { id: 'r2025-22', season: '2025', week: '第22周', dateRange: '5/29 - 6/4', avgNdvi: 0.57, coverage: 75, anomalyPlots: 3,
    plots: [{ plot: '长岭-东大甸子', ndvi: 0.60, area: 11240, crop: '玉米', status: '优', color: '#10b981' },{ plot: '白城-南岗4号地', ndvi: 0.55, area: 15320, crop: '大豆', status: '良好', color: '#3b82f6' },{ plot: '镇南-东岗6号地', ndvi: 0.52, area: 16200, crop: '玉米', status: '良好', color: '#3b82f6' }] },
  { id: 'r2025-21', season: '2025', week: '第21周', dateRange: '5/22 - 5/28', avgNdvi: 0.49, coverage: 70, anomalyPlots: 4,
    plots: [{ plot: '镇南-苇塘西地', ndvi: 0.51, area: 18350, crop: '小麦', status: '良好', color: '#3b82f6' },{ plot: '白城河西一号地', ndvi: 0.47, area: 9876, crop: '小麦', status: '一般', color: '#f59e0b' }] },
  { id: 'r2024-24', season: '2024', week: '第24周', dateRange: '6/12 - 6/18', avgNdvi: 0.66, coverage: 81, anomalyPlots: 1,
    plots: [{ plot: '二队3号地', ndvi: 0.71, area: 12425, crop: '玉米', status: '优', color: '#10b981' },{ plot: '长岭-南大甸子', ndvi: 0.62, area: 14580, crop: '大豆', status: '优', color: '#10b981' }] },
  { id: 'r2024-23', season: '2024', week: '第23周', dateRange: '6/3 - 6/9', avgNdvi: 0.68, coverage: 82, anomalyPlots: 1,
    plots: [{ plot: '二队3号地', ndvi: 0.72, area: 12425, crop: '玉米', status: '优', color: '#10b981' },{ plot: '渠东高标地块三', ndvi: 0.65, area: 2563, crop: '小麦', status: '优', color: '#10b981' },{ plot: '南村盐碱地二', ndvi: 0.41, area: 2563, crop: '闲置', status: '一般', color: '#f59e0b' },{ plot: '统种示范区-M1', ndvi: 0.58, area: 1500, crop: '玉米', status: '良好', color: '#3b82f6' }] },
  { id: 'r2024-22', season: '2024', week: '第22周', dateRange: '5/27 - 6/2', avgNdvi: 0.61, coverage: 78, anomalyPlots: 2,
    plots: [{ plot: '二队3号地', ndvi: 0.68, area: 12425, crop: '玉米', status: '优', color: '#10b981' },{ plot: '渠东高标地块三', ndvi: 0.60, area: 2563, crop: '小麦', status: '优', color: '#10b981' },{ plot: '南村盐碱地二', ndvi: 0.38, area: 2563, crop: '闲置', status: '一般', color: '#f59e0b' },{ plot: '统种示范区-M1', ndvi: 0.54, area: 1500, crop: '玉米', status: '良好', color: '#3b82f6' }] },
  { id: 'r2024-21', season: '2024', week: '第21周', dateRange: '5/20 - 5/26', avgNdvi: 0.52, coverage: 75, anomalyPlots: 2,
    plots: [{ plot: '二队3号地', ndvi: 0.59, area: 12425, crop: '玉米', status: '良好', color: '#3b82f6' },{ plot: '白城-南岗4号地', ndvi: 0.48, area: 15320, crop: '大豆', status: '良好', color: '#3b82f6' },{ plot: '长岭-东大甸子', ndvi: 0.53, area: 11240, crop: '玉米', status: '良好', color: '#3b82f6' },{ plot: '镇南-苇塘西地', ndvi: 0.46, area: 18350, crop: '小麦', status: '一般', color: '#f59e0b' }] },
  { id: 'r2024-20', season: '2024', week: '第20周', dateRange: '5/13 - 5/19', avgNdvi: 0.45, coverage: 71, anomalyPlots: 3,
    plots: [{ plot: '白城-新立屯地', ndvi: 0.42, area: 6450, crop: '玉米', status: '一般', color: '#f59e0b' },{ plot: '长岭-南大甸子', ndvi: 0.49, area: 14580, crop: '大豆', status: '良好', color: '#3b82f6' },{ plot: '镇南-东岗6号地', ndvi: 0.44, area: 16200, crop: '玉米', status: '一般', color: '#f59e0b' },{ plot: '白城河西一号地', ndvi: 0.47, area: 9876, crop: '小麦', status: '良好', color: '#3b82f6' }] },
  { id: 'r2024-19', season: '2024', week: '第19周', dateRange: '5/6 - 5/12', avgNdvi: 0.38, coverage: 65, anomalyPlots: 4,
    plots: [{ plot: '二队3号地', ndvi: 0.41, area: 12425, crop: '玉米', status: '一般', color: '#f59e0b' },{ plot: '渠东高标地块三', ndvi: 0.36, area: 2563, crop: '小麦', status: '一般', color: '#f59e0b' }] },
  { id: 'r2024-18', season: '2024', week: '第18周', dateRange: '4/29 - 5/5', avgNdvi: 0.32, coverage: 58, anomalyPlots: 5,
    plots: [{ plot: '二队3号地', ndvi: 0.35, area: 12425, crop: '玉米', status: '一般', color: '#f59e0b' },{ plot: '统种示范区-M1', ndvi: 0.28, area: 1500, crop: '玉米', status: '一般', color: '#f59e0b' }] },
  { id: 'r2023-23', season: '2023', week: '第23周', dateRange: '6/5 - 6/11', avgNdvi: 0.64, coverage: 80, anomalyPlots: 2,
    plots: [{ plot: '二队3号地', ndvi: 0.69, area: 12425, crop: '玉米', status: '优', color: '#10b981' },{ plot: '渠东高标地块三', ndvi: 0.62, area: 2563, crop: '小麦', status: '优', color: '#10b981' }] },
  { id: 'r2023-22', season: '2023', week: '第22周', dateRange: '5/29 - 6/4', avgNdvi: 0.57, coverage: 75, anomalyPlots: 3,
    plots: [{ plot: '长岭-东大甸子', ndvi: 0.60, area: 11240, crop: '玉米', status: '优', color: '#10b981' },{ plot: '白城-南岗4号地', ndvi: 0.55, area: 15320, crop: '大豆', status: '良好', color: '#3b82f6' }] },
  { id: 'r2023-21', season: '2023', week: '第21周', dateRange: '5/22 - 5/28', avgNdvi: 0.49, coverage: 70, anomalyPlots: 4,
    plots: [{ plot: '镇南-苇塘西地', ndvi: 0.51, area: 18350, crop: '小麦', status: '良好', color: '#3b82f6' },{ plot: '白城河西一号地', ndvi: 0.47, area: 9876, crop: '小麦', status: '一般', color: '#f59e0b' }] },
  { id: 'r2022-23', season: '2022', week: '第23周', dateRange: '6/6 - 6/12', avgNdvi: 0.60, coverage: 76, anomalyPlots: 3,
    plots: [{ plot: '二队3号地', ndvi: 0.65, area: 12425, crop: '玉米', status: '优', color: '#10b981' },{ plot: '统种示范区-M1', ndvi: 0.56, area: 1500, crop: '玉米', status: '良好', color: '#3b82f6' }] },
  { id: 'r2022-22', season: '2022', week: '第22周', dateRange: '5/30 - 6/5', avgNdvi: 0.53, coverage: 72, anomalyPlots: 4,
    plots: [{ plot: '长岭-南大甸子', ndvi: 0.55, area: 14580, crop: '大豆', status: '良好', color: '#3b82f6' },{ plot: '镇南-东岗6号地', ndvi: 0.50, area: 16200, crop: '玉米', status: '良好', color: '#3b82f6' }] },
];

/* ─── 气象专报列表 Mock 数据 ─── */
interface WeatherReportItem {
  id: string;
  season: string;
  date: string;
  cond: string;
  condIcon: string;
  temp: number;
  humidity: number;
  windDir: string;
  windSpeed: number;
  rainfall: number;
  advice: string[];
}

const WEATHER_REPORT_LIST: WeatherReportItem[] = [
  { id: 'w2026-1', season: '2026', date: '6月12日', cond: '晴', condIcon: '☀️', temp: 27, humidity: 40, windDir: '南风', windSpeed: 3, rainfall: 0, advice: ['未来三天无降雨，适宜田间作业','气温偏高，注意玉米苗期灌溉'] },
  { id: 'w2026-2', season: '2026', date: '6月5日', cond: '多云', condIcon: '⛅', temp: 29, humidity: 45, windDir: '东南风', windSpeed: 4, rainfall: 2, advice: ['多云天气适宜喷药作业','墒情良好，暂缓灌溉'] },
  { id: 'w2026-3', season: '2026', date: '5月29日', cond: '阵雨', condIcon: '🌧', temp: 23, humidity: 72, windDir: '北风', windSpeed: 5, rainfall: 10, advice: ['降雨后48小时内暂停田间机械作业','注意低洼地块排水'] },
  { id: 'w2026-4', season: '2026', date: '5月22日', cond: '晴', condIcon: '☀️', temp: 31, humidity: 33, windDir: '西南风', windSpeed: 3, rainfall: 0, advice: ['连续晴好天气，可安排无人机植保','温度较高，人员注意防暑'] },
  { id: 'w2026-5', season: '2026', date: '5月15日', cond: '阴', condIcon: '☁️', temp: 21, humidity: 62, windDir: '东风', windSpeed: 4, rainfall: 4, advice: ['阴天适合移栽作业','注意田间病害监测'] },
  { id: 'w2026-6', season: '2026', date: '5月8日', cond: '中雨', condIcon: '🌧', temp: 18, humidity: 82, windDir: '北风', windSpeed: 6, rainfall: 22, advice: ['降雨量较大，暂停一切田间作业','检查排水设施运行状态'] },
  { id: 'w2026-7', season: '2026', date: '5月1日', cond: '晴转多云', condIcon: '🌤', temp: 24, humidity: 44, windDir: '南风', windSpeed: 2, rainfall: 0, advice: ['适宜春播收尾工作','可安排追肥作业'] },
  { id: 'w2026-8', season: '2026', date: '4月24日', cond: '晴', condIcon: '☀️', temp: 22, humidity: 38, windDir: '西南风', windSpeed: 3, rainfall: 0, advice: ['春播关键期，抢抓晴好天气','土壤墒情适宜播种'] },
  { id: 'w2025-1', season: '2025', date: '6月12日', cond: '阵雨', condIcon: '🌧', temp: 25, humidity: 68, windDir: '东风', windSpeed: 4, rainfall: 14, advice: ['降雨过程中注意田间排水','雨后可安排除草作业'] },
  { id: 'w2025-2', season: '2025', date: '6月5日', cond: '晴', condIcon: '☀️', temp: 30, humidity: 36, windDir: '南风', windSpeed: 3, rainfall: 0, advice: ['小麦灌浆期，适时浇水','玉米苗期病虫害监测'] },
  { id: 'w2025-3', season: '2025', date: '5月29日', cond: '多云', condIcon: '⛅', temp: 28, humidity: 48, windDir: '东南风', windSpeed: 3, rainfall: 1, advice: ['适宜田间管理作业','加强作物长势监测'] },
  { id: 'w2025-4', season: '2025', date: '5月22日', cond: '晴', condIcon: '☀️', temp: 33, humidity: 30, windDir: '西南风', windSpeed: 4, rainfall: 0, advice: ['高温天气减少户外作业','加强灌溉管理'] },
  { id: 'w2024-1', season: '2024', date: '6月12日', cond: '晴', condIcon: '☀️', temp: 26, humidity: 42, windDir: '南风', windSpeed: 3, rainfall: 0, advice: ['未来三天无降雨，适宜田间作业','气温偏高，注意玉米苗期灌溉'] },
  { id: 'w2024-2', season: '2024', date: '6月5日', cond: '多云', condIcon: '⛅', temp: 28, humidity: 48, windDir: '东南风', windSpeed: 4, rainfall: 2, advice: ['多云天气适宜喷药作业','墒情良好，暂缓灌溉'] },
  { id: 'w2024-3', season: '2024', date: '5月29日', cond: '阵雨', condIcon: '🌧', temp: 22, humidity: 75, windDir: '北风', windSpeed: 5, rainfall: 8, advice: ['降雨后48小时内暂停田间机械作业','注意低洼地块排水'] },
  { id: 'w2024-4', season: '2024', date: '5月22日', cond: '晴', condIcon: '☀️', temp: 30, humidity: 35, windDir: '西南风', windSpeed: 3, rainfall: 0, advice: ['连续晴好天气，可安排无人机植保','温度较高，人员注意防暑'] },
];

/* ─── 遥感报告组件 (列表 + 详情) ─── */
function RemoteSensingReport() {
  const [selectedReport, setSelectedReport] = useState<RemoteReportItem | null>(null);
  const [season, setSeason] = useState('2026');
  const [search, setSearch] = useState('');

  const filtered = REMOTE_REPORT_LIST.filter(r => {
    if (r.season !== season) return false;
    if (search && !r.week.includes(search) && !r.plots.some(p => p.plot.includes(search) || p.crop.includes(search))) return false;
    return true;
  });

  // 详情视图
  if (selectedReport) {
    const NDVI_TREND = [
      { date: '5/1', ndvi: Math.max(0, selectedReport.avgNdvi - 0.30), 长势: '一般' },
      { date: '5/8', ndvi: Math.max(0, selectedReport.avgNdvi - 0.24), 长势: '一般' },
      { date: '5/15', ndvi: Math.max(0, selectedReport.avgNdvi - 0.17), 长势: '良好' },
      { date: '5/22', ndvi: Math.max(0, selectedReport.avgNdvi - 0.10), 长势: '良好' },
      { date: '5/29', ndvi: Math.max(0, selectedReport.avgNdvi - 0.04), 长势: '优' },
      { date: '6/5', ndvi: selectedReport.avgNdvi, 长势: '优' },
    ];
    return (
      <div className="space-y-5">
        <button onClick={() => setSelectedReport(null)} className="flex items-center gap-2 text-slate-500 active:text-slate-800">
          <ArrowLeft size={18} /> <span className="text-[13px] font-bold">返回列表</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-black text-slate-800">遥感监测报告</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">哨兵-2号 · {selectedReport.season}年{selectedReport.week} · 白城牧场</p>
          </div>
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black">最新</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '平均NDVI', val: selectedReport.avgNdvi.toFixed(2), sub: `覆盖度${selectedReport.coverage}%`, clr: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: '植被覆盖度', val: `${selectedReport.coverage}%`, sub: `较上月+${(selectedReport.avgNdvi * 100 - 45).toFixed(0)}%`, clr: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '异常地块', val: `${selectedReport.anomalyPlots}块`, sub: '盐碱地需关注', clr: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((c, i) => (
            <div key={i} className={cn('rounded-2xl p-3 border', c.bg, 'border-transparent')}>
              <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">{c.label}</div>
              <div className={cn('text-[20px] font-black', c.clr)}>{c.val}</div>
              <div className="text-[9px] font-bold text-slate-400 mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NDVI 时序趋势</span>
          <div className="h-[200px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={NDVI_TREND}>
                <defs>
                  <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11 }} />
                <Area type="monotone" dataKey="ndvi" stroke="#10b981" strokeWidth={2} fill="url(#ndviGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">地块 NDVI 明细</span>
          <div className="mt-2 space-y-1">
            {selectedReport.plots.map((p, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <div>
                    <div className="text-[12px] font-bold text-slate-800">{p.plot}</div>
                    <div className="text-[10px] text-slate-400">{p.crop} · {p.area.toLocaleString()}㎡</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-black text-slate-800">{p.ndvi}</div>
                  <div className={cn('text-[10px] font-bold', p.status === '优' ? 'text-emerald-500' : p.status === '良好' ? 'text-blue-500' : 'text-amber-500')}>{p.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 列表视图
  return (
    <div className="space-y-4">
      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
          placeholder="搜索地块、作物..."
        />
      </div>

      {/* 种植季 */}
      <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
        {['2026', '2025', '2024'].map((s) => (
          <button
            key={s}
            onClick={() => setSeason(s)}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              season === s ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "text-slate-500 hover:bg-white"
            )}
          >
            {s} 种植季
          </button>
        ))}
      </div>

      {/* 双列卡片网格 — 文档封面风格 */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        {filtered.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedReport(r)}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 active:scale-[0.98] transition-transform text-left"
          >
            {/* 顶部色条 */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-400" />
            {/* 封面内容 */}
            <div className="p-4 pt-3">
              {/* 标题行 */}
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">遥感监测报告</p>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[14px] font-black text-slate-800">{r.week}</h4>
                <span className="text-[10px] text-slate-400 font-medium">{r.dateRange}</span>
              </div>
              {/* 核心指标 */}
              <div className="bg-slate-50 rounded-xl p-3 text-center mb-2">
                <div className="text-[30px] font-black text-emerald-600 leading-none">{r.avgNdvi.toFixed(2)}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">平均 NDVI</div>
              </div>
              {/* 示例标注 */}
              <p className="text-[8px] text-slate-300 text-center font-medium">此为示例报告 供演示使用</p>
            </div>
            {/* 底部角标 */}
            <div className="absolute bottom-3 right-3 opacity-[0.06]">
              <Satellite size={32} />
            </div>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-[13px] font-medium">暂无{season}种植季遥感报告</div>
      )}
    </div>
  );
}

/* ─── 气象专报组件 (列表 + 详情) ─── */
function WeatherSpecialReport() {
  const [selectedReport, setSelectedReport] = useState<WeatherReportItem | null>(null);
  const [season, setSeason] = useState('2026');
  const [search, setSearch] = useState('');

  const filtered = WEATHER_REPORT_LIST.filter(r => {
    if (r.season !== season) return false;
    if (search && !r.date.includes(search) && !r.cond.includes(search)) return false;
    return true;
  });

  // 详情视图
  if (selectedReport) {
    const forecast = [
      { day: selectedReport.date, 最高温: selectedReport.temp, 最低温: selectedReport.temp - 8, 降雨量: selectedReport.rainfall, 条件: selectedReport.cond },
      { day: '次日', 最高温: selectedReport.temp + 2, 最低温: selectedReport.temp - 7, 降雨量: 0, 条件: '多云' },
      { day: '第3天', 最高温: selectedReport.temp - 3, 最低温: selectedReport.temp - 10, 降雨量: selectedReport.rainfall > 5 ? selectedReport.rainfall / 2 : 12, 条件: '阵雨' },
      { day: '第4天', 最高温: selectedReport.temp - 5, 最低温: selectedReport.temp - 12, 降雨量: selectedReport.rainfall > 5 ? selectedReport.rainfall * 1.5 : 25, 条件: '中雨' },
      { day: '第5天', 最高温: selectedReport.temp + 1, 最低温: selectedReport.temp - 8, 降雨量: 3, 条件: '阴转晴' },
      { day: '第6天', 最高温: selectedReport.temp + 3, 最低温: selectedReport.temp - 6, 降雨量: 0, 条件: '晴' },
      { day: '第7天', 最高温: selectedReport.temp + 5, 最低温: selectedReport.temp - 4, 降雨量: 0, 条件: '晴' },
    ];
    return (
      <div className="space-y-5">
        <button onClick={() => setSelectedReport(null)} className="flex items-center gap-2 text-slate-500 active:text-slate-800">
          <ArrowLeft size={18} /> <span className="text-[13px] font-bold">返回列表</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-black text-slate-800">气象专报</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">白城气象站 · {selectedReport.season}年{selectedReport.date} 发布</p>
          </div>
          <span className="px-3 py-1.5 bg-sky-50 text-sky-700 rounded-full text-[10px] font-black">实时</span>
        </div>
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">当前天气</div>
              <div className="text-[42px] font-black leading-none mt-1">{selectedReport.temp}°</div>
              <div className="text-[14px] font-bold opacity-80 mt-1">{selectedReport.cond}</div>
            </div>
            <div className="text-right space-y-2">
              {[
                { label: '湿度', val: `${selectedReport.humidity}%` },
                { label: '风速', val: `${selectedReport.windDir} ${selectedReport.windSpeed}级` },
                { label: '降雨', val: `${selectedReport.rainfall}mm` },
              ].map((w, i) => (
                <div key={i} className="text-[10px] font-bold opacity-70">
                  <span className="opacity-50">{w.label}</span> {w.val}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">7日温度与降雨预报</span>
          <div className="h-[220px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="temp" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[10, 35]} />
                <YAxis yAxisId="rain" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 40]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11 }} />
                <Legend iconSize={6} wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                <Line yAxisId="temp" type="monotone" dataKey="最高温" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="temp" type="monotone" dataKey="最低温" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Bar yAxisId="rain" dataKey="降雨量" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={12} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-amber-400 rounded-full" />
            <span className="text-[11px] font-black text-amber-700 uppercase tracking-widest">农事建议</span>
          </div>
          <div className="space-y-2 text-[12px] font-bold text-amber-800">
            {selectedReport.advice.map((a, i) => <p key={i}>· {a}</p>)}
          </div>
        </div>
      </div>
    );
  }

  // 列表视图
  return (
    <div className="space-y-4">
      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all font-medium"
          placeholder="搜索日期、天气..."
        />
      </div>

      {/* 种植季 */}
      <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
        {['2026', '2025', '2024'].map((s) => (
          <button
            key={s}
            onClick={() => setSeason(s)}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              season === s ? "bg-sky-600 text-white shadow-lg shadow-sky-100" : "text-slate-500 hover:bg-white"
            )}
          >
            {s} 种植季
          </button>
        ))}
      </div>

      {/* 双列卡片网格 — 文档封面风格 */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        {filtered.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedReport(r)}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 active:scale-[0.98] transition-transform text-left"
          >
            {/* 顶部色条 */}
            <div className="h-1.5 bg-gradient-to-r from-sky-500 to-blue-500" />
            {/* 封面内容 */}
            <div className="p-4 pt-3">
              {/* 标题行 */}
              <p className="text-[9px] font-black text-sky-600 uppercase tracking-widest mb-0.5">气象专报</p>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[14px] font-black text-slate-800">{r.date}</h4>
                <span className="text-[22px] leading-none">{r.condIcon}</span>
              </div>
              {/* 核心指标 */}
              <div className="bg-slate-50 rounded-xl p-3 mb-3 text-center">
                <div className="text-[30px] font-black text-sky-600 leading-none">{r.temp}°</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">{r.cond}</div>
              </div>
              {/* 气象指标 */}
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-2">
                <span>💧 {r.rainfall}mm</span>
                <span>💨 {r.windSpeed}级</span>
                <span>💦 {r.humidity}%</span>
              </div>
              {/* 示例标注 */}
              <p className="text-[8px] text-slate-300 text-center font-medium">此为示例报告 供演示使用</p>
            </div>
            {/* 底部水印 */}
            <div className="absolute bottom-2 right-2 opacity-[0.04]">
              <Wind size={32} />
            </div>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-[13px] font-medium">暂无{season}种植季气象专报</div>
      )}
    </div>
  );
}

/* ─── 农情报告（遥感 + 气象双Tab）─── */
function AgriReport() {
  const [subTab, setSubTab] = useState<'remote' | 'meteo'>('remote');
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 w-fit">
        {[
          { id: 'remote' as const, label: '遥感监测' },
          { id: 'meteo' as const, label: '气象专报' },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={cn("px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all", subTab === t.id ? "bg-blue-700 text-white shadow" : "text-slate-500")}>{t.label}</button>
        ))}
      </div>
      {subTab === 'remote' ? <RemoteSensingReport /> : <WeatherSpecialReport />}
    </div>
  );
}

export default function Planting() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const currentTab = searchParams.get('tab');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [currentFilterTab, setCurrentFilterTab] = useState<'season' | 'crop' | 'mode' | 'org'>('season');
  const [selectingMaterialType, setSelectingMaterialType] = useState<string | null>(null);
  const [recipes, setRecipes] = useState(mockRecipes);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, { id: string; name: string; dosage: string; unitPrice: string }[]>>({
    seed: [],
    fertilizer: [],
    pesticide: []
  });
  const [recipeSearch, setRecipeSearch] = useState('');
  const [recipeCropFilter, setRecipeCropFilter] = useState('全部');
  const [recipeOpFilter, setRecipeOpFilter] = useState('全部');
  const [showRecipeFilter, setShowRecipeFilter] = useState(false);
  const [waterUsage, setWaterUsage] = useState({ dosage: '', unitPrice: '' });

  const [activeFilters, setActiveFilters] = useState({
    season: '2026',
    type: '全部'
  });

  // ─── 种植规划状态 ───
  interface PlanWithSeason extends PlantingPlan {
    season: string;
  }
  const [plans, setPlans] = useState<PlanWithSeason[]>(() => {
    const farms = ['白城牧场', '镇南种羊场', '长岭种马场'];
    const extra: any[] = [
      { id: 'plan4', category: '粮食作物', crop: '玉米', variety: '先育335', details: [{ type: '统种', count: 35, area: 5200 }], org: farms[0] },
      { id: 'plan5', category: '粮食作物', crop: '玉米', variety: '京科968', details: [{ type: '统种', count: 28, area: 3800 }], org: farms[1] },
      { id: 'plan6', category: '粮食作物', crop: '小麦', variety: '京麦31', details: [{ type: '统种', count: 40, area: 6700 }], org: farms[2] },
      { id: 'plan7', category: '粮食作物', crop: '小麦', variety: '宁春4号', details: [{ type: '统种', count: 30, area: 4500 }], org: farms[0] },
      { id: 'plan8', category: '油料作物', crop: '大豆', variety: '黑河43', details: [{ type: '统种', count: 45, area: 7200 }], org: farms[1] },
      { id: 'plan9', category: '油料作物', crop: '大豆', variety: '合丰55', details: [{ type: '统种', count: 22, area: 3100 }], org: farms[2] },
      { id: 'plan10', category: '经济作物', crop: '高粱', variety: '吉杂127', details: [{ type: '统种', count: 10, area: 1500 }], org: farms[0] },
    ];
    const base = mockPlantingPlans.map((p, i) => ({ ...p, org: farms[i % 3] }));
    const all = [...base, ...extra];
    return all.map((p: any, i: number) => ({
      ...p,
      season: i < 5 ? '2026' : i < 8 ? '2025' : '2024',
    }));
  });
  const [planSearch, setPlanSearch] = useState('');
  const [planCropFilter, setPlanCropFilter] = useState('全部作物');
  const [planOrgFilter, setPlanOrgFilter] = useState('全部农场');
  const [editingPlan, setEditingPlan] = useState<PlanWithSeason | null>(null);
  const [detailPlan, setDetailPlan] = useState<PlanWithSeason | null>(null);
  // 新增/编辑表单
  const [planForm, setPlanForm] = useState({
    org: '白城牧场',
    crop: '玉米',
    variety: '郑单958',
    varietyType: '新种',
    unifiedCount: 0,
    unifiedArea: 0,
    leaseCount: 0,
    leaseArea: 0,
  });
  const [showCropPicker, setShowCropPicker] = useState(false);
  const [showVarietyPicker, setShowVarietyPicker] = useState(false);
  const [showOrgPicker, setShowOrgPicker] = useState(false);
  const [showPlotPicker, setShowPlotPicker] = useState(false);
  const [selectedPlotIds, setSelectedPlotIds] = useState<Set<string>>(new Set());
  const ORG_OPTIONS = ['白城牧场', '镇南种羊场', '长岭种马场'];
  const CROP_OPTIONS = ['玉米', '小麦', '大豆', '高粱'];
  const VARIETY_OPTIONS: Record<string, string[]> = {
    '玉米': ['郑单958', '先育335', '京科968', '良玉99'],
    '小麦': ['蒙麦20', '京麦31', '宁春4号'],
    '大豆': ['中黄13', '黑河43', '合丰55'],
    '高粱': ['吉杂127', '龙杂17'],
  };

  // 过滤规划
  const filteredPlans = plans.filter((plan) => {
    if (user.orgFilter && (plan as any).org !== user.orgFilter) return false;
    if (plan.season !== activeFilters.season) return false;
    const q = planSearch.toLowerCase();
    if (q && !plan.crop.toLowerCase().includes(q) && !plan.variety.toLowerCase().includes(q)) return false;
    if (planCropFilter !== '全部作物' && plan.crop !== planCropFilter) return false;
    if (planOrgFilter !== '全部农场' && (plan as any).org !== planOrgFilter) return false;
    return true;
  });

  // 按品种分组
  const groupedPlans = filteredPlans.reduce((acc, plan) => {
    const key = plan.crop;
    if (!acc[key]) acc[key] = [];
    acc[key].push(plan);
    return acc;
  }, {} as Record<string, PlanWithSeason[]>);

  // 删除规划
  const handleDeletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // 选中地块汇总
  const selectedPlots = mockMapPlots.filter((p) => selectedPlotIds.has(p.id));
  const plotTotalArea = selectedPlots.reduce((s, p) => s + p.area, 0);

  // 打开编辑弹窗
  const handleEditPlan = (plan: PlanWithSeason) => {
    setEditingPlan(plan);
    setPlanForm({
      org: (plan as any).org || '白城牧场',
      crop: plan.crop,
      variety: plan.variety,
      varietyType: (plan as any).varietyType || '新种',
      unifiedCount: 0, unifiedArea: 0, leaseCount: 0, leaseArea: 0,
    });
    setSelectedPlotIds(new Set());
    setShowAddModal(true);
  };

  // 保存规划
  const handleSavePlan = () => {
    const details: any[] = (selectedPlots.length > 0 ? [{
      type: '统种',
      count: selectedPlots.length,
      area: +plotTotalArea.toFixed(1),
    }] : []);

    if (editingPlan) {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === editingPlan.id
            ? { ...p, crop: planForm.crop, variety: planForm.variety, details, org: planForm.org, varietyType: planForm.varietyType } as any
            : p
        )
      );
    } else {
      const newPlan: PlanWithSeason = {
        id: `plan-${Date.now()}`,
        crop: planForm.crop,
        variety: planForm.variety,
        category: '粮食作物',
        season: activeFilters.season,
        details,
        org: planForm.org,
        varietyType: planForm.varietyType,
      } as any;
      setPlans((prev) => [newPlan, ...prev]);
    }
    setShowAddModal(false);
    setEditingPlan(null);
    setSelectedPlotIds(new Set());
    setPlanForm({ org: '白城牧场', crop: '玉米', variety: '郑单958', varietyType: '新种', unifiedCount: 0, unifiedArea: 0, leaseCount: 0, leaseArea: 0 });
  };

  // 重置表单打开新增
  const openAddModal = () => {
    setEditingPlan(null);
    setSelectedPlotIds(new Set());
    setPlanForm({ org: '白城牧场', crop: '玉米', variety: '郑单958', varietyType: '新种', unifiedCount: 0, unifiedArea: 0, leaseCount: 0, leaseArea: 0 });
    setShowAddModal(true);
  };

  const plantingInfo = [
    { id: 'plan', label: '种植规划', icon: BookOpen, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'recipe', label: '农艺配方', icon: Flask, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'report', label: '作业填报', icon: FileEdit, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'input', label: '作业投入', icon: Package, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'estimate', label: '产量预估', icon: TrendingUp, color: 'bg-blue-50 text-blue-700' },
    { id: 'yield', label: '产量上报', icon: LineChart, color: 'bg-blue-50 text-blue-700' },
    ...(user.role === 'GROUP_ADMIN' ? [
      { id: 'personnel', label: '人员档案', icon: UserCircle, color: 'bg-blue-50 text-blue-600' },
    ] : []),
  ];

  const reportInfo = [
    { id: 'agrireport', label: '农情报告', icon: Satellite, desc: '遥感监测与气象专报', color: 'bg-slate-50 text-slate-600' },
  ];

  const handleTabClick = (item: any) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setSearchParams({ tab: item.id });
    }
  };

  const handleSaveRecipe = () => {
    if (!newRecipeName) return;
    
    const recipeMaterials: any[] = [];
    (Object.values(selectedMaterials) as any[]).forEach(mats => {
      mats.forEach(m => {
        recipeMaterials.push({
          ...m,
          type: m.id.split('-')[0].toUpperCase()
        });
      });
    });

    const newRecipe: AgronomicRecipe = {
      id: `recipe-${Date.now()}`,
      name: newRecipeName,
      suitableCrop: '通用',
      suitableOperation: '定期施用',
      materials: recipeMaterials,
      waterUsage: (waterUsage.dosage || waterUsage.unitPrice) ? waterUsage : undefined,
      description: '用户自定义新增配方'
    };

    setRecipes([newRecipe, ...recipes]);
    setShowRecipeModal(false);
    setNewRecipeName('');
    setSelectedMaterials({ seed: [], fertilizer: [], pesticide: [] });
    setWaterUsage({ dosage: '', unitPrice: '' });
  };

  const currentTabItem = [...plantingInfo, ...reportInfo].find(i => i.id === currentTab);
  const currentTabLabel = currentTabItem?.label;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 flex items-center justify-between px-6 py-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {currentTab && (
            <button 
              onClick={() => navigate(-1)}
              className="p-1 active:bg-slate-50 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-400" />
            </button>
          )}
          <h1 className="text-[17px] font-bold text-slate-800">
            {currentTab ? currentTabLabel : '种植管理'}
          </h1>
        </div>
        {!currentTab && (
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 active:bg-slate-50 rounded-full">
              <Search size={20} />
            </button>
            <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center bg-slate-100">
              {user.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" alt="用户" />
              ) : (
                <span className="text-slate-500 font-bold text-[10px]">{user.realName.slice(0, 2)}</span>
              )}
            </div>
          </div>
        )}
      </header>

      <AnimatePresence mode="wait">
        {!currentTab ? (
          <motion.div 
            key="portal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 space-y-6"
          >
            {/* Category: Planting Info */}
            <section className="bg-white rounded-[32px] p-6 border border-slate-200/50 shadow-sm space-y-5">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                <h2 className="text-[14px] font-bold text-slate-800">农事作业</h2>
              </div>
              
              <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                {plantingInfo.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item)}
                    className="flex flex-col items-center gap-2 active:scale-95 transition-all group"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border border-white",
                      item.color,
                      "group-active:shadow-inner"
                    )}>
                      <item.icon size={22} strokeWidth={2.2} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 text-center line-clamp-1">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Category: Reports */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                   <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
                   <h2 className="text-[14px] font-bold text-slate-800">农情报告</h2>
                </div>
              </div>
              
              <div className="space-y-3">
                {reportInfo.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item)}
                    className="flex items-center justify-between w-full p-4 bg-white rounded-3xl border border-slate-200/50 shadow-sm active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2.5 rounded-2xl", item.color)}>
                        <item.icon size={20} strokeWidth={2.2} />
                      </div>
                      <div className="text-left">
                        <span className="text-[13px] font-bold text-slate-800">{item.label}</span>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-200" />
                  </button>
                ))}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div 
            key="subview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4"
          >
             {/* Sub-view Content Wrapper */}
             <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm min-h-[460px] p-6 relative">
                                {currentTab === 'plan' ? (
                   <div className="space-y-4">
                      {/* Search + Filters */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                           <div className="flex-1 relative">
                             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                             <input
                                value={planSearch}
                                onChange={(e) => setPlanSearch(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                                placeholder="搜索文号、作物、品种..."
                             />
                           </div>
                           <button
                             onClick={() => setShowFilterDrawer(true)}
                             className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 active:scale-95 transition-all"
                           >
                             <Filter size={18} />
                           </button>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                          {/* Season */}
                          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 shrink-0">
                            {['2026', '2025', '2024'].map((s) => (
                              <button
                                key={s}
                                onClick={() => setActiveFilters(prev => ({ ...prev, season: s }))}
                                className={cn(
                                  "px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap",
                                  activeFilters.season === s
                                    ? "bg-blue-700 text-white shadow"
                                    : "text-slate-500"
                                )}
                              >
                                {s}种植季
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* List */}
                      {Object.keys(groupedPlans).length > 0 ? (
                        <div className="space-y-5 pb-24">
                          <div className="flex items-center px-1">
                            <span className="text-[11px] font-bold text-slate-400">共 {filteredPlans.length} 条</span>
                          </div>

                          {Object.entries(groupedPlans).map(([crop, cropPlans]) => (
                            <div key={crop} className="space-y-1">
                               <div className="flex items-center gap-2 px-1 py-1">
                                  <div className="w-1 h-3.5 bg-blue-700 rounded-full" />
                                  <h4 className="text-[13px] font-bold text-slate-700">{crop}</h4>
                                  <span className="text-[10px] text-slate-400">{cropPlans.length}</span>
                               </div>
                               <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                                 {cropPlans.map((plan, idx) => (
                                   <button
                                     key={plan.id}
                                     onClick={() => setDetailPlan(plan)}
                                     className={cn(
                                       "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-slate-50",
                                       idx < cropPlans.length - 1 && "border-b border-slate-50"
                                     )}
                                   >
                                     <div className="flex-1 min-w-0">
                                       <p className="text-[13px] font-bold text-slate-800 truncate">
                                         {plan.crop} · {plan.variety}
                                         <span className="text-[11px] text-slate-400 font-medium ml-1">
                                           {(plan as any).varietyType || ''}
                                         </span>
                                       </p>
                                       <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                         {plan.details.reduce((s: number, d: any) => s + d.count, 0)}块 · {plan.details.reduce((s: number, d: any) => s + d.area, 0).toFixed(1)}亩 · {(plan as any).org || '—'}
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
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
                          <BookOpen size={40} className="opacity-20" />
                          <p className="text-[13px] font-bold">暂无{activeFilters.season}种植季规划</p>
                          <p className="text-[11px]">点击下方 + 新建</p>
                        </div>
                      )}

                      {/* FAB */}
                      <div className="fixed bottom-28 right-6 z-40">
                        <button
                          onClick={openAddModal}
                          className="w-16 h-16 bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-200 active:scale-90 transition-transform"
                        >
                          <Plus size={32} />
                        </button>
                      </div>
                   </div>
                ) : currentTab === 'recipe' ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                         <div className="flex-1 relative">
                           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                           <input
                              value={recipeSearch}
                              onChange={(e) => setRecipeSearch(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-medium"
                              placeholder="搜索配方名称、作物..."
                           />
                         </div>
                         <button onClick={() => setShowRecipeFilter(true)} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 active:scale-95">
                           <Filter size={18} />
                         </button>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 w-fit">
                        {['2026', '2025', '2024'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setActiveFilters(prev => ({ ...prev, season: s }))}
                            className={cn("px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap", activeFilters.season === s ? "bg-blue-700 text-white shadow" : "text-slate-500")}>
                            {s}种植季
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 pb-24">
                        {recipes.filter(r => {
                          if (recipeCropFilter !== '全部' && r.suitableCrop !== recipeCropFilter) return false;
                          if (recipeOpFilter !== '全部' && r.suitableOperation !== recipeOpFilter) return false;
                          if (recipeSearch && !r.name.includes(recipeSearch) && !r.suitableCrop.includes(recipeSearch) && !(r.suitableOperation && r.suitableOperation.includes(recipeSearch))) return false;
                          return true;
                        }).map((recipe) => (
                        <div
                          key={recipe.id}
                          className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm"
                        >
                          <button
                            onClick={() => setExpandedRecipeId(expandedRecipeId === recipe.id ? null : recipe.id)}
                            className="w-full p-5 text-left"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg">{recipe.suitableCrop}</span>
                                  <h4 className="text-[15px] font-bold text-slate-800 truncate">{recipe.name}</h4>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium">{recipe.suitableOperation || '通用'}</p>
                              </div>
                              <motion.div animate={{ rotate: expandedRecipeId === recipe.id ? 180 : 0 }} className="w-8 h-8 flex items-center justify-center text-slate-300 bg-slate-50 rounded-xl shrink-0 ml-3">
                                <ChevronDown size={18} />
                              </motion.div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {recipe.materials.map((m, idx) => (
                                <span key={idx} className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">{m.name}</span>
                              ))}
                              {recipe.waterUsage && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">需用水</span>}
                            </div>
                          </button>

                          <AnimatePresence>
                            {expandedRecipeId === recipe.id && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="px-5 pb-5 space-y-2">
                                  {recipe.materials.map((m, idx) => (
                                    <div key={idx} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
                                      <div>
                                        <span className="text-[9px] font-black text-slate-300 uppercase">{m.type || '投入品'}</span>
                                        <p className="text-[13px] font-bold text-slate-700">{m.name}</p>
                                      </div>
                                      <div className="text-right"><span className="text-[9px] text-slate-300 block">亩用量</span><span className="text-[13px] font-mono font-bold text-slate-800">{m.dosage}</span></div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="px-5 pb-4 flex items-center justify-end gap-2">
                             <button className="p-2 bg-slate-50 text-slate-300 rounded-xl border border-slate-100"><Trash2 size={15} /></button>
                             <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-[11px] font-bold border border-blue-100"><Edit2 size={14} className="inline mr-1" />编辑配方</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="fixed bottom-28 right-6 z-40">
                      <button onClick={() => setShowRecipeModal(true)} className="w-16 h-16 bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-200 active:scale-90 transition-transform"><Plus size={32} /></button>
                    </div>
                  </div>
                 ) : currentTab === 'report' ? (
                    <AgriculturalOperation />
                 ) : currentTab === 'input' ? (
                    <InputMaterialRecording />
                 ) : currentTab === 'estimate' ? (
                    <YieldEstimation />
                 ) : currentTab === 'yield' ? (
                    <YieldReporting />
                 ) : currentTab === 'personnel' ? (
                    <PersonnelRecords />
                 ) : currentTab === 'agrireport' ? (
                    <AgriReport />
                 ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center space-y-5">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                      {currentTabItem?.icon && <currentTabItem.icon size={36} className="text-slate-200" />}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-800">{currentTabLabel}</h4>
                      <p className="text-xs text-slate-400 mt-2 max-w-[220px] leading-relaxed">该功能模块正在接入农业数字化中台系统，请您稍后尝试访问或查看其他模块。</p>
                    </div>
                    <button 
                      onClick={() => navigate(-1)}
                      className="px-8 py-3 bg-slate-900 text-white rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-slate-200 transition-transform active:scale-95"
                    >
                      返回主菜单
                    </button>
                  </div>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Planning Modal */}
      <AnimatePresence>
         {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => { setShowAddModal(false); setEditingPlan(null); }}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
               />
               <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="relative w-full max-w-xl bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-auto max-h-[90vh]"
               >
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex flex-col">
                       <h3 className="text-[18px] font-bold text-slate-800">{editingPlan ? '修改种植规划' : '新建种植规划'}</h3>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Planting Plan</span>
                    </div>
                    <button onClick={() => { setShowAddModal(false); setEditingPlan(null); }} className="p-2 text-slate-400 active:bg-slate-50 rounded-full">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     {/* 组织 */}
                     <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-600 block"><span className="text-rose-500 mr-1">*</span>组织</label>
                        <div className="relative">
                          <button
                            onClick={() => setShowOrgPicker(!showOrgPicker)}
                            className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] text-slate-800 font-bold"
                          >
                            {planForm.org || '请选择组织'}
                            <ChevronDown size={14} className="opacity-40" />
                          </button>
                          {showOrgPicker && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-lg z-10 overflow-hidden">
                              {ORG_OPTIONS.map((o) => (
                                <button
                                  key={o}
                                  onClick={() => { setPlanForm((p) => ({ ...p, org: o })); setShowOrgPicker(false); }}
                                  className={cn(
                                    "w-full text-left px-4 py-3.5 text-[14px] font-bold active:bg-slate-50 transition-colors",
                                    planForm.org === o ? "text-blue-700 bg-blue-50/50" : "text-slate-700"
                                  )}
                                >
                                  {o}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                     </div>

                     {/* 作物选择 */}
                     <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-600 block"><span className="text-rose-500 mr-1">*</span>作物</label>
                        <div className="relative">
                          <button
                            onClick={() => setShowCropPicker(!showCropPicker)}
                            className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] text-slate-800 font-bold"
                          >
                            {planForm.crop || '请选择作物'}
                            <ChevronDown size={14} className="opacity-40" />
                          </button>
                          {showCropPicker && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-lg z-10 overflow-hidden">
                              {CROP_OPTIONS.map((c) => (
                                <button
                                  key={c}
                                  onClick={() => {
                                    setPlanForm((p) => ({ ...p, crop: c, variety: (VARIETY_OPTIONS[c] || [])[0] || '' }));
                                    setShowCropPicker(false);
                                  }}
                                  className={cn(
                                    "w-full text-left px-4 py-3.5 text-[14px] font-bold active:bg-slate-50 transition-colors",
                                    planForm.crop === c ? "text-blue-700 bg-blue-50/50" : "text-slate-700"
                                  )}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                     </div>

                     {/* 品种选择 */}
                     <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-600 block"><span className="text-rose-500 mr-1">*</span>品种</label>
                        <div className="relative">
                          <button
                            onClick={() => setShowVarietyPicker(!showVarietyPicker)}
                            className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] text-slate-800 font-bold"
                          >
                            {planForm.variety || '请选择品种'}
                            <ChevronDown size={14} className="opacity-40" />
                          </button>
                          {showVarietyPicker && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-lg z-10 overflow-hidden">
                              {(VARIETY_OPTIONS[planForm.crop] || []).map((v) => (
                                <button
                                  key={v}
                                  onClick={() => { setPlanForm((p) => ({ ...p, variety: v })); setShowVarietyPicker(false); }}
                                  className={cn(
                                    "w-full text-left px-4 py-3.5 text-[14px] font-bold active:bg-slate-50 transition-colors",
                                    planForm.variety === v ? "text-blue-700 bg-blue-50/50" : "text-slate-700"
                                  )}
                                >
                                  {v}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                     </div>

                     {/* 品种类型 */}
                     <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-600 block"><span className="text-rose-500 mr-1">*</span>品种类型</label>
                        <div className="flex gap-2">
                          {['新种', '复种'].map((t) => (
                            <button
                              key={t}
                              onClick={() => setPlanForm((p) => ({ ...p, varietyType: t }))}
                              className={cn(
                                "flex-1 py-3.5 rounded-2xl text-[14px] font-bold border transition-colors",
                                planForm.varietyType === t
                                  ? "bg-blue-700 text-white border-blue-700"
                                  : "bg-slate-50 text-slate-500 border-slate-100"
                              )}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                     </div>

                     {/* 种植地块 */}
                     <div className="pt-2 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                            <h4 className="text-[14px] font-bold text-slate-800">种植地块</h4>
                          </div>
                          <button
                            onClick={() => setShowPlotPicker(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white text-[11px] font-bold rounded-full shadow-lg shadow-blue-100 active:scale-95 transition-all"
                          >
                            <Plus size={14} /> 选择地块
                          </button>
                        </div>
                        {selectedPlots.length > 0 ? (
                          <div className="space-y-2">
                            {selectedPlots.map((plot) => (
                              <div key={plot.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-bold text-slate-800 truncate">{plot.name}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">{plot.crop || '—'} · {plot.area.toFixed(1)}亩</p>
                                </div>
                                <button
                                  onClick={() => setSelectedPlotIds((prev) => { const n = new Set(prev); n.delete(plot.id); return n; })}
                                  className="text-[10px] font-bold text-rose-500 ml-3 shrink-0"
                                >
                                  移除
                                </button>
                              </div>
                            ))}
                            <div className="text-right text-[11px] font-bold text-slate-500 pt-1">
                              共 {selectedPlots.length} 块 · 合计 {plotTotalArea.toFixed(1)} 亩
                            </div>
                          </div>
                        ) : (
                          <div className="py-10 border-2 border-dashed border-slate-100 rounded-[24px] flex flex-col items-center justify-center text-slate-300">
                            <Plus size={24} className="mb-1" />
                            <p className="text-[11px] font-bold">点击上方选择地块</p>
                          </div>
                        )}
                     </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center gap-4">
                     <button
                        onClick={handleSavePlan}
                        disabled={!planForm.crop || !planForm.variety}
                        className={cn(
                          "flex-1 py-4 rounded-2xl text-[14px] font-bold shadow-xl transition-all active:scale-[0.98]",
                          planForm.crop && planForm.variety
                            ? "bg-blue-700 text-white shadow-blue-200"
                            : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                        )}
                     >
                        {editingPlan ? '保存修改' : '保存规划记录'}
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Detail Bottom Sheet */}
      <AnimatePresence>
        {detailPlan && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailPlan(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[80vh]"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3" />
              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
                <div>
                  <h3 className="text-[16px] font-bold text-slate-800">种植规划详情</h3>
                </div>
                <button onClick={() => setDetailPlan(null)} className="p-1 text-slate-400">
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '作物', val: detailPlan.crop },
                    { label: '品种', val: detailPlan.variety },
                    { label: '品种类型', val: (detailPlan as any).varietyType || '—' },
                    { label: '组织', val: (detailPlan as any).org || '—' },
                    { label: '种植季', val: `${detailPlan.season}年` },
                  ].map((f) => (
                    <div key={f.label} className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400">{f.label}</span>
                      <p className="text-[13px] font-bold text-slate-800">{f.val}</p>
                    </div>
                  ))}
                </div>

                {/* Plot summary */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400">种植地块</span>
                  <div className="bg-slate-50 rounded-2xl p-4 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-slate-700">
                        {detailPlan.details.reduce((s: number, d: any) => s + d.count, 0)} 块
                      </span>
                      <span className="text-[16px] font-mono font-bold text-blue-700">
                        {detailPlan.details.reduce((s: number, d: any) => s + d.area, 0).toFixed(1)} 亩
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => { handleDeletePlan(detailPlan.id); setDetailPlan(null); }}
                  className="py-3 bg-slate-50 text-slate-500 rounded-xl text-[12px] font-bold border border-slate-100 active:bg-red-50 active:text-red-500 transition-colors"
                >
                  删除
                </button>
                <button
                  onClick={() => { setDetailPlan(null); handleEditPlan(detailPlan); }}
                  className="py-3 bg-blue-700 text-white rounded-xl text-[12px] font-bold active:bg-blue-800 transition-colors"
                >
                  修改
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Plot Picker — Map + Bottom List */}
      <AnimatePresence>
        {showPlotPicker && (
          <div className="fixed inset-0 z-[60] flex flex-col bg-white">
            <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowPlotPicker(false)} className="p-1 active:bg-slate-50 rounded-lg">
                  <X size={24} className="text-slate-400" />
                </button>
                <div className="flex flex-col">
                  <h3 className="text-[16px] font-bold text-slate-800">选择种植地块</h3>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Select Fields on Map</span>
                </div>
              </div>
              <button
                onClick={() => setShowPlotPicker(false)}
                className="px-6 py-2 bg-blue-700 text-white rounded-full text-xs font-bold"
              >
                完成选择 ({selectedPlotIds.size})
              </button>
            </header>

            <div className="flex-1 relative bg-slate-100 overflow-hidden">
               {/* Mock Map Background */}
               <div className="absolute inset-0 bg-[#e5e7eb] flex items-center justify-center">
                  <div className="w-full h-full relative opacity-50 overflow-hidden">
                    <div className="absolute left-[20%] top-[30%] w-32 h-24 bg-white/40 border border-white/60 skew-x-12 rotate-12" />
                    <div className="absolute left-[40%] top-[20%] w-48 h-32 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-full" />
                    <div className="absolute left-[10%] top-[60%] w-40 h-40 bg-blue-500/10 border-2 border-blue-500/20" />
                    <div className="absolute right-[20%] top-[40%] w-64 h-48 bg-slate-400/10 border-2 border-slate-400/20 rounded-[40px]" />
                  </div>
                  <div className="absolute flex flex-col items-center gap-2">
                    <MapIcon size={48} className="text-slate-300 animate-pulse" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Map Layer Loading...</p>
                  </div>
               </div>

               {/* Plot Markers on Map */}
               <div className="absolute inset-0 p-10">
                  {(() => {
                    const orgPlots = mockMapPlots.filter(p => p.farm === planForm.org);
                    return orgPlots.map((plot, idx) => {
                      const isSelected = selectedPlotIds.has(plot.id);
                      return (
                        <button
                          key={plot.id}
                          onClick={() => {
                            setSelectedPlotIds(prev => {
                              const next = new Set(prev);
                              if (next.has(plot.id)) { next.delete(plot.id); }
                              else { next.add(plot.id); }
                              return next;
                            });
                          }}
                          style={{
                            left: `${20 + (idx % 4) * 18}%`,
                            top: `${25 + Math.floor(idx / 4) * 22}%`
                          }}
                          className={cn(
                            "absolute p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 shadow-lg active:scale-95 group",
                            isSelected
                              ? "bg-blue-700 border-white text-white scale-110"
                              : "bg-white border-blue-500/20 text-slate-600 hover:border-blue-500"
                          )}
                        >
                           <MapIcon size={20} className={isSelected ? "text-white" : "text-blue-500"} />
                           <span className="text-[10px] font-bold whitespace-nowrap">{plot.name.length > 8 ? plot.name.slice(0,8)+'…' : plot.name}</span>
                           <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <PlusCircle size={14} className="text-white" />
                           </div>
                        </button>
                      );
                    });
                  })()}
               </div>

               {/* Map Label */}
               <div className="absolute bottom-40 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/80 backdrop-blur rounded-full text-white text-[10px] font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  当前定位：{planForm.org}
               </div>

               {/* Bottom List */}
               <div className="absolute bottom-0 left-0 right-0 max-h-[45%] bg-white rounded-t-[40px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col">
                  <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto my-3" />
                  <div className="px-6 flex items-center justify-between">
                     <div className="flex flex-col">
                        <h4 className="text-[14px] font-bold text-slate-800">全部地块列表</h4>
                        <span className="text-[10px] text-slate-400 font-bold">地块范围：{planForm.org}</span>
                     </div>
                     <span className="text-[10px] bg-slate-50 px-3 py-1 rounded-full text-slate-400 font-bold">
                        共 {mockMapPlots.filter(p => p.farm === planForm.org).length} 个
                     </span>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 pb-8">
                     {mockMapPlots.filter(p => p.farm === planForm.org).map(plot => {
                       const isSelected = selectedPlotIds.has(plot.id);
                       return (
                         <div
                          key={plot.id}
                          onClick={() => {
                            setSelectedPlotIds(prev => {
                              const next = new Set(prev);
                              if (next.has(plot.id)) { next.delete(plot.id); }
                              else { next.add(plot.id); }
                              return next;
                            });
                          }}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                            isSelected
                               ? "bg-blue-50 border-blue-200"
                               : "bg-white border-slate-50 hover:border-slate-100"
                          )}
                         >
                            <div className="space-y-0.5">
                               <div className="flex items-center gap-2">
                                  <h5 className={cn("text-[13px] font-bold", isSelected ? "text-blue-700" : "text-slate-800")}>{plot.name}</h5>
                                  <span className="text-[10px] text-slate-400 font-mono font-bold leading-none">{plot.code || plot.id}</span>
                               </div>
                               <p className="text-[10px] text-slate-400 font-bold">{planForm.org}</p>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="text-right">
                                  <span className={cn("text-[14px] font-mono font-bold", isSelected ? "text-blue-600" : "text-slate-600")}>{plot.area.toFixed(1)}</span>
                                  <span className="text-[10px] text-slate-300 font-bold ml-1">亩</span>
                               </div>
                               <div className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                  isSelected ? "bg-blue-700 text-white" : "bg-slate-50 text-slate-200"
                               )}>
                                  {isSelected ? <X size={14} /> : <Plus size={14} />}
                               </div>
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

      {/* Add Recipe Modal */}
      <AnimatePresence>
         {showRecipeModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowRecipeModal(false)}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
               />
               <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="relative w-full max-w-xl bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-auto max-h-[90vh]"
               >
                  {/* Modal Header */}
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex flex-col">
                       <h3 className="text-[18px] font-bold text-slate-800">新增农艺配方</h3>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Agronomic Recipe Builder</span>
                    </div>
                    <button onClick={() => setShowRecipeModal(false)} className="p-2 text-slate-400 active:bg-slate-50 rounded-full transition-colors">
                      <X size={24} />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     <AnimatePresence mode="wait">
                        {!selectingMaterialType ? (
                           <motion.div 
                              key="form"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="space-y-6"
                           >
                              {/* Recipe Name */}
                              <div className="space-y-1.5">
                                 <label className="text-[12px] font-bold text-slate-600 block pl-1">
                                    <span className="text-rose-500 mr-1">*</span>配方名称
                                 </label>
                                 <input 
                                    value={newRecipeName} 
                                    onChange={(e) => setNewRecipeName(e.target.value)} 
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[15px] text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 placeholder-slate-300 transition-all shadow-inner"
                                    placeholder="请输入配方名称，如：大豆初花期追肥"
                                 />
                              </div>

                              {/* Main Selectors */}
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-slate-600 block pl-1">适合作物</label>
                                    <div className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] text-slate-800 font-bold transition-all active:bg-slate-100/50 cursor-pointer">
                                       <span>选择作物</span>
                                       <ChevronDown size={14} className="opacity-40" />
                                    </div>
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-slate-600 block pl-1">适用作业</label>
                                    <div className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] text-slate-800 font-bold transition-all active:bg-slate-100/50 cursor-pointer">
                                       <span>选择作业</span>
                                       <ChevronDown size={14} className="opacity-40" />
                                    </div>
                                 </div>
                              </div>

                              {/* Material Sections */}
                              {[
                                 { id: 'seed', type: '种子' },
                                 { id: 'fertilizer', type: '肥料' },
                                 { id: 'pesticide', type: '农药' },
                              ].map((section) => (
                                 <div key={section.id} className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                                          <span className="text-[15px] font-bold text-slate-800">含{section.type}</span>
                                       </div>
                                       <button 
                                          onClick={() => setSelectingMaterialType(section.type)}
                                          className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-blue-600 px-4 py-2 rounded-full shadow-lg shadow-blue-100 active:scale-95 transition-all"
                                       >
                                          <Plus size={14} /> 新增
                                       </button>
                                    </div>

                                    <div className="space-y-3">
                                       {selectedMaterials[section.id].length > 0 ? (
                                          selectedMaterials[section.id].map((m) => (
                                             <div key={m.id} className="bg-slate-100/30 border border-slate-100 rounded-[28px] p-5 space-y-4 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                   <span className="text-[14px] font-bold text-slate-800">{m.name}</span>
                                                   <button 
                                                      onClick={() => setSelectedMaterials(prev => ({
                                                         ...prev,
                                                         [section.id]: prev[section.id].filter(mat => mat.id !== m.id)
                                                      }))}
                                                      className="text-[11px] font-bold text-rose-500 uppercase tracking-wider"
                                                   >
                                                      删除
                                                   </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                   <div className="space-y-1.5">
                                                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">亩用量</span>
                                                      <input 
                                                         value={m.dosage}
                                                         onChange={(e) => {
                                                            const val = e.target.value;
                                                            setSelectedMaterials(prev => ({
                                                               ...prev,
                                                               [section.id]: prev[section.id].map(item => item.id === m.id ? { ...item, dosage: val } : item)
                                                            }));
                                                         }}
                                                         className="w-full bg-white border border-slate-100 px-4 py-3.5 rounded-2xl text-[14px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-mono"
                                                         placeholder="如: 3~5kg/亩"
                                                      />
                                                   </div>
                                                   <div className="space-y-1.5">
                                                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">预估单价</span>
                                                      <input 
                                                         value={m.unitPrice}
                                                         onChange={(e) => {
                                                            const val = e.target.value;
                                                            setSelectedMaterials(prev => ({
                                                               ...prev,
                                                               [section.id]: prev[section.id].map(item => item.id === m.id ? { ...item, unitPrice: val } : item)
                                                            }));
                                                         }}
                                                         className="w-full bg-white border border-slate-100 px-4 py-3.5 rounded-2xl text-[14px] font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-mono"
                                                         placeholder="元/kg"
                                                      />
                                                   </div>
                                                </div>
                                             </div>
                                          ))
                                       ) : (
                                          <div className="py-8 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center text-center space-y-2 bg-slate-50/50 opacity-60">
                                             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-200">
                                                <Plus size={20} />
                                             </div>
                                             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">暂无{section.type}信息</p>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              ))}

                              {/* Water Usage */}
                              <div className="space-y-3 pt-2">
                                 <label className="text-[12px] font-bold text-slate-600 block pl-1">用水量补充 (可选)</label>
                                 <div className="p-5 bg-slate-100/30 border border-slate-100 rounded-[28px] space-y-4 shadow-inner">
                                    <div className="grid grid-cols-2 gap-4">
                                       <div className="space-y-1.5">
                                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">亩用量</span>
                                          <input 
                                             value={waterUsage.dosage}
                                             onChange={(e) => setWaterUsage(prev => ({ ...prev, dosage: e.target.value }))}
                                             className="w-full px-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-[14px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 placeholder-slate-200 font-mono"
                                             placeholder="吨/亩"
                                          />
                                       </div>
                                       <div className="space-y-1.5">
                                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">单价</span>
                                          <input 
                                             value={waterUsage.unitPrice}
                                             onChange={(e) => setWaterUsage(prev => ({ ...prev, unitPrice: e.target.value }))}
                                             className="w-full px-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-[14px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 placeholder-slate-200 font-mono"
                                             placeholder="元/吨"
                                          />
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              {/* Description */}
                              <div className="space-y-1.5 pt-2">
                                 <label className="text-[12px] font-bold text-slate-600 block pl-1">配方备注信息</label>
                                 <textarea 
                                    rows={4}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[28px] text-[14px] text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 placeholder-slate-300 resize-none shadow-inner"
                                    placeholder="请输入施用注意事项、建议环境等..."
                                 />
                              </div>
                           </motion.div>
                        ) : (
                           <motion.div 
                              key="selector"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="space-y-6"
                           >
                              <div className="flex items-center gap-3">
                                 <button onClick={() => setSelectingMaterialType(null)} className="p-2 bg-slate-50 rounded-xl text-slate-400 active:scale-90 transition-transform">
                                    <ArrowLeft size={20} />
                                 </button>
                                 <div className="flex flex-col">
                                    <h4 className="text-[16px] font-bold text-slate-800">选择{selectingMaterialType}</h4>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Select Sub-material</span>
                                 </div>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3">
                                 {[1, 2, 3, 4, 5].map((i) => {
                                    const typeId = selectingMaterialType === '种子' ? 'seed' : selectingMaterialType === '肥料' ? 'fertilizer' : 'pesticide';
                                    const isSelected = selectedMaterials[typeId].some(m => m.id === `${typeId}-${i}`);
                                    return (
                                       <button 
                                          key={i}
                                          onClick={() => {
                                             setSelectedMaterials(prev => {
                                                const current = prev[typeId];
                                                const exists = current.find(m => m.id === `${typeId}-${i}`);
                                                if (exists) {
                                                   return { ...prev, [typeId]: current.filter(m => m.id !== `${typeId}-${i}`) };
                                                } else {
                                                   return { ...prev, [typeId]: [...current, { id: `${typeId}-${i}`, name: `${selectingMaterialType}规格样品 00${i}`, dosage: '3~5kg/亩', unitPrice: '28' }] };
                                                }
                                             });
                                             setSelectingMaterialType(null);
                                          }}
                                          className={cn(
                                             "flex items-center justify-between p-5 rounded-[28px] border transition-all active:scale-[0.98]",
                                             isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100 hover:border-slate-200"
                                          )}
                                       >
                                          <div className="text-left">
                                             <h5 className={cn("text-[15px] font-bold", isSelected ? "text-blue-700" : "text-slate-800")}>
                                                {selectingMaterialType}规格样品 00{i}
                                             </h5>
                                             <span className="text-[10px] text-slate-400 font-bold uppercase">Specs ID: {typeId.toUpperCase()}-{i}</span>
                                          </div>
                                          <div className={cn(
                                             "w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm",
                                             isSelected ? "bg-blue-700 text-white" : "bg-slate-50 text-slate-200"
                                          )}>
                                             {isSelected ? <X size={16} /> : <Plus size={16} />}
                                          </div>
                                       </button>
                                    );
                                 })}
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center gap-4">
                     <button 
                        onClick={handleSaveRecipe}
                        disabled={!newRecipeName}
                        className={cn(
                           "flex-1 py-4 rounded-2xl text-[15px] font-bold shadow-xl transition-all active:scale-[0.98]",
                           newRecipeName 
                              ? "bg-blue-700 text-white shadow-blue-100" 
                              : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                        )}
                     >
                        确认发布农艺配方
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Side Filter Drawer */}
      <AnimatePresence>
        {showFilterDrawer && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterDrawer(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-80 bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="text-[16px] font-bold text-slate-800">
                    {currentFilterTab === 'crop' ? '选择作物' : 
                     currentFilterTab === 'mode' ? '选择模式' : 
                     currentFilterTab === 'org' ? '选择组织' : '条件筛选'}
                  </h3>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Filter Options</span>
                </div>
                <button 
                  onClick={() => setShowFilterDrawer(false)}
                  className="p-2 text-slate-400 active:bg-slate-50 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">选择作物</label>
                  <div className="flex flex-wrap gap-2">
                    {['全部作物', ...CROP_OPTIONS].map((item) => (
                      <button
                        key={item}
                        onClick={() => setPlanCropFilter(item)}
                        className={cn(
                          "px-4 py-2 rounded-xl border text-xs font-bold transition-colors",
                          planCropFilter === item
                            ? "bg-blue-700 text-white border-blue-700"
                            : "border-slate-100 text-slate-600 hover:border-blue-200"
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">组织架构</label>
                  <div className="space-y-2">
                    {(user.orgFilter ? [user.orgFilter] : ['全部农场', ...ORG_OPTIONS]).map((item) => (
                      <button
                        key={item}
                        onClick={() => setPlanOrgFilter(item)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border text-xs font-bold transition-colors",
                          planOrgFilter === item
                            ? "bg-blue-700 text-white border-blue-700"
                            : "bg-slate-50 border-slate-100 text-slate-600"
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setPlanCropFilter('全部作物'); setPlanOrgFilter('全部农场'); }}
                  className="py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold active:scale-95 transition-all"
                >
                  重置
                </button>
                <button
                  onClick={() => setShowFilterDrawer(false)}
                  className="py-3 bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all"
                >
                  确定
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recipe Filter Drawer */}
      <AnimatePresence>
        {showRecipeFilter && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRecipeFilter(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="relative w-80 bg-white h-full shadow-2xl flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-slate-800">条件筛选</h3>
                <button onClick={() => setShowRecipeFilter(false)} className="p-2 text-slate-400"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">选择作物</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['全部', ...CROP_OPTIONS].map(c => (
                      <button key={c} onClick={() => setRecipeCropFilter(c)}
                        className={cn("py-3 px-4 rounded-xl text-xs font-bold border transition-colors", recipeCropFilter === c ? "bg-blue-700 text-white border-blue-700" : "bg-slate-50 border-slate-100 text-slate-600")}>{c}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">适用作业</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['全部', '播种', '施肥', '田间管理', '植保'].map(o => (
                      <button key={o} onClick={() => setRecipeOpFilter(o)}
                        className={cn("py-3 px-4 rounded-xl text-xs font-bold border transition-colors", recipeOpFilter === o ? "bg-blue-700 text-white border-blue-700" : "bg-slate-50 border-slate-100 text-slate-600")}>{o}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 gap-3">
                <button onClick={() => { setRecipeCropFilter('全部'); setRecipeOpFilter('全部'); }} className="py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold">重置</button>
                <button onClick={() => setShowRecipeFilter(false)} className="py-3 bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100">确定</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
