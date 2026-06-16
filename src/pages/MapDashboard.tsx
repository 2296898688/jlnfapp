/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import {
  ArrowLeft,
  AlertTriangle,
  SlidersHorizontal,
  RotateCcw,
  Layers,
  ChevronUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { useUser } from '../UserContext';
import { mockDevices, mockMapPlots, mockFarms, mockPlotOperations, mockLandAnalysis, mockCropAnalysis, mockLandCompanyAnalysis } from '../mockData';
import { Device, MapPlot, Farm, UserRole, FieldOperation } from '../types';
import SatelliteMap from '../components/SatelliteMap';
import WeatherHeatmap, { WeatherMetric } from '../components/WeatherHeatmap';

/* ═══════════════════════════════ 辅助 ═══════════════════════════════ */

const PLOT_COLORS: Record<string, string> = {
  ZONGDI: '#4B7B73',
  HIGH_STANDARD: '#2D9F7A',
  SALINE_ALKALI: '#E8A838',
  LEASING: '#7A9E8F',
};

const LAYER_META: { id: LandLayer; label: string; color: string }[] = [
  { id: 'ZONGDI', label: '宗地', color: PLOT_COLORS.ZONGDI },
  { id: 'HIGH_STANDARD', label: '高标准', color: PLOT_COLORS.HIGH_STANDARD },
  { id: 'SALINE_ALKALI', label: '盐碱地', color: PLOT_COLORS.SALINE_ALKALI },
];

type MainTab = 'land' | 'crops' | 'iot';
type LandLayer = 'ZONGDI' | 'HIGH_STANDARD' | 'SALINE_ALKALI';
type CropLayer = '统种' | '承租';

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: 'land', label: '土地资源' },
  { id: 'crops', label: '种植分布' },
  { id: 'iot', label: '智能感知' },
];

const CROP_LAYER_META: { id: CropLayer; label: string; color: string }[] = [
  { id: '统种', label: '统种地', color: PLOT_COLORS.LEASING },
  { id: '承租', label: '承租地', color: '#C4A27C' },
];

/** 根据角色返回初始可见图层 */
function getDefaultLayers(role: UserRole): Set<LandLayer> {
  if (role === 'NONGKEN_ADMIN') {
    return new Set(['ZONGDI'] as LandLayer[]);
  }
  // 土地资源公司只关注高标准农田和盐碱地
  if (role === 'LAND_COMPANY_ADMIN') {
    return new Set(['HIGH_STANDARD', 'SALINE_ALKALI'] as LandLayer[]);
  }
  return new Set(['ZONGDI', 'HIGH_STANDARD', 'SALINE_ALKALI'] as LandLayer[]);
}

/** 根据角色返回可用的图层列表 */
function getAvailableLayers(role: UserRole): { id: LandLayer; label: string; color: string }[] {
  if (role === 'NONGKEN_ADMIN') {
    return LAYER_META.filter(l => l.id === 'ZONGDI');
  }
  // 土地资源公司不显示宗地图层
  if (role === 'LAND_COMPANY_ADMIN') {
    return LAYER_META.filter(l => l.id !== 'ZONGDI');
  }
  return LAYER_META;
}

/** 根据角色返回可用的顶部 Tab */
function getAvailableTabs(role: UserRole): { id: MainTab; label: string }[] {
  if (role === 'LAND_COMPANY_ADMIN') {
    return MAIN_TABS.filter(t => t.id !== 'crops');
  }
  return MAIN_TABS;
}

function getDefaultCropLayers(): Set<CropLayer> {
  return new Set(['统种', '承租'] as CropLayer[]);
}

/* ═══════════════════════════════ 主页 ═══════════════════════════════ */

export default function MapDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();

  // ─── 状态 ───
  // ─── 权限过滤 ───
  const isLandCompany = user.role === 'LAND_COMPANY_ADMIN';
  const baseFarms = user.orgFilter ? mockFarms.filter(f => f.name === user.orgFilter || f.id === 'all') : isLandCompany ? mockFarms : mockFarms.filter(f => !['f4','f5','f6'].includes(f.id));
  const filteredFarms = baseFarms;
  const filteredPlots = user.orgFilter ? mockMapPlots.filter(p => p.farm === user.orgFilter) : isLandCompany ? mockMapPlots : mockMapPlots.filter(p => !['洮南农场','大安农场','通榆农场'].includes(p.farm));
  const filteredDevices = user.orgFilter ? mockDevices.filter(d => d.deviceInfo?.farm === user.orgFilter) : isLandCompany ? mockDevices : mockDevices.filter(d => !['洮南农场','大安农场','通榆农场'].includes(d.deviceInfo?.farm || ''));

  const [selectedFarm, setSelectedFarm] = useState<Farm>(filteredFarms[0]);

  const [activeTab, setActiveTab] = useState<MainTab>('land');
  const [visibleLayers, setVisibleLayers] = useState<Set<LandLayer>>(getDefaultLayers(user.role));
  const [visibleCropLayers, setVisibleCropLayers] = useState<Set<CropLayer>>(getDefaultCropLayers());

  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<MapPlot | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  const [detailExpanded, setDetailExpanded] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(false);
  // ─── 气象图层 ───
  const [showWeatherLayer, setShowWeatherLayer] = useState(false);
  const [weatherMetric, setWeatherMetric] = useState<WeatherMetric>('temp');
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // ─── 设备筛选 ───
  const [iotTypeFilter, setIotTypeFilter] = useState('ALL');
  const [iotCodeFilter, setIotCodeFilter] = useState('');
  const [iotNameFilter, setIotNameFilter] = useState('');

  // ─── 筛选条件 ───
  // 宗地
  const [filterVersion, setFilterVersion] = useState('');
  const [filterAttribution, setFilterAttribution] = useState('');
  const [filterFarm, setFilterFarm] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [filterName, setFilterName] = useState('');
  // 高标准
  const [hsRegion, setHsRegion] = useState('');
  const [hsRenovation, setHsRenovation] = useState('');
  const [hsPlanYear, setHsPlanYear] = useState('');
  const [hsBuildYear, setHsBuildYear] = useState('');
  const [hsName, setHsName] = useState('');
  const [hsCode, setHsCode] = useState('');
  // 盐碱地
  const [saRegion, setSaRegion] = useState('');
  const [saLevel, setSaLevel] = useState('');
  const [saType, setSaType] = useState('');
  const [saName, setSaName] = useState('');
  const [saCode, setSaCode] = useState('');

  const resetFilters = () => {
    setFilterVersion(''); setFilterAttribution(''); setFilterFarm('');
    setFilterRegion(''); setFilterCode(''); setFilterName('');
    setHsRegion(''); setHsRenovation(''); setHsPlanYear('');
    setHsBuildYear(''); setHsName(''); setHsCode('');
    setSaRegion(''); setSaLevel(''); setSaType(''); setSaName(''); setSaCode('');
    setVisibleLayers(getDefaultLayers(user.role));
    setVisibleCropLayers(getDefaultCropLayers());
    setIotTypeFilter('ALL'); setIotCodeFilter(''); setIotNameFilter('');
  };

  const [filterDraft, setFilterDraft] = useState<any>(null);
  const snapDraft = (): any => ({ filterVersion, filterAttribution, filterFarm, filterRegion, filterCode, filterName, hsRegion, hsRenovation, hsPlanYear, hsBuildYear, hsName, hsCode, saRegion, saLevel, saType, saName, saCode, iotTypeFilter, iotCodeFilter, iotNameFilter, cropLayers: new Set(visibleCropLayers) });
  const initDraft = () => setFilterDraft(snapDraft());
  const applyDraft = () => { if (!filterDraft) return; const d = filterDraft; setFilterVersion(d.filterVersion); setFilterAttribution(d.filterAttribution); setFilterFarm(d.filterFarm); setFilterRegion(d.filterRegion); setFilterCode(d.filterCode); setFilterName(d.filterName); setHsRegion(d.hsRegion); setHsRenovation(d.hsRenovation); setHsPlanYear(d.hsPlanYear); setHsBuildYear(d.hsBuildYear); setHsName(d.hsName); setHsCode(d.hsCode); setSaRegion(d.saRegion); setSaLevel(d.saLevel); setSaType(d.saType); setSaName(d.saName); setSaCode(d.saCode); setIotTypeFilter(d.iotTypeFilter); setIotCodeFilter(d.iotCodeFilter); setIotNameFilter(d.iotNameFilter); setVisibleCropLayers(d.cropLayers); setFilterDraft(null); setShowFilter(false); setFilterExpanded(false); };
  const resetDraft = () => setFilterDraft({ filterVersion: '', filterAttribution: '', filterFarm: '', filterRegion: '', filterCode: '', filterName: '', hsRegion: '', hsRenovation: '', hsPlanYear: '', hsBuildYear: '', hsName: '', hsCode: '', saRegion: '', saLevel: '', saType: '', saName: '', saCode: '', iotTypeFilter: 'ALL', iotCodeFilter: '', iotNameFilter: '', cropLayers: getDefaultCropLayers() });

  // ─── 切换 Tab 时重置面板 ───
  const switchTab = (tab: MainTab) => {
    // 土地公司无种植分布
    if (tab === 'crops' && user.role === 'LAND_COMPANY_ADMIN') return;
    setActiveTab(tab);
    setPanelOpen(false);
    setSelectedPlot(null);
    setSelectedDevice(null);
    setDetailExpanded(false);
    setFilterExpanded(false);
    setShowWeatherLayer(false);
  };

  // ─── 图层开关 ───
  const toggleLayer = (layer: LandLayer) => {
    setVisibleLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) {
        if (next.size > 1) next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  };

  const toggleCropLayer = (layer: CropLayer) => {
    setVisibleCropLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) {
        if (next.size > 1) next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  };

  // ─── 按农场过滤基础集 ───
  const farmPlots = filteredPlots.filter(
    (p) => selectedFarm.id === 'all' || p.farm === selectedFarm.name,
  );
  const farmDevices = filteredDevices.filter(
    (d) => selectedFarm.id === 'all' || d.deviceInfo?.farm === selectedFarm.name,
  );

  // ─── 按 Tab 过滤 ───
  const landPlots = farmPlots.filter((p) => {
    if (!visibleLayers.has(p.type as LandLayer)) return false;
    // 宗地筛选
    if (p.type === 'ZONGDI') {
      if (filterVersion && p.version !== filterVersion) return false;
      if (filterAttribution && p.attribution !== filterAttribution) return false;
      if (filterFarm && p.farm !== filterFarm) return false;
      if (filterRegion && !(p.region || '').includes(filterRegion)) return false;
      if (filterCode && !(p.code || '').includes(filterCode)) return false;
      if (filterName && !p.name.includes(filterName)) return false;
    }
    // 高标准筛选
    if (p.type === 'HIGH_STANDARD') {
      if (hsRegion && !(p.region || '').includes(hsRegion)) return false;
      if (hsRenovation && p.renovationStatus !== hsRenovation) return false;
      if (hsPlanYear && p.planYear !== hsPlanYear) return false;
      if (hsBuildYear && p.buildYear !== hsBuildYear) return false;
      if (hsName && !p.name.includes(hsName)) return false;
      if (hsCode && !(p.code || '').includes(hsCode)) return false;
    }
    // 盐碱地筛选
    if (p.type === 'SALINE_ALKALI') {
      if (saRegion && !(p.region || '').includes(saRegion)) return false;
      if (saLevel && p.salineLevel !== saLevel) return false;
      if (saType && p.salineType !== saType) return false;
      if (saName && !p.name.includes(saName)) return false;
      if (saCode && !(p.code || '').includes(saCode)) return false;
    }
    return true;
  });
  const cropPlots = farmPlots.filter((p) => {
    if (p.type !== 'LEASING') return false;
    if (!visibleCropLayers.has(p.leaseType as CropLayer)) return false;
    return true;
  });
  const iotDevices = farmDevices.filter((d) => {
    if (iotTypeFilter !== 'ALL' && d.type !== iotTypeFilter) return false;
    if (iotCodeFilter && !(d.id || '').includes(iotCodeFilter)) return false;
    if (iotNameFilter && !d.name.includes(iotNameFilter)) return false;
    return true;
  });

  // ─── 地图数据 ───
  const mapPlots = activeTab === 'land' ? landPlots : activeTab === 'crops' ? cropPlots : [];
  const mapDevices = activeTab === 'iot' ? iotDevices : [];

  // ─── 统计 ───
  const layerStats = {
    ZONGDI: farmPlots.filter((p) => p.type === 'ZONGDI').length,
    HIGH_STANDARD: farmPlots.filter((p) => p.type === 'HIGH_STANDARD').length,
    SALINE_ALKALI: farmPlots.filter((p) => p.type === 'SALINE_ALKALI').length,
    LEASING: farmPlots.filter((p) => p.type === 'LEASING').length,
  };
  const deviceStats = {
    total: farmDevices.length,
    online: farmDevices.filter((d) => d.status === 'ONLINE').length,
    fault: farmDevices.filter((d) => d.status === 'FAULT').length,
  };

  // ─── 土地分析动态数据 ───
  const landPlotsForStats = farmPlots.filter(p => p.type !== 'LEASING');
  const muByType: Record<string, number> = {}; const cntByType: Record<string, number> = {};
  landPlotsForStats.forEach(p => { muByType[p.type] = (muByType[p.type] || 0) + (p.area || 0); cntByType[p.type] = (cntByType[p.type] || 0) + 1; });
  const zMu = (muByType.ZONGDI || 0) / 10000, hMu = (muByType.HIGH_STANDARD || 0) / 10000, sMu = (muByType.SALINE_ALKALI || 0) / 10000;
  const landMu = zMu + hMu + sMu;
  const confirmRate = landMu > 0 ? Math.min(100, Math.round((zMu * 0.85 + hMu * 0.9 + sMu * 0.4) / landMu * 100)) : 0;
  const isFarmView = selectedFarm.id !== 'all';
  const farmLabel = isFarmView ? selectedFarm.name : '全集团';
  const landStats = {
    farmLabel, isFarmView,
    totalArea: landMu.toFixed(1), confirmedArea: (landMu * confirmRate / 100).toFixed(1), unconfirmedArea: (landMu * (100 - confirmRate) / 100).toFixed(1), confirmRate,
    rightsDistribution: [{ label: '已发证', value: 44.3, pct: 13.7, color: '#0D665E' }, { label: '已登记未发证', value: 54.7, pct: 16.9, color: '#2D9F7A' }, { label: '已确权未登记', value: 32.2, pct: 9.9, color: '#E8A838' }, { label: '未确权', value: 192.8, pct: 59.5, color: '#CBD5E1' }],
    landUse: [{ pct: landMu > 0 ? Math.round(zMu / landMu * 100) : 40, color: '#4B7B73', label: '宗地' }, { pct: landMu > 0 ? Math.round(hMu / landMu * 100) : 35, color: '#2D9F7A', label: '高标准农田' }, { pct: landMu > 0 ? Math.round(sMu / landMu * 100) : 25, color: '#E8A838', label: '盐碱地' }],
    farmLandTypes: isFarmView ? [] : [{ farm: '白城牧场', 耕地: 42, 草地: 30, 其他: 18, 建设用地: 10 }, { farm: '镇南种羊场', 耕地: 38, 草地: 32, 其他: 20, 建设用地: 10 }, { farm: '长岭种马场', 耕地: 45, 草地: 25, 其他: 15, 建设用地: 15 }, ...(isLandCompany ? [{ farm: '洮南农场', 耕地: 48, 草地: 22, 其他: 18, 建设用地: 12 }, { farm: '大安农场', 耕地: 40, 草地: 28, 其他: 22, 建设用地: 10 }, { farm: '通榆农场', 耕地: 44, 草地: 26, 其他: 16, 建设用地: 14 }] : [])],
    farmRights: isFarmView ? [] : [{ farm: '白城牧场', 已发证: 16.2, 已登记未发证: 18.5, 已确权未登记: 10.1, 未确权: 62.3 }, { farm: '镇南种羊场', 已发证: 14.1, 已登记未发证: 20.2, 已确权未登记: 12.1, 未确权: 65.2 }, { farm: '长岭种马场', 已发证: 14.0, 已登记未发证: 16.0, 已确权未登记: 10.0, 未确权: 65.3 }, ...(isLandCompany ? [{ farm: '洮南农场', 已发证: 12.5, 已登记未发证: 15.8, 已确权未登记: 8.5, 未确权: 68.6 }, { farm: '大安农场', 已发证: 13.8, 已登记未发证: 17.2, 已确权未登记: 9.8, 未确权: 64.3 }, { farm: '通榆农场', 已发证: 15.1, 已登记未发证: 14.5, 已确权未登记: 11.2, 未确权: 63.9 }] : [])],
    regionRights: isFarmView ? [] : [{ region: '洮北区', pct: 38 }, { region: '长岭县', pct: 18 }, { region: '洮南市', pct: 16 }, { region: '大安市', pct: 14 }, { region: '通榆县', pct: 14 }],
    totalHighStandard: Math.round(muByType.HIGH_STANDARD || 0),
    highStandardByFarm: isFarmView
      ? [{ farm: farmLabel, area: Math.round(muByType.HIGH_STANDARD || 0), plots: cntByType.HIGH_STANDARD || 0, color: '#0D665E' }]
      : [
          { farm: '白城牧场', area: 5684, plots: 2, color: '#0D665E' },
          { farm: '镇南种羊场', area: 3201, plots: 1, color: '#2D9F7A' },
          { farm: '长岭种马场', area: 4641, plots: 2, color: '#4B7B73' },
          ...(isLandCompany ? [
            { farm: '洮南农场', area: 3860, plots: 1, color: '#0891B2' },
            { farm: '大安农场', area: 4250, plots: 1, color: '#7C3AED' },
            { farm: '通榆农场', area: 3980, plots: 1, color: '#DB2777' },
          ] : []),
        ],
    totalSaline: Math.round(muByType.SALINE_ALKALI || 0),
    salineByLevel: [{ level: '轻度盐碱地', area: Math.round((muByType.SALINE_ALKALI || 0) * 0.55), color: '#FCD34D' }, { level: '中度盐碱地', area: Math.round((muByType.SALINE_ALKALI || 0) * 0.35), color: '#F59E0B' }, { level: '重度盐碱地', area: Math.round((muByType.SALINE_ALKALI || 0) * 0.10), color: '#DC2626' }],
    salineByType: [{ type: '苏打盐碱地', area: Math.round((muByType.SALINE_ALKALI || 0) * 0.6), color: '#E8A838' }, { type: '氯化物盐碱地', area: Math.round((muByType.SALINE_ALKALI || 0) * 0.4), color: '#C4A27C' }],
    salineByFarm: isFarmView
      ? [{ farm: farmLabel, area: Math.round(muByType.SALINE_ALKALI || 0), color: '#E8A838' }]
      : [
          { farm: '白城牧场', area: 5230, color: '#E8A838' },
          { farm: '镇南种羊场', area: 3845, color: '#D97706' },
          { farm: '长岭种马场', area: 4900, color: '#DC2626' },
          ...(isLandCompany ? [
            { farm: '洮南农场', area: 3560, color: '#F59E0B' },
            { farm: '大安农场', area: 4820, color: '#7C3AED' },
            { farm: '通榆农场', area: 5120, color: '#DB2777' },
          ] : []),
        ],
  };

  // ─── 种植分析动态数据 ───
  const cropAnalysisData = {
    ...mockCropAnalysis,
    isFarmView,
    farmLabel,
    farmLeaseRatio: isFarmView ? mockCropAnalysis.farmLeaseRatio.filter((f: any) => f.farm === selectedFarm.name) : mockCropAnalysis.farmLeaseRatio,
    farmProgress: {
      ...mockCropAnalysis.farmProgress,
      data: isFarmView ? mockCropAnalysis.farmProgress.data.filter((f: any) => f.farm === selectedFarm.name) : mockCropAnalysis.farmProgress.data,
    },
    farmInput: {
      ...mockCropAnalysis.farmInput,
      data: isFarmView ? mockCropAnalysis.farmInput.data.filter((f: any) => f.farm === selectedFarm.name) : mockCropAnalysis.farmInput.data,
    },
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#F1F5F9] overflow-hidden">
      {/* ═══════ Header ═══════ */}
      <header className="bg-white px-4 pt-7 pb-0 border-b border-slate-100 shrink-0 z-30">
        {/* 单行：返回 + 紧凑统计 */}
        <div className="flex items-center gap-1.5 py-1">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-slate-50 rounded-lg shrink-0">
            <ArrowLeft size={17} className="text-slate-600" />
          </button>
          {activeTab === 'land' && (
            <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto scrollbar-none">
              {getAvailableLayers(user.role).map((l) => (
                <span key={l.id} className="flex items-center gap-0.5 shrink-0" style={{ color: l.color }}>
                  <div className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />
                  <span className="text-slate-500">{l.label}</span>
                  <strong className="text-slate-700">{layerStats[l.id]}</strong>
                </span>
              ))}
              <span className="text-[10px] text-slate-400 shrink-0 ml-0.5">共{landPlots.length}块</span>
            </div>
          )}
          {activeTab === 'crops' && (
            <div className="flex items-center gap-2 text-[11px] overflow-x-auto scrollbar-none">
              {CROP_LAYER_META.map((l) => {
                const count = farmPlots.filter((p) => p.type === 'LEASING' && p.leaseType === l.id).length;
                return (
                  <span key={l.id} className="flex items-center gap-0.5 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />
                    <span className="text-slate-500">{l.label}</span>
                    <strong className="text-slate-700">{count}</strong>
                  </span>
                );
              })}
              <span className="text-[10px] text-slate-400 shrink-0 ml-0.5">共{cropPlots.length}块</span>
            </div>
          )}
          {activeTab === 'iot' && (
            <div className="flex items-center gap-2 text-[11px] overflow-x-auto scrollbar-none">
              <span className="flex items-center gap-0.5 shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-slate-500">在线</span><strong className="text-slate-700">{deviceStats.online}</strong></span>
              <span className="flex items-center gap-0.5 shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" /><span className="text-slate-500">离线</span><strong className="text-slate-700">{deviceStats.total - deviceStats.online - deviceStats.fault}</strong></span>
              <span className="flex items-center gap-0.5 shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /><span className="text-slate-500">故障</span><strong className="text-rose-500">{deviceStats.fault}</strong></span>
            </div>
          )}
        </div>
      </header>

      {/* ═══════ 地图 ═══════ */}
      <div className="flex-1 relative">
        <SatelliteMap
          plots={mapPlots}
          devices={mapDevices}
          farms={filteredFarms.filter(f => f.id !== 'all').length <= 1 ? [] : filteredFarms}
          selectedFarmId={selectedFarm.id}
          onFarmSelect={(farm) => {
            if (farm.id === selectedFarm.id) {
              setSelectedFarm(filteredFarms[0]); // 点击已选中的 → 回到全集团
            } else {
              setSelectedFarm(farm);
            }
          }}
          showLand={activeTab === 'land'}
          showCrops={activeTab === 'crops'}
          showIot={activeTab === 'iot'}
          selectedPlot={selectedPlot}
          selectedDevice={selectedDevice}
          onPlotClick={(plot) => {
            setSelectedPlot(plot);
            setSelectedDevice(null);
            setPanelOpen(true);
          }}
          onDeviceClick={(device) => {
            setSelectedDevice(device);
            setSelectedPlot(null);
            setPanelOpen(true);
          }}
          onPlotLongPress={(plot) => {
            // 长按 → 只看此类
            if (plot.type === 'LEASING' && plot.leaseType) {
              setVisibleCropLayers(new Set([plot.leaseType as CropLayer]));
            } else {
              setVisibleLayers(new Set([plot.type as LandLayer] as LandLayer[]));
            }
          }}
          onMapReady={setMapInstance}
        />
        <WeatherHeatmap map={mapInstance} metric={weatherMetric} visible={showWeatherLayer} />

        {/* 模式切换胶囊 —— 浮在地图上方 */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="flex bg-white/90 backdrop-blur rounded-full p-1 shadow-lg border border-slate-200/60">
            {getAvailableTabs(user.role).map((tab) => (
              <button
                key={tab.id}
                onClick={() => { switchTab(tab.id); setShowFilter(false); setShowLayerPanel(false); }}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-[#0D665E] text-white shadow-sm'
                    : 'text-slate-500',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 悬浮按钮 —— 胶囊右下 */}
        {!panelOpen && (
          <div className="absolute right-4 z-20 flex flex-col gap-2" style={{top:"72px"}}>
            {activeTab === 'land' && getAvailableLayers(user.role).length > 1 && (
            <button
              onClick={() => { setShowLayerPanel(true); setShowFilter(false); }}
              className={cn(
                'w-11 h-11 rounded-xl shadow-lg border flex items-center justify-center active:scale-95 transition-all',
                showLayerPanel ? 'bg-[#0D665E] border-[#0D665E] text-white' : 'bg-white border-slate-200 text-slate-600',
              )}
            >
              <Layers size={20} />
            </button>
            )}
            <button
              onClick={() => { initDraft(); setShowFilter(true); setShowLayerPanel(false); }}
              className={cn(
                'w-11 h-11 rounded-xl shadow-lg border flex items-center justify-center active:scale-95 transition-all',
                showFilter ? 'bg-[#0D665E] border-[#0D665E] text-white' : 'bg-white border-slate-200 text-slate-600',
              )}
            >
              <SlidersHorizontal size={20} />
            </button>
            {activeTab === 'crops' && (
              <button
                onClick={() => setShowWeatherLayer(!showWeatherLayer)}
                className={cn(
                  'w-11 h-11 rounded-xl shadow-lg border flex items-center justify-center active:scale-95 transition-all',
                  showWeatherLayer ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-slate-200 text-slate-600',
                )}
              >
                <span className="text-lg">🌤</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ═══════ 气象指标选择器 ═══════ */}
      {showWeatherLayer && (
        <div className="absolute left-0 right-0 z-25 pb-1 pointer-events-none" style={{bottom:"128px"}}>
          <div className="px-3 pointer-events-auto">
            {/* 色阶图例 */}
            <div className="flex justify-center mb-2">
              <div className="bg-white/90 backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-medium">低</span>
                <div className="flex h-2.5 rounded-full overflow-hidden" style={{
                  background: weatherMetric === 'temp'
                    ? 'linear-gradient(to right, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)'
                    : weatherMetric === 'rain'
                    ? 'linear-gradient(to right, #e0f2fe, #7dd3fc, #2563eb, #1e3a8a)'
                    : weatherMetric === 'wind'
                    ? 'linear-gradient(to right, #f8fafc, #fde047, #f97316, #dc2626)'
                    : weatherMetric === 'light'
                    ? 'linear-gradient(to right, #7c3aed, #3b82f6, #eab308, #fef3c7)'
                    : weatherMetric === 'humidity'
                    ? 'linear-gradient(to right, #c2410c, #eab308, #22c55e, #3b82f6)'
                    : 'linear-gradient(to right, #92400e, #84cc16, #22c55e, #3b82f6)',
                  width: 120,
                }} />
                <span className="text-[10px] text-slate-400 font-medium">高</span>
              </div>
            </div>
            {/* 指标切换 */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none py-1 px-1 justify-center">
              {([
                { key: 'temp' as WeatherMetric, label: '温度' },
                { key: 'rain' as WeatherMetric, label: '降水' },
                { key: 'wind' as WeatherMetric, label: '风速' },
                { key: 'light' as WeatherMetric, label: '光照' },
                { key: 'humidity' as WeatherMetric, label: '空气湿度' },
                { key: 'soilMoisture' as WeatherMetric, label: '土壤湿度' },
              ]).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setWeatherMetric(m.key)}
                  className={cn(
                    'shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-all border shadow-sm',
                    weatherMetric === m.key
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white/90 backdrop-blur text-slate-500 border-slate-200',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ 底部面板 ═══════ */}
      <AnimatePresence>
        {panelOpen && (
          <>
            {/* 点击背景关闭 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setPanelOpen(false); setSelectedPlot(null); setSelectedDevice(null); setDetailExpanded(false); }}
              className="absolute inset-0 z-30 bg-black/20"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: detailExpanded ? 0 : '32%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e, info) => {
                if (info.offset.y < -50) setDetailExpanded(true);
                else if (info.velocity.y > 200 || info.offset.y > 60) { setPanelOpen(false); setSelectedPlot(null); setSelectedDevice(null); setDetailExpanded(false); }
                else setDetailExpanded(false);
              }}
              className="absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-2xl h-[68vh] flex flex-col"
          >
            <div className="flex justify-center pt-3 pb-1 shrink-0 touch-none">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-2 border-b border-slate-50 shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h3 className="text-[15px] font-bold text-slate-800 truncate">
                  {selectedDevice?.name || selectedPlot?.code || selectedPlot?.name || ''}
                </h3>
                {selectedPlot && (
                  <button
                    onClick={() => {
                      if (selectedPlot.type === 'LEASING' && selectedPlot.leaseType) {
                        setVisibleCropLayers(new Set([selectedPlot.leaseType as CropLayer]));
                      } else {
                        setVisibleLayers(new Set([selectedPlot.type as LandLayer] as LandLayer[]));
                      }
                      setSelectedPlot(null);
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#0D665E] bg-[#E8F4F4] active:scale-95"
                  >
                    只看此类
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedPlot && <PlotDetail plot={selectedPlot} />}
              {selectedDevice && <DeviceDetail device={selectedDevice} />}

              {!selectedPlot && !selectedDevice && (
                <div className="divide-y divide-slate-50">
                  {activeTab === 'iot'
                    ? farmDevices.map((d) => (
                        <button key={d.id} onClick={() => setSelectedDevice(d)}
                          className="w-full px-5 py-3 flex items-center gap-3 hover:bg-slate-50 text-left"
                        >
                          <div className={cn('w-2.5 h-2.5 rounded-full shrink-0',
                            d.status === 'ONLINE' ? 'bg-emerald-500' : d.status === 'FAULT' ? 'bg-rose-500' : 'bg-slate-400',
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate">{d.name}</p>
                            <p className="text-xs text-slate-400">{d.deviceInfo?.farm}</p>
                          </div>
                          <span className={cn('text-xs font-medium',
                            d.status === 'ONLINE' ? 'text-emerald-600' : d.status === 'FAULT' ? 'text-rose-500' : 'text-slate-400',
                          )}>
                            {d.status === 'ONLINE' ? '在线' : d.status === 'FAULT' ? '故障' : '离线'}
                          </span>
                        </button>
                      ))
                    : mapPlots.map((p) => (
                        <button key={p.id} onClick={() => { setSelectedPlot(p); setSelectedDevice(null); }}
                          className="w-full px-5 py-3 flex items-center gap-3 hover:bg-slate-50 text-left"
                        >
                          <div className="w-2.5 h-2.5 rounded-sm shrink-0"
                            style={{ backgroundColor: p.type === 'LEASING' ? (p.leaseType === '承租' ? '#C4A27C' : PLOT_COLORS.LEASING) : PLOT_COLORS[p.type] }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.area.toLocaleString()} ㎡{p.crop ? ` · ${p.crop}` : ''}</p>
                          </div>
                          <span className="text-xs font-medium text-slate-400">
                            {p.type === 'ZONGDI' ? '宗地' : p.type === 'HIGH_STANDARD' ? '高标准' : p.type === 'SALINE_ALKALI' ? '盐碱地' : p.leaseType || '承包'}
                          </span>
                        </button>
                      ))}
                </div>
              )}
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════ 筛选面板（右侧抽屉） ═══════ */}
      <AnimatePresence>
        {showFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowFilter(false); setFilterDraft(null); }}
              className="absolute inset-0 z-30 bg-black/30"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute top-0 bottom-0 right-0 z-40 bg-white shadow-2xl flex flex-col"
              style={{ width: 'min(85vw, 340px)' }}
            >
              {/* 头部 */}
              <div className="flex items-center justify-between px-5 pt-12 pb-2 border-b border-slate-50 shrink-0">
                <h3 className="text-[16px] font-bold text-slate-800">筛选</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetDraft}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600"
                  >
                    <RotateCcw size={13} />
                    重置
                  </button>
                  <button
                    onClick={() => { setShowFilter(false); setFilterDraft(null); }}
                    className="p-1.5 text-slate-400 hover:text-slate-600"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>

            {filterDraft && (<div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {/* ─── 宗地筛选（土地资源公司不显示） ─── */}
              {activeTab === 'land' && user.role !== 'LAND_COMPANY_ADMIN' && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: PLOT_COLORS.ZONGDI }} />
                    <h4 className="text-sm font-bold text-slate-800">宗地筛选</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <PickerField value={filterDraft?.filterVersion??""} onChange={(v)=>setFilterDraft(p=>({...p,filterVersion:v}))} placeholder="数据版本" options={['三调数据']} />
                      <PickerField value={filterDraft?.filterAttribution??""} onChange={(v)=>setFilterDraft(p=>({...p,filterAttribution:v}))} placeholder="宗地归属" options={['农垦集团', '集体']} />
                    </div>
                    <div className="flex gap-2">
                      <PickerField value={filterDraft?.filterFarm??""} onChange={(v)=>setFilterDraft(p=>({...p,filterFarm:v}))} placeholder="所属农场" options={['镇南种羊场', '白城牧场', '长岭种马场']} />
                      <PickerField value={filterDraft?.filterRegion??""} onChange={(v)=>setFilterDraft(p=>({...p,filterRegion:v}))} placeholder="行政区域" options={['洮北区', '长岭县']} />
                    </div>
                    <div className="flex gap-2">
                      <TextFilter value={filterDraft?.filterCode??""} onChange={(v)=>setFilterDraft(p=>({...p,filterCode:v}))} placeholder="宗地编号" />
                      <TextFilter value={filterDraft?.filterName??""} onChange={(v)=>setFilterDraft(p=>({...p,filterName:v}))} placeholder="宗地俗名" />
                    </div>
                  </div>
                </section>
              )}

              {/* ─── 高标准筛选 ─── */}
              {activeTab === 'land' && user.role !== 'NONGKEN_ADMIN' && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: PLOT_COLORS.HIGH_STANDARD }} />
                    <h4 className="text-sm font-bold text-slate-800">高标准农田筛选</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <PickerField value={filterDraft?.hsRegion??""} onChange={(v)=>setFilterDraft(p=>({...p,hsRegion:v}))} placeholder="行政区域" options={['洮北区', '长岭县']} />
                      <PickerField value={filterDraft?.hsRenovation??""} onChange={(v)=>setFilterDraft(p=>({...p,hsRenovation:v}))} placeholder="改造状态" options={['已完成', '施工中']} />
                    </div>
                    <div className="flex gap-2">
                      <PickerField value={filterDraft?.hsPlanYear??""} onChange={(v)=>setFilterDraft(p=>({...p,hsPlanYear:v}))} placeholder="规划年份" options={['2022', '2023', '2024']} />
                      <PickerField value={filterDraft?.hsBuildYear??""} onChange={(v)=>setFilterDraft(p=>({...p,hsBuildYear:v}))} placeholder="建设完成年份" options={['2023', '2024', '2025']} />
                    </div>
                    <div className="flex gap-2">
                      <TextFilter value={filterDraft?.hsName??""} onChange={(v)=>setFilterDraft(p=>({...p,hsName:v}))} placeholder="农田名称" />
                      <TextFilter value={filterDraft?.hsCode??""} onChange={(v)=>setFilterDraft(p=>({...p,hsCode:v}))} placeholder="农田编码" />
                    </div>
                  </div>
                </section>
              )}

              {/* ─── 盐碱地筛选 ─── */}
              {activeTab === 'land' && user.role !== 'NONGKEN_ADMIN' && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: PLOT_COLORS.SALINE_ALKALI }} />
                    <h4 className="text-sm font-bold text-slate-800">盐碱地筛选</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <PickerField value={filterDraft?.saRegion??""} onChange={(v)=>setFilterDraft(p=>({...p,saRegion:v}))} placeholder="行政区域" options={['洮北区']} />
                      <PickerField value={filterDraft?.saLevel??""} onChange={(v)=>setFilterDraft(p=>({...p,saLevel:v}))} placeholder="盐碱地等级" options={['轻度盐碱地', '中度盐碱地', '重度盐碱地']} />
                    </div>
                    <div className="flex gap-2">
                      <PickerField value={filterDraft?.saType??""} onChange={(v)=>setFilterDraft(p=>({...p,saType:v}))} placeholder="盐碱地类型" options={['苏打盐碱地', '氯化物盐碱地']} />
                      <div className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                      <TextFilter value={filterDraft?.saName??""} onChange={(v)=>setFilterDraft(p=>({...p,saName:v}))} placeholder="盐碱地名称" />
                      <TextFilter value={filterDraft?.saCode??""} onChange={(v)=>setFilterDraft(p=>({...p,saCode:v}))} placeholder="盐碱地编码" />
                    </div>
                  </div>
                </section>
              )}

              {/* ─── 承包筛选（种植分布） ─── */}
              {activeTab === 'crops' && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-[#0A4D4A] rounded-full" />
                    <h4 className="text-sm font-bold text-slate-800">种植筛选</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <PickerField
                        value={[...(filterDraft?.cropLayers||getDefaultCropLayers())].join(',')}
                        onChange={(v) => setFilterDraft((p: any) => {
                          const n = new Set(p?.cropLayers || getDefaultCropLayers());
                          const selected = v as string;
                          if (n.has(selected) && n.size > 1) n.delete(selected);
                          else if (!n.has(selected)) { n.clear(); n.add(selected); }
                          return { ...p, cropLayers: n };
                        })}
                        placeholder="承包类型"
                        options={CROP_LAYER_META.map(l => l.label)}
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* ─── 设备筛选（智能感知） ─── */}
              {activeTab === 'iot' && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-[#0A4D4A] rounded-full" />
                    <h4 className="text-sm font-bold text-slate-800">设备筛选</h4>
                  </div>
                  <div className="space-y-2">
                    <PickerField value={filterDraft?.iotTypeFilter??"ALL"} onChange={(v)=>setFilterDraft(p=>({...p,iotTypeFilter:v}))} placeholder="设备类型" options={['WEATHER_STATION', 'SOIL_SENSOR', 'SOIL_MOISTURE', 'CAMERA', 'SPORE_TRAP', 'PEST_MONITOR', 'FERTIGATION', 'HIGH_STANDARD']} />
                    <TextFilter value={filterDraft?.iotCodeFilter??""} onChange={(v)=>setFilterDraft(p=>({...p,iotCodeFilter:v}))} placeholder="设备编号" />
                    <TextFilter value={filterDraft?.iotNameFilter??""} onChange={(v)=>setFilterDraft(p=>({...p,iotNameFilter:v}))} placeholder="设备名称" />
                  </div>
                </section>
              )}
            </div>
            )}
            <div className="px-5 py-4 border-t border-slate-100 shrink-0"><button onClick={applyDraft} disabled={!filterDraft} className="w-full py-3 bg-[#0D665E] text-white rounded-2xl text-[14px] font-bold shadow-lg shadow-[#0D665E]/20 active:scale-[0.98] transition-all disabled:opacity-50">确定</button></div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════ 图层面板（右侧抽屉） ═══════ */}
      <AnimatePresence>
        {showLayerPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLayerPanel(false)}
              className="absolute inset-0 z-30 bg-black/30"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute top-0 bottom-0 right-0 z-40 bg-white shadow-2xl flex flex-col"
              style={{ width: 'min(80vw, 320px)' }}
            >
              <div className="flex items-center justify-between px-5 pt-12 pb-2 border-b border-slate-50 shrink-0">
                <h3 className="text-[16px] font-bold text-slate-800">选择图层</h3>
                <button
                  onClick={() => setShowLayerPanel(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1">
                {/* 土地资源图层 */}
                {activeTab === 'land' && getAvailableLayers(user.role).map((l) => (
                  <button
                    key={l.id}
                    onClick={() => toggleLayer(l.id)}
                    className={cn(
                      'w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-colors',
                      visibleLayers.has(l.id)
                        ? 'border-[#0D665E] bg-[#E8F4F4]'
                        : 'border-slate-100 bg-white',
                    )}
                  >
                    <div className={cn(
                      'w-6 h-6 rounded-md flex items-center justify-center shrink-0',
                      visibleLayers.has(l.id) ? 'bg-[#0D665E]' : 'border-2 border-slate-300',
                    )}>
                      {visibleLayers.has(l.id) && (
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-slate-800">{l.label}</p>
                      <p className="text-xs text-slate-400">{layerStats[l.id]} 个地块</p>
                    </div>
                  </button>
                ))}
                {/* 种植分布图层 */}
                {activeTab === 'crops' && CROP_LAYER_META.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => toggleCropLayer(l.id)}
                    className={cn(
                      'w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-colors',
                      visibleCropLayers.has(l.id)
                        ? 'border-[#0D665E] bg-[#E8F4F4]'
                        : 'border-slate-100 bg-white',
                    )}
                  >
                    <div className={cn(
                      'w-6 h-6 rounded-md flex items-center justify-center shrink-0',
                      visibleCropLayers.has(l.id) ? 'bg-[#0D665E]' : 'border-2 border-slate-300',
                    )}>
                      {visibleCropLayers.has(l.id) && (
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-slate-800">{l.label}</p>
                      <p className="text-xs text-slate-400">
                        {farmPlots.filter((p) => p.type === 'LEASING' && p.leaseType === l.id).length} 个地块
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════ 底部分析条（智能感知/气象/详情打开时隐藏） ═══════ */}
      {activeTab !== "iot" && !showWeatherLayer && !panelOpen && (
        <AnalysisBar
        activeTab={activeTab}
        layerStats={layerStats}
        deviceStats={deviceStats}
        cropStats={{
          统种: farmPlots.filter((p) => p.type === 'LEASING' && p.leaseType === '统种').length,
          承租: farmPlots.filter((p) => p.type === 'LEASING' && p.leaseType === '承租').length,
        }}
        role={user.role}
        landStats={landStats}
        cropAnalysisData={cropAnalysisData}
      />
      )}
    </div>
  );
}

/* ═══════════════════════════════ 详情子组件 ═══════════════════════════════ */

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 bg-[#0A4D4A] rounded-full" />
      <h4 className="text-[14px] font-bold text-slate-800">{children}</h4>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-[13px] text-slate-400 w-[110px] shrink-0">{label}</span>
      <span className="text-[13px] font-medium text-slate-700">{value || '--'}</span>
    </div>
  );
}

function PlotDetail({ plot }: { plot: MapPlot }) {
  const isZongdi = plot.type === 'ZONGDI';
  const isHighStd = plot.type === 'HIGH_STANDARD';
  const isSaline = plot.type === 'SALINE_ALKALI';

  return (
    <div className="px-5 py-4 space-y-6 pb-8">

      {/* ═══════ 宗地详情 ═══════ */}
      {isZongdi && (
        <>
          <section>
            <SectionTitle>基本信息</SectionTitle>
            <div className="bg-slate-50 rounded-xl px-4 py-2">
              <InfoRow label="宗地编码" value={plot.code || ''} />
              <InfoRow label="数据版本" value={plot.version || ''} />
              <InfoRow label="所属农场" value={plot.farm || ''} />
              <InfoRow label="所属行政区划" value={plot.region || ''} />
              <InfoRow label="所属三大类" value={plot.category || '农用地'} />
              <InfoRow label="土地利用类型" value={plot.usageType || ''} />
              <InfoRow label="宗地归属" value={plot.attribution || ''} />
              <InfoRow label="信息状态" value={plot.status === 'STABLE' ? '已完成' : plot.status === 'FIXING' ? '修正中' : '闲置'} />
            </div>
          </section>
          <section>
            <SectionTitle>宗地信息</SectionTitle>
            <div className="bg-slate-50 rounded-xl px-4 py-2">
              <InfoRow label="宗地俗名" value={plot.name} />
              <InfoRow label="权属状态" value={plot.titleStatus || ''} />
              <InfoRow label="宗地面积(㎡)" value={plot.area.toLocaleString()} />
              <InfoRow label="绘图面积(㎡)" value={(plot.area * 0.999).toLocaleString()} />
              <InfoRow label="宗地备注" value="--" />
            </div>
          </section>
          <section>
            <SectionTitle>权证信息</SectionTitle>
            <div className="bg-slate-50 rounded-xl px-4 py-2">
              <InfoRow label="坐落" value={plot.certLocation || ''} />
              <InfoRow label="权证类型" value={plot.certType || ''} />
              <InfoRow label="证书编号" value={plot.certNo || '--'} />
              <InfoRow label="发证机关" value={plot.certAuthority || ''} />
              <InfoRow label="登记日期" value={plot.certDate || ''} />
              <InfoRow label="证载权利人" value={plot.certHolder || ''} />
              <InfoRow label="共有情况" value={plot.ownershipType || ''} />
              <InfoRow label="不动产单元号" value={plot.unitNo || ''} />
              <InfoRow label="权利类型" value={plot.rightType || ''} />
              <InfoRow label="权利性质" value={plot.useRightType || ''} />
              <InfoRow label="地类（用途）" value={plot.landClass || ''} />
              <InfoRow label="使用权面积(㎡)" value={plot.useArea?.toLocaleString() || ''} />
              <InfoRow label="权属起始日期" value={plot.startDate || ''} />
              <InfoRow label="权属终止日期" value={plot.endDate || ''} />
              <InfoRow label="附记" value="--" />
              <InfoRow label="权证备注" value="--" />
            </div>
          </section>
          <section>
            <SectionTitle>证书照片</SectionTitle>
            <div className="flex gap-3">
              <div className="flex-1 aspect-[3/4] rounded-xl overflow-hidden flex flex-col items-center justify-center bg-red-700">
                <div className="w-8 h-8 rounded-full bg-yellow-400/30 mb-2" />
                <span className="text-[10px] font-bold text-white/80 text-center px-2 leading-tight">集体土地建设用地使用证</span>
              </div>
              <div className="flex-1 aspect-[3/4] rounded-xl overflow-hidden flex flex-col items-center justify-center bg-amber-500">
                <div className="w-8 h-8 rounded-full bg-blue-600/30 mb-2" />
                <span className="text-[10px] font-bold text-slate-800/80 text-center px-2 leading-tight">国有土地承包经营使用证</span>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ═══════ 高标准农田详情 ═══════ */}
      {isHighStd && (
        <section>
          <SectionTitle>基本信息</SectionTitle>
          <div className="bg-slate-50 rounded-xl px-4 py-2">
            <InfoRow label="农田名称" value={plot.name} />
            <InfoRow label="农田编码" value={plot.code || ''} />
            <InfoRow label="地块面积(㎡)" value={plot.area.toLocaleString()} />
            <InfoRow label="所属宗地" value={plot.belongingZongdi || '--'} />
            <InfoRow label="高标准农田改造状态" value={plot.renovationStatus || '--'} />
            <InfoRow label="规划年份" value={plot.planYear ? plot.planYear + ' 年' : '--'} />
            <InfoRow label="建设完成年份" value={plot.buildYear ? plot.buildYear + ' 年' : '--'} />
            <InfoRow label="土地利用类型" value={plot.usageType || '--'} />
            <InfoRow label="所属行政区划" value={plot.region || '--'} />
            <InfoRow label="信息状态" value={plot.infoStatus || '--'} />
            <InfoRow label="驳回理由" value={plot.rejectionReason || '--'} />
          </div>
        </section>
      )}

      {/* ═══════ 盐碱地详情 ═══════ */}
      {isSaline && (
        <section>
          <SectionTitle>基本信息</SectionTitle>
          <div className="bg-slate-50 rounded-xl px-4 py-2">
            <InfoRow label="盐碱地名称" value={plot.name} />
            <InfoRow label="盐碱地编码" value={plot.code || ''} />
            <InfoRow label="地块面积(㎡)" value={plot.area.toLocaleString()} />
            <InfoRow label="所属宗地" value={plot.belongingZongdi || '--'} />
            <InfoRow label="盐碱地等级" value={plot.salineLevel || '--'} />
            <InfoRow label="盐碱地类型" value={plot.salineType || '--'} />
            <InfoRow label="土地利用类型" value={plot.usageType || '--'} />
            <InfoRow label="所属行政区划" value={plot.region || '--'} />
            <InfoRow label="信息状态" value={plot.infoStatus || '--'} />
            <InfoRow label="驳回理由" value={plot.rejectionReason || '--'} />
          </div>
        </section>
      )}

      {/* ═══════ 承包地详情 ═══════ */}
      {!isZongdi && !isHighStd && !isSaline && <LeasingDetail plot={plot} />}
    </div>
  );
}

/* ═══════════════════════════════ 承包地详情 ═══════════════════════════════ */

function LeasingDetail({ plot }: { plot: MapPlot }) {
  const operations = mockPlotOperations[plot.id] || [];
  const area = plot.inputArea || plot.area;
  const leaseLabel = plot.leaseType === '统种' ? '统种地' : plot.leaseType === '承租' ? '承租地' : '承包地';

  // ─── 承租地详情 ───
  if (plot.leaseType === '承租') {
    return (
      <div className="space-y-5 pb-8">
        <section>
          <SectionTitle>基本信息</SectionTitle>
          <div className="bg-slate-50 rounded-xl px-4 py-2">
            <InfoRow label="数据版本" value={plot.version || '--'} />
            <InfoRow label="种植地块编码" value={plot.code || '--'} />
            <InfoRow label="所属宗地" value={plot.belongingZongdi || '--'} />
            <InfoRow label="所属农场" value={plot.farm || '--'} />
            <InfoRow label="土地利用类型" value={plot.usageType || '--'} />
            <InfoRow label="使用主体" value={plot.contractorName || '--'} />
            <InfoRow label="录入面积" value={`${(plot.inputArea || plot.area).toLocaleString()} ㎡`} />
            <InfoRow label="绘图面积" value={plot.drawArea ? `${plot.drawArea.toLocaleString()} ㎡` : '--'} />
          </div>
        </section>

        <section>
          <SectionTitle>承包人信息</SectionTitle>
          <div className="bg-slate-50 rounded-xl px-4 py-2">
            <InfoRow label="经营主体名称" value={plot.contractorName || '--'} />
            <InfoRow label="承包人身份" value={plot.contractorIdentity || '--'} />
            <InfoRow label="承包人退休日期" value={plot.retirementDate || '--'} />
            <InfoRow label="承包起止日期" value={plot.contractStartDate && plot.contractEndDate ? `${plot.contractStartDate} ~ ${plot.contractEndDate}` : '--'} />
            <InfoRow label="承包金额" value={plot.contractAmount ? `${plot.contractAmount.toLocaleString()} 元/年` : '--'} />
          </div>
        </section>

        {/* 合同附件（点击查看） */}
        <section>
          <SectionTitle>合同附件</SectionTitle>
          <button
            onClick={() => { const el = document.getElementById(`contract-${plot.id}`); if (el) el.classList.toggle('hidden'); }}
            className="w-full bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-center justify-between active:bg-amber-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" />
                <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" />
              </svg>
              <span className="text-[13px] font-bold text-amber-700">土地承包合同</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div id={`contract-${plot.id}`} className="hidden mt-2 bg-amber-50 rounded-xl border border-amber-200 p-4 space-y-3">
            <div className="text-[11px] text-amber-600 space-y-1 leading-relaxed">
              <p>合同编号：HT-{plot.code || 'ZL'}-{plot.contractStartDate?.replace(/-/g, '') || '20260315'}</p>
              <p>甲方：吉林农发集团（{plot.farm || '—'}）</p>
              <p>乙方：{plot.contractorName || '—'}（{plot.contractorIdentity || '—'}）</p>
              <p>承包期限：{plot.contractStartDate || '—'} 至 {plot.contractEndDate || '—'}</p>
              <p>承包面积：{(plot.inputArea || plot.area).toLocaleString()} ㎡</p>
              <p>承包金额：{plot.contractAmount ? `${plot.contractAmount.toLocaleString()} 元/年` : '—'}</p>
              <p>签订日期：{plot.contractStartDate || '—'}</p>
            </div>
            <div className="flex items-center gap-2 bg-amber-100/50 rounded-lg px-3 py-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span className="text-[10px] text-amber-500 font-medium">此为模拟合同附件，仅供演示使用，不具备法律效力</span>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ─── 统种地详情 ───
  return (
    <div className="space-y-5 pb-8">
      {/* ═══ 地块基础信息 ═══ */}
      <section>
        <SectionTitle>地块基础信息</SectionTitle>
        <div className="bg-slate-50 rounded-xl px-4 py-2">
          <InfoRow label="地块名称" value={plot.name} />
          <InfoRow label="地块面积(㎡)" value={area.toLocaleString()} />
          <InfoRow label="地块类型" value={leaseLabel} />
          <InfoRow label="土地利用类型" value={plot.usageType || '--'} />
          <InfoRow label="当前作物" value={plot.crop ? `${plot.crop}` : '--'} />
          <InfoRow label="前茬作物" value={plot.preCrop ? `${plot.preCrop}（${plot.preCropVariety || ''}）` : '--'} />
          <InfoRow label="所属农场" value={plot.farm || '--'} />
          <InfoRow label="所属宗地" value={plot.belongingZongdi || '--'} />
        </div>
      </section>

      {/* ═══ 田间作业档案 — 时间轴 ═══ */}
      <section>
        <SectionTitle>田间作业档案</SectionTitle>
        {operations.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">暂无作业记录</p>
        ) : (
          <div className="relative pl-4">
            {/* 竖线 */}
            <div className="absolute left-[8px] top-1 bottom-1 w-0.5 bg-slate-200 rounded-full" />
            <div className="space-y-2">
              {[...operations]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((op, i) => (
                <div key={op.id} className="relative">
                  {/* 时间点 */}
                  <div className={cn(
                    'absolute left-[-16px] top-2 w-[12px] h-[12px] rounded-full border-2 border-white',
                    op.type === '播种' ? 'bg-emerald-500' : op.type === '田间管理' ? 'bg-amber-500' : 'bg-blue-500',
                  )} />
                  {/* 卡片 */}
                  <div className="bg-slate-50 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[12px] font-bold text-slate-700">{op.item}</span>
                      <span className={cn(
                        'text-[8px] font-bold px-1.5 py-px rounded-md',
                        op.type === '播种' ? 'bg-emerald-50 text-emerald-600' : op.type === '田间管理' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600',
                      )}>{op.type}</span>
                    </div>
                    {op.detail && (
                      <p className="text-[10px] text-slate-500 mb-0.5">{op.detail}</p>
                    )}
                    <div className="flex items-center gap-2 text-[9px] text-slate-400">
                      <span>{op.date}</span>
                      {op.crop && <span>{op.crop}{op.variety ? ` · ${op.variety}` : ''}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ═══ 成本统计 ═══ */}
      <section>
        <SectionTitle>成本统计</SectionTitle>
        {(() => {
          const mu = area / 666.67;
          const seed = area * 0.08, pesticide = area * 0.05, fertilizer = area * 0.10, additive = area * 0.02;
          const machine = area * 0.12, labor = area * 0.08, irrigation = area * 0.03, other = area * 0.02;
          const agriCost = seed + pesticide + fertilizer + additive;
          const machCost = machine + labor;
          const otherCost = irrigation + other;
          const total = agriCost + machCost + otherCost;
          const categories = [
            { label: '总农资', perLabel: '亩农资', value: agriCost, perValue: agriCost / mu, pct: agriCost/total*100, color: '#0D665E' },
            { label: '总农机', perLabel: '亩油耗', value: machCost, perValue: machCost / mu, pct: machCost/total*100, color: '#2563EB' },
            { label: '其他', perLabel: '亩其他', value: otherCost, perValue: otherCost / mu, pct: otherCost/total*100, color: '#94A3B8' },
          ];
          const r = 50, w = 14, c = 65, circ = 2 * Math.PI * r;
          let off = 0;
          return (
            <div>
              <div className="flex items-center gap-4">
                <svg width="130" height="130" viewBox="0 0 130 130" className="shrink-0">
                  {categories.map((d, i) => {
                    const dashLen = circ * (d.pct / 100);
                    const el = (
                      <circle key={i} cx={c} cy={c} r={r} fill="none" stroke={d.color} strokeWidth={w}
                        strokeDasharray={`${dashLen} ${circ - dashLen}`} strokeDashoffset={-off}
                        transform="rotate(-90 65 65)" />
                    );
                    off += dashLen;
                    return el;
                  })}
                  <text x="65" y="60" textAnchor="middle" fill="#1E293B" fontSize="17" fontWeight="800">¥{total.toFixed(0)}</text>
                  <text x="65" y="75" textAnchor="middle" fill="#94A3B8" fontSize="9">总成本</text>
                </svg>
                <div className="flex-1 space-y-1.5">
                  {categories.map((d) => (
                    <div key={d.label} className="flex items-center gap-1.5 text-[10px]">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-600 font-medium w-10">{d.label}</span>
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
                      </div>
                      <span className="font-bold text-slate-700 w-8 text-right">{d.pct.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* 三类明细 */}
              <div className="mt-4 space-y-3">
                {/* 农资 */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center mb-2">
                    <div className="w-1 h-5 rounded-full mr-2 shrink-0" style={{ backgroundColor: '#0D665E' }} />
                    <span className="text-[11px] font-bold text-slate-700 flex-1">总农资 <span className="text-slate-400 font-normal">¥{agriCost.toFixed(0)}</span></span>
                    <span className="text-[10px] text-slate-400 mr-2">亩农资 ¥{(agriCost/mu).toFixed(2)}</span>
                    <span className="text-[13px] font-extrabold text-slate-700">{(agriCost/total*100).toFixed(0)}<span className="text-[10px] text-slate-400">%</span></span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { l: '种子', v: seed, c: '#0D665E' },
                      { l: '农药', v: pesticide, c: '#DC2626' },
                      { l: '肥料', v: fertilizer, c: '#E8A838' },
                      { l: '助剂', v: additive, c: '#7C3AED' },
                    ].map((s) => (
                      <div key={s.l} className="bg-white rounded-lg p-2 text-center">
                        <p className="text-[9px] text-slate-400">{s.l}</p>
                        <p className="text-[10px] font-bold text-slate-700">¥{s.v.toFixed(0)}</p>
                        <p className="text-[8px] text-slate-400">{(s.v/agriCost*100).toFixed(0)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 农机 */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center mb-2">
                    <div className="w-1 h-5 rounded-full mr-2 shrink-0" style={{ backgroundColor: '#2563EB' }} />
                    <span className="text-[11px] font-bold text-slate-700 flex-1">总农机 <span className="text-slate-400 font-normal">¥{machCost.toFixed(0)}</span></span>
                    <span className="text-[10px] text-slate-400 mr-2">亩油耗 ¥{(machCost/mu).toFixed(2)}</span>
                    <span className="text-[13px] font-extrabold text-slate-700">{(machCost/total*100).toFixed(0)}<span className="text-[10px] text-slate-400">%</span></span>
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      { l: '农机作业', v: machine },
                      { l: '人工成本', v: labor },
                    ].map((s) => (
                      <div key={s.l} className="flex-1 bg-white rounded-lg p-2">
                        <p className="text-[9px] text-slate-400">{s.l}</p>
                        <p className="text-[10px] font-bold text-slate-700">¥{s.v.toFixed(0)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 其他 */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center mb-2">
                    <div className="w-1 h-5 rounded-full mr-2 shrink-0" style={{ backgroundColor: '#94A3B8' }} />
                    <span className="text-[11px] font-bold text-slate-700 flex-1">其他 <span className="text-slate-400 font-normal">¥{otherCost.toFixed(0)}</span></span>
                    <span className="text-[10px] text-slate-400 mr-2">亩其他 ¥{(otherCost/mu).toFixed(2)}</span>
                    <span className="text-[13px] font-extrabold text-slate-700">{(otherCost/total*100).toFixed(0)}<span className="text-[10px] text-slate-400">%</span></span>
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      { l: '灌溉费用', v: irrigation },
                      { l: '其他支出', v: other },
                    ].map((s) => (
                      <div key={s.l} className="flex-1 bg-white rounded-lg p-2">
                        <p className="text-[9px] text-slate-400">{s.l}</p>
                        <p className="text-[10px] font-bold text-slate-700">¥{s.v.toFixed(0)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ═══ 产量统计 ═══ */}
      <section>
        <SectionTitle>产量统计</SectionTitle>
        {(() => {
          const mu = area / 666.67;
          const plantMu = mu;
          const swathMu = mu * 0.92;
          const harvestMu = mu * 0.88;
          const muYield = plot.crop === '玉米' ? 1200 : plot.crop === '小麦' ? 700 : plot.crop === '大豆' ? 350 : 800;
          const estProduction = harvestMu * muYield;
          const incomingProd = estProduction * 0.85;
          const items = [
            { label: '播种面积', value: plantMu.toFixed(1), unit: '亩' },
            { label: '割晒面积', value: swathMu.toFixed(1), unit: '亩' },
            { label: '收获面积', value: harvestMu.toFixed(1), unit: '亩' },
            { label: '预估产量', value: (estProduction / 10000).toFixed(2), unit: '万斤' },
            { label: '进场产量', value: (incomingProd / 10000).toFixed(2), unit: '万斤' },
            { label: '亩产量', value: muYield.toFixed(0), unit: '斤/亩' },
          ];
          return (
            <div className="grid grid-cols-3 gap-2">
              {items.map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 font-medium mb-1">{item.label}</p>
                  <p className="text-[15px] font-extrabold text-slate-800">{item.value}<span className="text-[10px] text-slate-400 font-medium ml-0.5">{item.unit}</span></p>
                </div>
              ))}
            </div>
          );
        })()}
      </section>
    </div>
  );
}

/* ═══════════════════════════════ 筛选辅助组件 ═══════════════════════════════ */

function PickerField({ value, onChange, placeholder, options }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const [temp, setTemp] = useState(value);

  const display = value || placeholder;
  const isPlaceholder = !value;

  return (
    <div className="flex-1">
      <button
        type="button"
        onClick={() => { setOpen(true); setTemp(value); }}
        className={cn(
          'w-full px-3 py-2.5 rounded-lg text-xs text-left border outline-none transition-colors',
          isPlaceholder
            ? 'bg-slate-50 border-slate-200 text-slate-400'
            : 'bg-slate-50 border-slate-200 text-slate-700 font-medium',
        )}
      >
        <span className="flex items-center justify-between">
          <span>{display}</span>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={cn(isPlaceholder ? 'text-slate-300' : 'text-slate-400')}>
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {/* iOS 风格滚轮弹出层 — Portal 到 body 避免抽屉裁切 */}
      {open && createPortal(
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-black/40" onClick={() => setOpen(false)} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 z-[201] bg-white rounded-t-2xl shadow-2xl">
            {/* 头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <button
                onClick={() => setOpen(false)}
                className="text-[15px] text-slate-400 font-medium px-2"
              >
                取消
              </button>
              <span className="text-[13px] font-bold text-slate-500">{placeholder}</span>
              <button
                onClick={() => { onChange(temp); setOpen(false); }}
                className="text-[15px] text-[#0D665E] font-bold px-2"
              >
                确定
              </button>
            </div>
            {/* 滚轮区域 */}
            <div className="relative h-[220px] overflow-hidden bg-slate-50/50">
              {/* 中心高亮条 */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 h-10 bg-white/50 rounded-lg border border-slate-100/50 pointer-events-none z-0" />
              {/* 渐变遮罩 */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-50/90 to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-slate-50/90 pointer-events-none z-10" />
              {/* 选项列表 */}
              <div
                className="h-full overflow-y-auto snap-y snap-mandatory py-[90px] scrollbar-none"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const itemH = 40;
                  const idx = Math.round((el.scrollTop + 2) / itemH);
                  const opt = options[Math.min(Math.max(idx, 0), options.length - 1)];
                  if (opt !== undefined) setTemp(opt);
                }}
              >
                <div className="h-2 snap-start" /> {/* 顶部占位 */}
                {options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => { setTemp(o); }}
                    className={cn(
                      'w-full h-10 flex items-center justify-center text-[15px] snap-center transition-colors relative z-10',
                      temp === o
                        ? 'text-[#0D665E] font-bold'
                        : 'text-slate-400 font-medium',
                    )}
                  >
                    {o}
                  </button>
                ))}
                <div className="h-2 snap-start" /> {/* 底部占位 */}
              </div>
            </div>
            {/* 安全区 */}
            <div className="h-6 bg-white" />
          </motion.div>
        </>,
        document.body
      )}
    </div>
  );
}

function TextFilter({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex-1">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

/* ═══════════════════════════════ 详情组件 ═══════════════════════════════ */

function deviceTypeLabel(t: string): string {
  const m: Record<string, string> = {
    WEATHER_STATION: '气象站', SOIL_SENSOR: '土壤传感器', SOIL_MOISTURE: '土壤墒情站',
    CAMERA: '摄像头', SPORE_TRAP: '孢子捕捉仪', PEST_MONITOR: '虫情测报设备',
    FERTIGATION: '水肥一体机', CONTROLLER: '智能控制终端', SMART_VALVE: '智能水阀',
  };
  return m[t] || '物联网设备';
}

/** 根据设备类型生成模拟历史数据 */
function genHistory(device: Device): { time: string; value: number; metric: string }[] {
  const points: { time: string; value: number; metric: string }[] = [];
  const now = new Date();
  const metrics = device.type === 'WEATHER_STATION'
    ? [{ k: '温度(°C)', base: 22, amp: 8 }, { k: '湿度(%)', base: 50, amp: 20 }, { k: '风速(m/s)', base: 8, amp: 6 }]
    : device.type === 'SOIL_SENSOR'
    ? [{ k: '土壤湿度(%)', base: 55, amp: 20 }, { k: '土壤温度(°C)', base: 18, amp: 6 }]
    : device.type === 'SOIL_MOISTURE'
    ? [{ k: '10cm湿度(%)', base: 50, amp: 18 }, { k: '20cm湿度(%)', base: 45, amp: 15 }, { k: '40cm湿度(%)', base: 40, amp: 12 }]
    : device.type === 'CAMERA'
    ? [{ k: '在线时长(h)', base: 20, amp: 8 }]
    : device.type === 'SPORE_TRAP'
    ? [{ k: '孢子数', base: 80, amp: 70 }]
    : device.type === 'PEST_MONITOR'
    ? [{ k: '虫量(只)', base: 30, amp: 35 }]
    : device.type === 'FERTIGATION'
    ? [{ k: '流量(L/s)', base: 2.2, amp: 1.2 }, { k: 'EC(mS/cm)', base: 1.7, amp: 0.5 }, { k: '压力(MPa)', base: 0.3, amp: 0.1 }]
    : device.type === 'CONTROLLER'
    ? [{ k: '电压(V)', base: 12, amp: 1.5 }, { k: '电流(A)', base: 2, amp: 0.8 }]
    : [{ k: '数据值', base: 50, amp: 25 }];

  const seed = device.id.split('').reduce((s: number, c: string) => s + c.charCodeAt(0), 0);
  for (let h = 23; h >= 0; h--) {
    const t = new Date(now.getTime() - h * 3600000);
    const time = `${String(t.getHours()).padStart(2, '0')}:00`;
    for (const m of metrics) {
      const val = m.base + m.amp * Math.sin(h * 0.52 + seed * 0.17 + m.k.charCodeAt(0) * 0.03);
      points.push({ time, value: Math.round(val * 10) / 10, metric: m.k });
    }
  }
  return points;
}

function DeviceDetail({ device }: { device: Device }) {
  const history = genHistory(device);
  const metrics = [...new Set(history.map((h) => h.metric))];
  const alarms = device.alarms || [];

  const dType = deviceTypeLabel(device.type);
  const info = device.deviceInfo;
  const lastData = device.lastData || {};
  const canControl = info?.remoteControlSupported ?? false;

  // 实时数据键值对
  const realtimePairs = Object.entries(lastData).filter(([, v]) => v !== undefined && v !== '' && typeof v !== 'object');

  // 历史峰值
  const getMetricData = (metric: string) => history.filter((h) => h.metric === metric).map((h) => h.value);
  const safeGetMetricData = (metric: string) => { const d = getMetricData(metric); return d.length > 0 ? d : [0]; };

  return (
    <div className="px-5 py-4 space-y-5 pb-8">
      {/* ═══ 设备状态头 ═══ */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-[11px] font-bold px-2.5 py-0.5 rounded-md',
              device.status === 'ONLINE' ? 'text-emerald-600 bg-emerald-50' :
              device.status === 'FAULT' ? 'text-rose-600 bg-rose-50' : 'text-slate-500 bg-slate-50',
            )}>
              {device.status === 'ONLINE' ? '在线' : device.status === 'FAULT' ? '故障' : '离线'}
            </span>
            <span className="text-xs text-slate-400">{dType}</span>
          </div>
          <h3 className="text-[15px] font-bold text-slate-800 mt-1">{device.name}</h3>
          {info?.farm && <p className="text-xs text-slate-400">{info.farm} · {info.adminRegion}</p>}
        </div>
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center',
          device.status === 'ONLINE' ? 'bg-emerald-50' : device.status === 'FAULT' ? 'bg-rose-50' : 'bg-slate-100',
        )}>
          <div className={cn('w-4 h-4 rounded-full',
            device.status === 'ONLINE' ? 'bg-emerald-500' : device.status === 'FAULT' ? 'bg-rose-500' : 'bg-slate-400',
          )} />
        </div>
      </div>

      {/* ═══ 实时监测 ═══ */}
      {realtimePairs.length > 0 && (
        <section>
          <SectionTitle>实时监测</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {realtimePairs.map(([k, v]) => (
              <div key={k} className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-lg font-bold text-slate-800">{String(v)}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{k}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ 24h 趋势 ═══ */}
      {history.length > 0 && (
        <section>
          <SectionTitle>24h 趋势</SectionTitle>
          <div className="space-y-3">
            {metrics.map((metric) => {
              const data = safeGetMetricData(metric);
              const maxVal = Math.max(...data, 1);
              return (
                <div key={metric} className="bg-slate-50 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-600">{metric}</span>
                    <span className="text-[11px] text-slate-400">
                      当前 {data[data.length - 1]} · 峰值 {Math.max(...data)}
                    </span>
                  </div>
                  <div className="flex items-end gap-[2px] h-10">
                    {data.map((v, i) => (
                      <div key={i} className="flex-1 rounded-t-sm"
                        style={{
                          height: `${Math.max(3, (v / maxVal) * 100)}%`,
                          backgroundColor: device.status === 'FAULT' ? '#fecaca' : '#a7f3d0',
                          opacity: 0.7 + (i / data.length) * 0.3,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] text-slate-400">
                    <span>00:00</span><span>12:00</span><span>现在</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══ 告警信息 ═══ */}
      {alarms.length > 0 && (
        <section>
          <SectionTitle>告警信息</SectionTitle>
          <div className="space-y-2">
            {alarms.map((a) => (
              <div key={a.id} className={cn(
                'rounded-xl px-4 py-3 flex items-start gap-3',
                a.level === 'HIGH' ? 'bg-rose-50' : a.level === 'MEDIUM' ? 'bg-amber-50' : 'bg-blue-50',
              )}>
                <AlertTriangle size={14} className={cn('mt-0.5 shrink-0',
                  a.level === 'HIGH' ? 'text-rose-500' : a.level === 'MEDIUM' ? 'text-amber-500' : 'text-blue-500',
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-slate-700">{a.content}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{a.time}</p>
                </div>
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0',
                  a.level === 'HIGH' ? 'bg-rose-100 text-rose-600' : a.level === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600',
                )}>
                  {a.level === 'HIGH' ? '严重' : a.level === 'MEDIUM' ? '注意' : '提示'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ 基本信息 ═══ */}
      <section>
        <SectionTitle>基本信息</SectionTitle>
        <div className="bg-slate-50 rounded-xl px-4 py-2">
          <InfoRow label="设备名称" value={device.name} />
          <InfoRow label="设备类型" value={dType} />
          {info?.manufacturer && <InfoRow label="厂商" value={info.manufacturer} />}
          {info?.model && <InfoRow label="型号" value={info.model} />}
          {info?.farm && <InfoRow label="所属农场" value={info.farm} />}
          {info?.adminRegion && <InfoRow label="所在区域" value={info.adminRegion} />}
        </div>
      </section>

      {/* ═══ 远程控制 ═══ */}
      {canControl && (
        <section>
          <SectionTitle>远程控制</SectionTitle>
          <div className="space-y-2">
            {device.type === 'FERTIGATION' && (
              <>
                <ControlBtn label="启动灌溉" color="emerald" />
                <ControlBtn label="停止灌溉" color="rose" />
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">流量调节</span>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-sm active:bg-slate-100">−</button>
                    <span className="text-sm font-bold text-slate-800 w-10 text-center">2.5</span>
                    <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-sm active:bg-slate-100">+</button>
                    <span className="text-[10px] text-slate-400">L/s</span>
                  </div>
                </div>
              </>
            )}
            {device.type === 'CAMERA' && (
              <>
                <div className="bg-slate-900 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden">
                  <span className="text-white/10 text-6xl">📹</span>
                  <span className="absolute bottom-2 left-2 text-[9px] text-white/40 bg-black/30 px-2 py-0.5 rounded">{device.name}</span>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="absolute top-2 right-5 text-[9px] text-red-400 font-bold">LIVE</span>
                </div>
                {/* 圆形方向操作盘 */}
                <div className="relative w-[180px] h-[180px] mx-auto mt-4">
                  {/* 外圈装饰 */}
                  <div className="absolute inset-0 rounded-full border-2 border-slate-100 bg-slate-50/50" />
                  {/* 上 */}
                  <button className="absolute left-1/2 -translate-x-1/2 top-2 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm text-lg active:bg-slate-100 active:scale-95 transition-all font-medium flex items-center justify-center">⬆</button>
                  {/* 下 */}
                  <button className="absolute left-1/2 -translate-x-1/2 bottom-2 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm text-lg active:bg-slate-100 active:scale-95 transition-all font-medium flex items-center justify-center">⬇</button>
                  {/* 左 */}
                  <button className="absolute top-1/2 -translate-y-1/2 left-2 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm text-lg active:bg-slate-100 active:scale-95 transition-all font-medium flex items-center justify-center">⬅</button>
                  {/* 右 */}
                  <button className="absolute top-1/2 -translate-y-1/2 right-2 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm text-lg active:bg-slate-100 active:scale-95 transition-all font-medium flex items-center justify-center">➡</button>
                  {/* 中心回中 */}
                  <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-800 border-2 border-white shadow-md text-lg active:bg-slate-700 active:scale-95 transition-all font-medium flex items-center justify-center text-white">🏠</button>
                </div>
              </>
            )}
            {(device.type === 'SPORE_TRAP' || device.type === 'PEST_MONITOR') && (
              <>
                <ControlBtn label="🔬 立即采样" color="blue" />
                <ControlBtn label="📊 导出数据" color="slate" />
              </>
            )}
            {device.type === 'WEATHER_STATION' && (
              <>
                <ControlBtn label="🔄 校准传感器" color="blue" />
                <ControlBtn label="📡 切换上报频率" color="slate" />
              </>
            )}
            {![ 'FERTIGATION', 'CAMERA', 'SPORE_TRAP', 'PEST_MONITOR', 'WEATHER_STATION', 'CONTROLLER', 'SMART_VALVE' ].includes(device.type as string) && (
              <ControlBtn label="🔄 重启设备" color="blue" />
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* ═══════════════════════════════ 底部分析条 ═══════════════════════════════ */

function AnalysisBar({
  activeTab, layerStats, deviceStats, cropStats, role, landStats, cropAnalysisData,
}: {
  activeTab: string;
  layerStats: Record<string, number>;
  deviceStats: { total: number; online: number; fault: number };
  cropStats: Record<string, number>;
  role: UserRole;
  landStats: Record<string, any>;
  cropAnalysisData: Record<string, any>;
}) {
  const [expanded, setExpanded] = useState(false);

  const landSummary = role === 'NONGKEN_ADMIN'
    ? `${layerStats.ZONGDI} 块宗地`
    : role === 'LAND_COMPANY_ADMIN'
    ? `${layerStats.HIGH_STANDARD + layerStats.SALINE_ALKALI} 块地 · ${layerStats.HIGH_STANDARD}高标 ${layerStats.SALINE_ALKALI}盐碱`
    : `${layerStats.ZONGDI + layerStats.HIGH_STANDARD + layerStats.SALINE_ALKALI} 块地 · ${layerStats.ZONGDI}宗 ${layerStats.HIGH_STANDARD}高标 ${layerStats.SALINE_ALKALI}盐碱`;

  const summary = activeTab === 'land'
    ? landSummary
    : activeTab === 'crops'
    ? `${cropStats['统种'] + cropStats['承租']} 块承包地 · 统种${cropStats['统种']} 承租${cropStats['承租']}`
    : `${deviceStats.total} 台设备 · 在线${deviceStats.online} 离线${deviceStats.total - deviceStats.online - deviceStats.fault} 故障${deviceStats.fault}`;

  return (
    <>
      {/* 常驻窄条 */}
      {!expanded && (
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }}
          className="fixed left-2 right-2 z-50" style={{bottom:"72px"}}
        >
          <button
            onClick={() => setExpanded(true)}
            className="w-full bg-white/90 backdrop-blur rounded-2xl px-4 py-2.5 shadow-lg border border-slate-200/60 flex items-center gap-2 active:scale-[0.98] transition-transform"
          >
            <span className="text-xs">📊</span>
            <span className="text-[11px] text-slate-600 font-medium truncate flex-1 text-left">{landStats.farmLabel} · {summary}</span>
            <ChevronUp size={14} className="text-slate-400 shrink-0" />
          </button>
        </motion.div>
      )}

      {/* 展开面板 */}
      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setExpanded(false)}
              className="absolute inset-0 z-30 bg-black/20"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e: any, info: any) => { if (info.offset.y > 100) setExpanded(false); }}
              className="absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-2xl h-[55vh] flex flex-col"
            >
              <div className="flex justify-center pt-3 pb-1 shrink-0 touch-none">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>
              <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between shrink-0">
                <h3 className="text-[15px] font-bold text-slate-800">{landStats.farmLabel} · 数据分析</h3>
                <button onClick={() => setExpanded(false)} className="text-xs text-slate-400 font-medium">收起</button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-8">
                {activeTab === 'land' && (role === 'LAND_COMPANY_ADMIN' ? <LandCompanyAnalysis d={landStats} /> : <LandAnalysis d={landStats} />)}
                {activeTab === 'crops' && <CropAnalysis d={cropAnalysisData} />}
                {activeTab === 'iot' && (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { label: '在线', value: deviceStats.online, color: '#10B981' },
                        { label: '离线', value: deviceStats.total - deviceStats.online - deviceStats.fault, color: '#94A3B8' },
                        { label: '故障', value: deviceStats.fault, color: '#F43F5E' },
                        { label: '总计', value: deviceStats.total, color: '#0D665E' },
                      ].map((s) => (
                        <div key={s.label} className="bg-slate-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                            <p className="text-xs text-slate-500">{s.label}</p>
                          </div>
                          <p className="text-2xl font-bold text-slate-800">{s.value}<span className="text-sm text-slate-400 ml-1">台</span></p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-50 rounded-xl p-5">
                      <h4 className="text-sm font-bold text-slate-800 mb-4">设备健康率</h4>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden flex">
                          <div className="bg-emerald-500 h-full rounded-l-full" style={{ width: `${(deviceStats.online / Math.max(deviceStats.total, 1)) * 100}%` }} />
                          <div className="bg-slate-400 h-full" style={{ width: `${((deviceStats.total - deviceStats.online - deviceStats.fault) / Math.max(deviceStats.total, 1)) * 100}%` }} />
                          <div className="bg-rose-500 h-full rounded-r-full" style={{ width: `${(deviceStats.fault / Math.max(deviceStats.total, 1)) * 100}%` }} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          {Math.round((deviceStats.online / Math.max(deviceStats.total, 1)) * 100)}%
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════ 土地分析 ═══════════════════════════════ */

function LandAnalysis({ d }: { d: Record<string, any> }) {
  if (!d?.landUse) return <div className="py-20 text-center text-slate-400 text-sm">加载中...</div>;

  // SVG donut 参数
  const donutR = 56;
  const donutW = 22;
  const donutCenter = 70;
  const circum = 2 * Math.PI * donutR;
  let offset = 0;

  return (
    <div className="space-y-4">
      {/* 1. 确权面积统计 */}
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">确权面积统计</h4>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white rounded-xl p-3"><p className="text-[10px] text-slate-400">{d.isFarmView ? '农场总面积' : '集团总面积'}</p><p className="text-lg font-bold text-slate-800">{d.totalArea}<span className="text-xs text-slate-400 ml-0.5">万亩</span></p></div>
          <div className="bg-white rounded-xl p-3"><p className="text-[10px] text-slate-400">已确权面积</p><p className="text-lg font-bold text-emerald-600">{d.confirmedArea}<span className="text-xs text-slate-400 ml-0.5">万亩</span></p></div>
          <div className="bg-white rounded-xl p-3"><p className="text-[10px] text-slate-400">未确权面积</p><p className="text-lg font-bold text-slate-600">{d.unconfirmedArea}<span className="text-xs text-slate-400 ml-0.5">万亩</span></p></div>
          <div className="bg-white rounded-xl p-3"><p className="text-[10px] text-slate-400">确权完成率</p><p className="text-lg font-bold text-amber-600">{d.confirmRate}<span className="text-xs text-slate-400 ml-0.5">%</span></p></div>
        </div>
        {/* 进度条 */}
        <div className="h-3 bg-white rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${d.confirmRate}%` }} />
        </div>
      </section>

      {/* 2. 确权面积分布 + 3. 土地利用（并排） */}
      <div className="grid grid-cols-2 gap-4">
        <section className="bg-slate-50 rounded-2xl p-5">
          <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">确权面积分布</h4>
          <div className="space-y-2">
            {(d.rightsDistribution||[]).map((r: any) => (
              <div key={r.label} className="flex items-center gap-2 text-[11px]">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: r.color }} />
                <span className="text-slate-600 flex-1 truncate">{r.label}</span>
                <span className="font-bold text-slate-700">{r.pct}%</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-3">总面积 {d.totalArea} 万亩</p>
        </section>

        <section className="bg-slate-50 rounded-2xl p-5 flex flex-col items-center">
          <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider self-start">土地利用占比</h4>
          <svg width="140" height="140" viewBox="0 0 140 140">
            {(d.landUse||[]).reduce((acc: any[], item: any, i: number) => {
              const pct = item.pct / 100;
              const dashLen = circum * pct;
              const dashGap = circum - dashLen;
              const el = (
                <circle key={i} cx={donutCenter} cy={donutCenter} r={donutR} fill="none"
                  stroke={item.color} strokeWidth={donutW}
                  strokeDasharray={`${dashLen} ${dashGap}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 70 70)"
                />
              );
              offset += dashLen;
              acc.push(el);
              return acc;
            }, [])}
            <text x="70" y="66" textAnchor="middle" className="text-base font-bold" fill="#1e293b" fontSize="16">耕地</text>
            <text x="70" y="82" textAnchor="middle" fill="#64748b" fontSize="11">54.15%</text>
          </svg>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            {(d.landUse||[]).map((r: any) => (
              <span key={r.label} className="text-[10px] text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: r.color }} />{r.label} {r.pct}%
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* 4-6 多农场对比（仅全集团时显示） */}
      {!d.isFarmView && (<>
      {/* 4. 各农场土地类型 */}
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3">各农场土地类型</h4>
        <div className="space-y-3">
          {(d.farmLandTypes||[]).map((f: any) => {
            const total = f.耕地 + f.草地 + f.其他 + f.建设用地;
            return (
              <div key={f.farm}>
                <p className="text-[11px] font-bold text-slate-600 mb-1.5">{f.farm}</p>
                <div className="h-6 rounded-lg overflow-hidden flex">
                  <div className="h-full bg-[#0D665E] flex items-center justify-center text-[9px] text-white font-bold" style={{ width: `${(f.耕地/total)*100}%` }}>{f.耕地}%</div>
                  <div className="h-full bg-emerald-400 flex items-center justify-center text-[9px] text-white font-bold" style={{ width: `${(f.草地/total)*100}%` }}>{f.草地}%</div>
                  <div className="h-full bg-slate-300 flex items-center justify-center text-[9px] text-slate-500 font-bold" style={{ width: `${(f.其他/total)*100}%` }}>{f.其他}%</div>
                  <div className="h-full bg-amber-400 flex items-center justify-center text-[9px] text-white font-bold" style={{ width: `${(f.建设用地/total)*100}%` }}>{f.建设用地}%</div>
                </div>
                <div className="flex gap-3 mt-1 text-[9px] text-slate-400">
                  <span>■ 耕地</span><span>■ 草地</span><span>■ 其他</span><span>■ 建设用地</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. 各农场确权对比 */}
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">各农场确权对比</h4>
        <div className="space-y-3">
          {(d.farmRights||[]).map((f: any) => {
            const total = f.已发证 + f.已登记未发证 + f.已确权未登记 + f.未确权;
            const colors = ['#0D665E', '#2D9F7A', '#E8A838', '#CBD5E1'];
            return (
              <div key={f.farm}>
                <p className="text-[11px] font-bold text-slate-600 mb-1.5">{f.farm}</p>
                <div className="h-6 rounded-lg overflow-hidden flex">
                  {(['已发证','已登记未发证','已确权未登记','未确权'] as const).map((k, i) => {
                    const v = f[k] as number;
                    return (
                      <div key={k} className="h-full flex items-center justify-center text-[9px] font-bold"
                        style={{ width: `${(v/total)*100}%`, backgroundColor: colors[i], color: i === 3 ? '#64748b' : '#fff' }}>
                        {v}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-1 text-[9px] text-slate-400 flex-wrap">
                  <span>■ 已发证</span><span>■ 已登记未发证</span><span>■ 已确权未登记</span><span>■ 未确权</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. 各行政区确权占比 */}
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3">各行政区确权占比</h4>
        <div className="space-y-2">
          {(d.regionRights||[]).map((r: any) => (
            <div key={r.region} className="flex items-center gap-2">
              <span className="text-[11px] text-slate-600 w-14 shrink-0">{r.region}</span>
              <div className="flex-1 h-5 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0D665E] to-[#2D9F7A] rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${r.pct}%` }}>
                  <span className="text-[9px] font-bold text-white">{r.pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      </>)}
    </div>
  );
}

/* ═══════════════════════════════ 土地资源公司分析 ═══════════════════════════════ */

function LandCompanyAnalysis({ d }: { d: Record<string, any> }) {
  return (
    <div className="space-y-4">
      {/* 高标准农田 */}
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">高标准农田</h4>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-[#2D9F7A]">{(d.totalHighStandard||0).toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">总面积（亩）</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-[#2D9F7A]">{(d.highStandardByFarm||[]).length}</p>
            <p className="text-[10px] text-slate-400">{d.isFarmView ? '地块数' : '覆盖农场'}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-[#2D9F7A]">{(d.highStandardByFarm||[]).reduce((s: number, f: any) => s + (f.plots||0), 0)}</p>
            <p className="text-[10px] text-slate-400">地块数</p>
          </div>
        </div>
        {/* 各农场面积 —— 仅全集团显示 */}
        {!d.isFarmView && (
          <>
            <p className="text-[11px] text-slate-400 font-medium mb-2">各农场面积</p>
            <div className="space-y-2">
              {(d.highStandardByFarm||[]).map((item: any) => (
                <div key={item.farm} className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-600 w-16 shrink-0 truncate">{item.farm}</span>
                  <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(item.area / d.totalHighStandard) * 100}%`, backgroundColor: item.color }} />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 w-18 text-right shrink-0">{item.area.toLocaleString()}亩</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* 盐碱地 */}
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">盐碱地</h4>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-[#E8A838]">{(d.totalSaline||0).toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">总面积（亩）</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-[#E8A838]">{(d.salineByLevel||[]).length}</p>
            <p className="text-[10px] text-slate-400">等级分类</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-[#E8A838]">{(d.salineByType||[]).length}</p>
            <p className="text-[10px] text-slate-400">土壤类型</p>
          </div>
        </div>
        {/* 各农场面积 —— 仅全集团显示 */}
        {!d.isFarmView && (
          <>
            <p className="text-[11px] text-slate-400 font-medium mb-2">各农场面积</p>
            <div className="space-y-2 mb-4">
              {(d.salineByFarm||[]).map((item: any) => (
                <div key={item.farm} className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-600 w-16 shrink-0 truncate">{item.farm}</span>
                  <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(item.area / d.totalSaline) * 100}%`, backgroundColor: item.color }} />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 w-18 text-right shrink-0">{item.area.toLocaleString()}亩</span>
                </div>
              ))}
            </div>
          </>
        )}
        {/* 等级分布 */}
        <p className="text-[11px] text-slate-400 font-medium mb-2">等级分布</p>
        <div className="space-y-2 mb-4">
          {(d.salineByLevel||[]).map((item: any) => (
            <div key={item.level} className="flex items-center gap-2">
              <span className="text-[11px] text-slate-600 w-8 shrink-0">{item.level}</span>
              <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(item.area / d.totalSaline) * 100}%`, backgroundColor: item.color }} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 w-18 text-right shrink-0">{item.area.toLocaleString()}亩</span>
            </div>
          ))}
        </div>
        {/* 类型分布 */}
        <p className="text-[11px] text-slate-400 font-medium mb-2">类型分布</p>
        <div className="space-y-2">
          {(d.salineByType||[]).map((item: any) => (
            <div key={item.type} className="flex items-center gap-2">
              <span className="text-[11px] text-slate-600 w-20 shrink-0 truncate">{item.type}</span>
              <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(item.area / d.totalSaline) * 100}%`, backgroundColor: item.color }} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 w-18 text-right shrink-0">{item.area.toLocaleString()}亩</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════ 种植分析 ═══════════════════════════════ */

function CropAnalysis({ d }: { d: Record<string, any> }) {
  const [progressTab, setProgressTab] = useState(0);
  const [inputTab, setInputTab] = useState(0);

  // Donut: 作物占比
  const donutR = 48, donutW = 14, cx = 60, cy = 60;
  const circum = 2 * Math.PI * donutR;
  let offset = 0;

  return (
    <div className="space-y-4">
      {/* 1. 年度种植计划 */}
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">年度种植计划</h4>
        <div className="flex items-start gap-4">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {d.cropBreakdown.reduce((els: any[], c, i) => {
              const pct = c.area / (d.planTotal || 1);
              const dashLen = circum * pct;
              const dashGap = circum - dashLen;
              els.push(<circle key={i} cx={cx} cy={cy} r={donutR} fill="none" stroke={c.color} strokeWidth={donutW}
                strokeDasharray={`${dashLen} ${dashGap}`} strokeDashoffset={-offset}
                transform="rotate(-90 60 60)" />);
              offset += dashLen;
              return els;
            }, [])}
            <text x="60" y="56" textAnchor="middle" fill="#1e293b" fontSize="13" fontWeight="700">{d.planTotal || 0}万亩</text>
            <text x="60" y="72" textAnchor="middle" fill="#64748b" fontSize="9">计划总面积</text>
          </svg>
          <div className="flex-1 space-y-2 pt-1">
            {(d.cropBreakdown||[]).map((c: any) => (
              <div key={c.crop} className="flex items-center gap-2 text-[11px]">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-slate-500 flex-1">{c.crop}</span>
                <span className="font-bold text-slate-700">{c.area}万亩</span>
              </div>
            ))}
            <div className="border-t border-slate-200 mt-2 pt-2 space-y-1.5">
              <div className="flex justify-between text-[11px]"><span className="text-slate-500">承租耕地</span><span className="font-bold text-[#C4A27C]">{d.planLeased} 万亩</span></div>
              <div className="flex justify-between text-[10px] bg-amber-50 rounded-lg px-2 py-1"><span className="text-amber-500">租金</span><span className="font-bold text-amber-600">{d.leaseRent} 亿元</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-slate-500">统种耕地</span><span className="font-bold text-[#7A9E8F]">{d.planUnified} 万亩</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 累计投入（统种） */}
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">累计投入（统种）</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center"><p className="text-lg font-bold text-slate-800">{d.unifiedInput?.materials || 0}</p><p className="text-[10px] text-slate-400">农资（万元）</p></div>
          <div className="bg-white rounded-xl p-3 text-center"><p className="text-lg font-bold text-slate-800">{d.unifiedInput?.machinery || 0}</p><p className="text-[10px] text-slate-400">农机（万元）</p></div>
          <div className="bg-white rounded-xl p-3 text-center"><p className="text-lg font-bold text-slate-800">{d.unifiedInput?.other || 0}</p><p className="text-[10px] text-slate-400">其他（万元）</p></div>
        </div>
      </section>

      {/* 3. 承租 / 统种占比 —— 仅全集团显示 */}
      {!d.isFarmView && (
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">各农场承租 / 统种占比</h4>
        <div className="space-y-3">
          {(d.farmLeaseRatio||[]).map((f: any) => (
            <div key={f.farm}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-600">{f.farm}</span>
                <span className="text-slate-400">承租 {f.lease}亿</span>
              </div>
              <div className="h-5 rounded-full overflow-hidden flex">
                <div className="h-full bg-[#C4A27C] flex items-center justify-center text-[9px] text-white font-bold" style={{ width: `${f.leasePct}%` }}>{f.leasePct}%</div>
                <div className="h-full bg-[#7A9E8F] flex items-center justify-center text-[9px] text-white font-bold" style={{ width: `${f.unifiedPct}%` }}>{f.unifiedPct}%</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-2 text-[9px] text-slate-400">
          <span>■ 承租</span><span>■ 统种</span>
        </div>
      </section>
      )}

      {/* 4. 整体进度 */}
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">{d.isFarmView ? `${d.farmLabel} · 整体进度` : '各农场整体进度'}</h4>
        {d.isFarmView ? (
          /* ─── 单农场：仪表盘 ─── */
          <div className="flex flex-col items-center">
            {/* 仪表盘 */}
            <div className="relative w-[260px] h-[170px] -mt-5">
              <svg viewBox="0 0 260 170" className="w-full h-full">
                <defs>
                  <linearGradient id="gaugeGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0D665E" />
                    <stop offset="40%" stopColor="#2D9F7A" />
                    <stop offset="75%" stopColor="#E8A838" />
                    <stop offset="100%" stopColor="#DC2626" />
                  </linearGradient>
                </defs>
                {/* 刻度线 */}
                {Array.from({length: 21}, (_, i) => {
                  const angle = -180 + (i * 180 / 20); // -180 to 0 degrees (left to right, bottom half)
                  const rad = angle * Math.PI / 180;
                  const isMajor = i % 5 === 0;
                  const innerR = isMajor ? 85 : 92;
                  const outerR = 104;
                  const x1 = 130 + innerR * Math.cos(rad);
                  const y1 = 155 + innerR * Math.sin(rad);
                  const x2 = 130 + outerR * Math.cos(rad);
                  const y2 = 155 + outerR * Math.sin(rad);
                  return (
                    <g key={i}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={isMajor ? '#94A3B8' : '#CBD5E1'} strokeWidth={isMajor ? 2 : 1} strokeLinecap="round" />
                      {isMajor && (
                        <text x={130 + 70 * Math.cos(rad)} y={155 + 70 * Math.sin(rad) + 4}
                          textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="600">
                          {i * 5}
                        </text>
                      )}
                    </g>
                  );
                })}
                {/* 底色弧 */}
                <path d="M 35 155 A 95 95 0 0 1 225 155"
                  fill="none" stroke="#E2E8F0" strokeWidth="18" strokeLinecap="round" />
                {/* 进度弧 */}
                <path d="M 35 155 A 95 95 0 0 1 225 155"
                  fill="none" stroke="url(#gaugeGrad2)" strokeWidth="18" strokeLinecap="round"
                  strokeDasharray={`${(d.farmProgress?.overall || 0) * 2.95} 295`} />
                {/* 中心数值 */}
                <text x="130" y="130" textAnchor="middle" fill="#1E293B" fontSize="40" fontWeight="800">
                  {d.farmProgress?.overall || 0}
                </text>
                <text x="130" y="148" textAnchor="middle" fill="#64748B" fontSize="13" fontWeight="700">
                  %
                </text>
              </svg>
            </div>
            {/* 阶段标签 */}
            <div className="flex gap-1 bg-slate-200 rounded-lg p-0.5 -mt-3">
              {(d.farmProgress?.tabs||[]).map((t: string, i: number) => (
                <button key={t} onClick={() => setProgressTab(i)}
                  className={cn('px-4 py-1.5 rounded-md text-[11px] font-bold transition-all', progressTab === i ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400')}>{t}</button>
              ))}
            </div>
            {/* 分类明细 */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 justify-center">
              {(d.farmProgress?.categories||[]).map((cat: string, i: number) => {
                const palette = ['#0D665E', '#2D9F7A', '#E8A838', '#94A3B8', '#CBD5E1'];
                const vals2 = (d.farmProgress?.data||[])[0] || {};
                const v2 = (vals2 as any)[cat] || 0;
                return (
                  <span key={cat} className="text-[11px]">
                    <span className="w-2 h-2 rounded-sm inline-block mr-1 align-middle" style={{ backgroundColor: palette[i] }} />
                    <span className="text-slate-400">{cat}</span>
                    <span className="text-slate-700 font-bold ml-1">{v2}%</span>
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          /* ─── 全集团：堆叠条 ─── */
          <>
            <div className="flex gap-1 bg-slate-200 rounded-lg p-0.5 mb-3">
              {(d.farmProgress?.tabs||[]).map((t: string, i: number) => (
                <button key={t} onClick={() => setProgressTab(i)}
                  className={cn('flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all', progressTab === i ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400')}>{t}</button>
              ))}
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] text-slate-500">整体进度</span>
              <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${d.farmProgress?.overall || 0}%` }} />
              </div>
              <span className="text-xs font-bold text-emerald-600">{d.farmProgress?.overall || 0}%</span>
            </div>
            <div className="space-y-2">
              {(d.farmProgress?.data||[]).map((f: any) => (
                <div key={f.farm}>
                  <p className="text-[10px] font-bold text-slate-500 mb-1">{f.farm}</p>
                  <div className="h-4 rounded-full overflow-hidden flex gap-px">
                    {(d.farmProgress?.categories||[]).map((cat: string, ci: number) => {
                      const v = (f as any)[cat] as number;
                      const palette = ['#0D665E', '#2D9F7A', '#E8A838', '#94A3B8', '#CBD5E1'];
                      return <div key={cat} className="h-full" style={{ width: `${v / 2.5}%`, backgroundColor: palette[ci] }} />;
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-2 text-[8px] text-slate-400 flex-wrap">
              {(d.farmProgress?.categories||[]).map((c: string, i: number) => {
                const palette = ['#0D665E', '#2D9F7A', '#E8A838', '#94A3B8', '#CBD5E1'];
                return <span key={c}>■ <span style={{ color: palette[i] }}>{c}</span></span>;
              })}
            </div>
          </>
        )}
      </section>

      {/* 5. 累计投入 */}
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">{d.isFarmView ? `${d.farmLabel} · 累计投入` : '各农场累计投入'}</h4>
        {d.isFarmView ? (
          /* ─── 单农场：卡片式 ─── */
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '农资投入', value: d.unifiedInput?.materials || 0, color: '#0D665E', icon: '🧪' },
              { label: '农机投入', value: d.unifiedInput?.machinery || 0, color: '#2D9F7A', icon: '🚜' },
              { label: '其他投入', value: d.unifiedInput?.other || 0, color: '#E8A838', icon: '📦' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl p-4 border border-slate-100 text-center hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <p className="text-[20px] font-bold text-slate-800">{item.value}<span className="text-xs text-slate-400 ml-0.5">万</span></p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">{item.label}</p>
                <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '100%', backgroundColor: item.color, opacity: 0.6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ─── 全集团：进度条列表 ─── */
          <>
            <div className="flex gap-1 bg-slate-200 rounded-lg p-0.5 mb-3">
              {(d.farmInput?.tabs||[]).map((t: string, i: number) => (
                <button key={t} onClick={() => setInputTab(i)}
                  className={cn('flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all', inputTab === i ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400')}>{t}</button>
              ))}
            </div>
            <div className="space-y-3">
              {(d.farmInput?.data||[]).map((f: any) => (
                <div key={f.farm}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-600">{f.farm}</span><span className="font-bold text-slate-800">{f.pct}%</span>
                  </div>
                  <div className="h-4 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#0D665E] to-emerald-400 rounded-full" style={{ width: `${f.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-slate-400">
              {(d.farmInput?.scale||[]).map((s: string) => <span key={s}>{s}</span>)}
              <span>亿元</span>
            </div>
          </>
        )}
      </section>

      {/* 6. 农艺配方 */}
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">农艺配方</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-200">
                <th className="text-left py-1.5 font-medium">农药(种)</th><th className="text-left py-1.5 font-medium">肥料(种)</th><th className="text-left py-1.5 font-medium">助剂(种)</th><th className="text-left py-1.5 font-medium">适用作业</th><th className="text-left py-1.5 font-medium">适用作物</th>
              </tr>
            </thead>
            <tbody>
              {(d.recipes||[]).map((r: any, i: number) => (
                <tr key={i} className="border-b border-slate-100 text-slate-600">
                  <td className="py-1.5">{r.pesticide}</td><td className="py-1.5">{r.fertilizer}</td><td className="py-1.5">{r.additive}</td><td className="py-1.5">{r.operation}</td><td className="py-1.5 font-medium">{r.crop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ControlBtn({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 active:bg-emerald-100',
    rose: 'bg-rose-50 border-rose-200 text-rose-700 active:bg-rose-100',
    blue: 'bg-blue-50 border-blue-200 text-blue-700 active:bg-blue-100',
    slate: 'bg-slate-50 border-slate-200 text-slate-600 active:bg-slate-100',
  };
  return (
    <button className={cn('w-full py-3 rounded-xl border text-xs font-bold transition-colors', colors[color] || colors.slate)}>
      {label}
    </button>
  );
}
