/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
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
import { useUser } from '../App';
import { mockDevices, mockMapPlots, mockFarms, mockPlotOperations, mockLandAnalysis, mockCropAnalysis } from '../mockData';
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

/** 根据角色返回初始可见图层（演示模式全部可见） */
function getDefaultLayers(_role: UserRole): Set<LandLayer> {
  return new Set(['ZONGDI', 'HIGH_STANDARD', 'SALINE_ALKALI'] as LandLayer[]);
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
  const filteredFarms = user.orgFilter ? mockFarms.filter(f => f.name === user.orgFilter || f.id === 'all') : mockFarms;
  const filteredPlots = user.orgFilter ? mockMapPlots.filter(p => p.farm === user.orgFilter) : mockMapPlots;
  const filteredDevices = user.orgFilter ? mockDevices.filter(d => d.deviceInfo?.farm === user.orgFilter) : mockDevices;

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
  const [layerExpanded, setLayerExpanded] = useState(false);

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
    setVisibleLayers(new Set(['ZONGDI', 'HIGH_STANDARD', 'SALINE_ALKALI'] as LandLayer[]));
    setVisibleCropLayers(getDefaultCropLayers());
    setIotTypeFilter('ALL'); setIotCodeFilter(''); setIotNameFilter('');
  };

  // ─── 切换 Tab 时重置面板 ───
  const switchTab = (tab: MainTab) => {
    setActiveTab(tab);
    setPanelOpen(false);
    setSelectedPlot(null);
    setSelectedDevice(null);
    setDetailExpanded(false);
    setFilterExpanded(false);
    setLayerExpanded(false);
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
              {LAYER_META.map((l) => (
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
          farms={filteredFarms}
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
            {MAIN_TABS.map((tab) => (
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

        {/* 悬浮按钮 */}
        {!panelOpen && (
          <div className="absolute right-4 top-3 z-20 flex flex-col gap-2">
            {activeTab !== 'iot' && (
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
              onClick={() => { setShowFilter(true); setShowLayerPanel(false); }}
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
        <div className="absolute bottom-12 left-0 right-0 z-25 pb-1 pointer-events-none">
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
            <div className="flex gap-2 overflow-x-auto scrollbar-none py-1 px-1">
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
                else if (info.offset.y > 120) { setPanelOpen(false); setSelectedPlot(null); setSelectedDevice(null); setDetailExpanded(false); }
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

      {/* ═══════ 筛选面板 ═══════ */}
      <AnimatePresence>
        {showFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowFilter(false); setFilterExpanded(false); }}
              className="absolute inset-0 z-30 bg-black/20"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: filterExpanded ? 0 : '35%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e, info) => {
                if (info.offset.y < -50) setFilterExpanded(true);
                else if (info.offset.y > 120) { setShowFilter(false); setFilterExpanded(false); }
                else setFilterExpanded(false);
              }}
              className="absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-2xl h-[65vh] flex flex-col"
            >
              <div className="flex justify-center pt-3 pb-1 shrink-0 touch-none">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 py-2 border-b border-slate-50 shrink-0">
                <h3 className="text-[15px] font-bold text-slate-800">筛选</h3>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  <RotateCcw size={13} />
                  重置
                </button>
              </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 pb-8">
              {/* ─── 宗地筛选 ─── */}
              {activeTab === 'land' && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: PLOT_COLORS.ZONGDI }} />
                    <h4 className="text-sm font-bold text-slate-800">宗地筛选</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <SelectField value={filterVersion} onChange={setFilterVersion} placeholder="数据版本" options={['三调数据']} />
                      <SelectField value={filterAttribution} onChange={setFilterAttribution} placeholder="宗地归属" options={['农垦集团', '集体']} />
                    </div>
                    <div className="flex gap-2">
                      <SelectField value={filterFarm} onChange={setFilterFarm} placeholder="所属农场" options={['镇南种羊场', '白城牧场', '长岭种马场']} />
                      <SelectField value={filterRegion} onChange={setFilterRegion} placeholder="行政区域" options={['洮北区', '长岭县']} />
                    </div>
                    <div className="flex gap-2">
                      <TextFilter value={filterCode} onChange={setFilterCode} placeholder="宗地编号" />
                      <TextFilter value={filterName} onChange={setFilterName} placeholder="宗地俗名" />
                    </div>
                  </div>
                </section>
              )}

              {/* ─── 高标准筛选 ─── */}
              {activeTab === 'land' && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: PLOT_COLORS.HIGH_STANDARD }} />
                    <h4 className="text-sm font-bold text-slate-800">高标准农田筛选</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <SelectField value={hsRegion} onChange={setHsRegion} placeholder="行政区域" options={['洮北区', '长岭县']} />
                      <SelectField value={hsRenovation} onChange={setHsRenovation} placeholder="改造状态" options={['已完成', '施工中']} />
                    </div>
                    <div className="flex gap-2">
                      <SelectField value={hsPlanYear} onChange={setHsPlanYear} placeholder="规划年份" options={['2022', '2023', '2024']} />
                      <SelectField value={hsBuildYear} onChange={setHsBuildYear} placeholder="建设完成年份" options={['2023', '2024', '2025']} />
                    </div>
                    <div className="flex gap-2">
                      <TextFilter value={hsName} onChange={setHsName} placeholder="农田名称" />
                      <TextFilter value={hsCode} onChange={setHsCode} placeholder="农田编码" />
                    </div>
                  </div>
                </section>
              )}

              {/* ─── 盐碱地筛选 ─── */}
              {activeTab === 'land' && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: PLOT_COLORS.SALINE_ALKALI }} />
                    <h4 className="text-sm font-bold text-slate-800">盐碱地筛选</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <SelectField value={saRegion} onChange={setSaRegion} placeholder="行政区域" options={['洮北区']} />
                      <SelectField value={saLevel} onChange={setSaLevel} placeholder="盐碱地等级" options={['轻度盐碱地', '中度盐碱地', '重度盐碱地']} />
                    </div>
                    <div className="flex gap-2">
                      <SelectField value={saType} onChange={setSaType} placeholder="盐碱地类型" options={['苏打盐碱地', '氯化物盐碱地']} />
                      <div className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                      <TextFilter value={saName} onChange={setSaName} placeholder="盐碱地名称" />
                      <TextFilter value={saCode} onChange={setSaCode} placeholder="盐碱地编码" />
                    </div>
                  </div>
                </section>
              )}

              {/* ─── 承包筛选（种植分布） ─── */}
              {activeTab === 'crops' && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-[#0A4D4A] rounded-full" />
                    <h4 className="text-sm font-bold text-slate-800">承包类型</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CROP_LAYER_META.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => toggleCropLayer(l.id)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-xs font-medium border transition-colors',
                          visibleCropLayers.has(l.id)
                            ? 'bg-[#0D665E] text-white border-[#0D665E]'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300',
                        )}
                      >
                        {l.label}
                      </button>
                    ))}
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
                    <SelectField value={iotTypeFilter} onChange={setIotTypeFilter} placeholder="设备类型" options={['WEATHER_STATION', 'SOIL_SENSOR', 'SOIL_MOISTURE', 'CAMERA', 'SPORE_TRAP', 'PEST_MONITOR', 'FERTIGATION', 'HIGH_STANDARD']} />
                    <TextFilter value={iotCodeFilter} onChange={setIotCodeFilter} placeholder="设备编号" />
                    <TextFilter value={iotNameFilter} onChange={setIotNameFilter} placeholder="设备名称" />
                  </div>
                </section>
              )}
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════ 图层面板 ═══════ */}
      <AnimatePresence>
        {showLayerPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowLayerPanel(false); setLayerExpanded(false); }}
              className="absolute inset-0 z-30 bg-black/20"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: layerExpanded ? 0 : '35%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e, info) => {
                if (info.offset.y < -30) setLayerExpanded(true);
                else if (info.offset.y > 100) { setShowLayerPanel(false); setLayerExpanded(false); }
                else setLayerExpanded(false);
              }}
              className="absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-2xl flex flex-col"
            >
              <div className="flex justify-center pt-3 pb-1 shrink-0 touch-none">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 px-5 py-3">选择图层</h3>
            <div className="px-5 pb-6 space-y-1">
              {/* 土地资源图层 */}
              {activeTab === 'land' && LAYER_META.map((l) => (
                <button
                  key={l.id}
                  onClick={() => toggleLayer(l.id)}
                  className={cn(
                    'w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-colors',
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
                    'w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-colors',
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

      {/* ═══════ 底部分析条 ═══════ */}
      <AnalysisBar
        activeTab={activeTab}
        layerStats={layerStats}
        deviceStats={deviceStats}
        cropStats={{
          统种: farmPlots.filter((p) => p.type === 'LEASING' && p.leaseType === '统种').length,
          承租: farmPlots.filter((p) => p.type === 'LEASING' && p.leaseType === '承租').length,
        }}
      />
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

  const opGroups = {
    '播种': operations.filter((o: FieldOperation) => o.type === '播种'),
    '田间管理': operations.filter((o: FieldOperation) => o.type === '田间管理'),
    '收获': operations.filter((o: FieldOperation) => o.type === '收获'),
  };

  const OP_COLORS: Record<string, { bg: string; dot: string; text: string }> = {
    '播种': { bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700' },
    '田间管理': { bg: 'bg-amber-50', dot: 'bg-amber-500', text: 'text-amber-700' },
    '收获': { bg: 'bg-blue-50', dot: 'bg-blue-500', text: 'text-blue-700' },
  };

  // ─── 承租地详情 ───
  if (plot.leaseType === '承租') {
    return (
      <div className="space-y-5 pb-8">
        {/* 地图缩略图 */}
        <div className="bg-slate-200 rounded-xl h-32 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#C4A27C]/15" />
          <div
            className="w-3/4 h-3/5 rounded border-2 border-[#C4A27C]/40 bg-[#C4A27C]/20 flex items-center justify-center"
          >
            <span className="text-[11px] font-bold text-[#C4A27C]/60">{plot.name}</span>
          </div>
          <span className="absolute bottom-2 right-3 text-[9px] text-slate-400">地块范围示意</span>
        </div>

        {/* 基本信息 */}
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

        {/* 承包人信息 */}
        <section>
          <SectionTitle>承包人信息</SectionTitle>
          <div className="bg-slate-50 rounded-xl px-4 py-2">
            <InfoRow label="经营主体名称" value={plot.contractorName || '--'} />
            <InfoRow label="承包人身份" value={plot.contractorIdentity || '--'} />
            <InfoRow label="承包人退休日期" value={plot.retirementDate || '--'} />
            <InfoRow label="承包起止日期" value={plot.contractStartDate && plot.contractEndDate ? `${plot.contractStartDate} ~ ${plot.contractEndDate}` : '--'} />
            <InfoRow label="承包金额" value={plot.contractAmount ? `${plot.contractAmount.toLocaleString()} 元/年` : '--'} />
          </div>
          <button
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#0D665E] hover:bg-[#E8F4F4] transition-colors active:scale-[0.98]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
              <path d="M4 2v12m8-12v12M2 6h12M2 10h12" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-bold text-slate-500">合同附件</span>
          </button>
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

      {/* ═══ 田间作业档案 ═══ */}
      <section>
        <SectionTitle>田间作业档案</SectionTitle>
        <div className="space-y-3">
          {operations.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">暂无作业记录</p>
          )}
          {(['播种', '田间管理', '收获'] as const).map((opType) => {
            const items = opGroups[opType];
            if (items.length === 0) return null;
            const c = OP_COLORS[opType];
            return (
              <div key={opType}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  <span className={`text-xs font-bold ${c.text}`}>{opType}</span>
                  <span className="text-[10px] text-slate-400">{items.length} 条</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((op: FieldOperation) => (
                    <div key={op.id} className={`${c.bg} rounded-xl px-4 py-3`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-slate-700">{op.item}</span>
                        <span className="text-[11px] text-slate-400">{op.date}</span>
                      </div>
                      {op.detail && (
                        <p className="text-[11px] text-slate-500 mt-1">{op.detail}</p>
                      )}
                      {op.variety && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {op.crop} · {op.variety}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ 经营统计 ═══ */}
      <section>
        <SectionTitle>经营统计</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '合同面积', value: `${area.toLocaleString()} ㎡` },
            { label: '承包类型', value: leaseLabel },
            { label: '经营主体', value: plot.contractorName || '--' },
            { label: '主体身份', value: plot.contractorIdentity || '--' },
            { label: '作业记录', value: `${operations.length} 条` },
            { label: '合同起止', value: plot.contractStartDate && plot.contractEndDate ? `${plot.contractStartDate}\n~ ${plot.contractEndDate}` : '--' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] text-slate-400 font-medium mb-1">{stat.label}</p>
              <p className="text-[13px] font-bold text-slate-700 whitespace-pre-line leading-tight">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════ 筛选辅助组件 ═══════════════════════════════ */

function SelectField({ value, onChange, placeholder, options }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="flex-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none appearance-none"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
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
    FERTIGATION: '水肥一体机', HIGH_STANDARD: '智能控制终端',
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
    : device.type === 'HIGH_STANDARD'
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
                <ControlBtn label="📸 抓拍照片" color="blue" />
                <ControlBtn label="↻ 云台复位" color="slate" />
                <div className="grid grid-cols-3 gap-2">
                  {['⬆', '⬅', '➡', '⬇', '🔍+', '🔍−'].map((c) => (
                    <button key={c} className="h-10 rounded-xl bg-slate-50 border border-slate-200 text-sm active:bg-slate-100 font-medium">{c}</button>
                  ))}
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
            {![ 'FERTIGATION', 'CAMERA', 'SPORE_TRAP', 'PEST_MONITOR', 'WEATHER_STATION' ].includes(device.type as string) && (
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
  activeTab, layerStats, deviceStats, cropStats,
}: {
  activeTab: string;
  layerStats: Record<string, number>;
  deviceStats: { total: number; online: number; fault: number };
  cropStats: Record<string, number>;
}) {
  const [expanded, setExpanded] = useState(false);

  const summary = activeTab === 'land'
    ? `${layerStats.ZONGDI + layerStats.HIGH_STANDARD + layerStats.SALINE_ALKALI} 块地 · ${layerStats.ZONGDI}宗 ${layerStats.HIGH_STANDARD}高标 ${layerStats.SALINE_ALKALI}盐碱`
    : activeTab === 'crops'
    ? `${cropStats['统种'] + cropStats['承租']} 块承包地 · 统种${cropStats['统种']} 承租${cropStats['承租']}`
    : `${deviceStats.total} 台设备 · 在线${deviceStats.online} 离线${deviceStats.total - deviceStats.online - deviceStats.fault} 故障${deviceStats.fault}`;

  return (
    <>
      {/* 常驻窄条 */}
      {!expanded && (
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }}
          className="absolute bottom-0 left-2 right-2 z-20 mb-1"
        >
          <button
            onClick={() => setExpanded(true)}
            className="w-full bg-white/90 backdrop-blur rounded-2xl px-4 py-2.5 shadow-lg border border-slate-200/60 flex items-center gap-2 active:scale-[0.98] transition-transform"
          >
            <span className="text-xs">📊</span>
            <span className="text-[11px] text-slate-600 font-medium truncate flex-1 text-left">{summary}</span>
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
                <h3 className="text-[15px] font-bold text-slate-800">数据分析</h3>
                <button onClick={() => setExpanded(false)} className="text-xs text-slate-400 font-medium">收起</button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-8">
                {activeTab === 'land' && <LandAnalysis />}
                {activeTab === 'crops' && <CropAnalysis />}
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

function LandAnalysis() {
  const d = mockLandAnalysis;

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
          <div className="bg-white rounded-xl p-3"><p className="text-[10px] text-slate-400">集团总面积</p><p className="text-lg font-bold text-slate-800">{d.totalArea}<span className="text-xs text-slate-400 ml-0.5">万亩</span></p></div>
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
            {d.rightsDistribution.map((r) => (
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
            {d.landUse.reduce((acc: any[], item, i) => {
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
            {d.landUse.map((r) => (
              <span key={r.label} className="text-[10px] text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: r.color }} />{r.label} {r.pct}%
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* 4. 各农场土地类型 */}
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">各农场土地类型</h4>
        <div className="space-y-3">
          {d.farmLandTypes.map((f) => {
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
          {d.farmRights.map((f) => {
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
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">各行政区确权占比</h4>
        <div className="space-y-2">
          {d.regionRights.map((r) => (
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
    </div>
  );
}

/* ═══════════════════════════════ 种植分析 ═══════════════════════════════ */

function CropAnalysis() {
  const d = mockCropAnalysis;
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
              const pct = c.area / d.planTotal;
              const dashLen = circum * pct;
              const dashGap = circum - dashLen;
              els.push(<circle key={i} cx={cx} cy={cy} r={donutR} fill="none" stroke={c.color} strokeWidth={donutW}
                strokeDasharray={`${dashLen} ${dashGap}`} strokeDashoffset={-offset}
                transform="rotate(-90 60 60)" />);
              offset += dashLen;
              return els;
            }, [])}
            <text x="60" y="56" textAnchor="middle" fill="#1e293b" fontSize="13" fontWeight="700">{d.planTotal}万亩</text>
            <text x="60" y="72" textAnchor="middle" fill="#64748b" fontSize="9">计划总面积</text>
          </svg>
          <div className="flex-1 space-y-2 pt-1">
            {d.cropBreakdown.map((c) => (
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
          <div className="bg-white rounded-xl p-3 text-center"><p className="text-lg font-bold text-slate-800">{d.unifiedInput.materials}</p><p className="text-[10px] text-slate-400">农资（万元）</p></div>
          <div className="bg-white rounded-xl p-3 text-center"><p className="text-lg font-bold text-slate-800">{d.unifiedInput.machinery}</p><p className="text-[10px] text-slate-400">农机（万元）</p></div>
          <div className="bg-white rounded-xl p-3 text-center"><p className="text-lg font-bold text-slate-800">{d.unifiedInput.other}</p><p className="text-[10px] text-slate-400">其他（万元）</p></div>
        </div>
      </section>

      {/* 3. 各农场承租 / 统种占比 */}
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">各农场承租 / 统种占比</h4>
        <div className="space-y-3">
          {d.farmLeaseRatio.map((f) => (
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

      {/* 4. 各农场整体进度 */}
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">各农场整体进度</h4>
        <div className="flex gap-1 bg-slate-200 rounded-lg p-0.5 mb-3">
          {d.farmProgress.tabs.map((t, i) => (
            <button key={t} onClick={() => setProgressTab(i)}
              className={cn('flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all', progressTab === i ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400')}>{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] text-slate-500">整体进度</span>
          <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${d.farmProgress.overall}%` }} />
          </div>
          <span className="text-xs font-bold text-emerald-600">{d.farmProgress.overall}%</span>
        </div>
        <div className="space-y-2">
          {d.farmProgress.data.map((f) => (
            <div key={f.farm}>
              <p className="text-[10px] font-bold text-slate-500 mb-1">{f.farm}</p>
              <div className="h-4 rounded-full overflow-hidden flex gap-px">
                {d.farmProgress.categories.map((cat, ci) => {
                  const v = (f as any)[cat] as number;
                  const palette = ['#0D665E', '#2D9F7A', '#E8A838', '#94A3B8', '#CBD5E1'];
                  return <div key={cat} className="h-full" style={{ width: `${v / 2.5}%`, backgroundColor: palette[ci] }} />;
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-2 text-[8px] text-slate-400 flex-wrap">
          {d.farmProgress.categories.map((c, i) => {
            const palette = ['#0D665E', '#2D9F7A', '#E8A838', '#94A3B8', '#CBD5E1'];
            return <span key={c}>■ <span style={{ color: palette[i] }}>{c}</span></span>;
          })}
        </div>
      </section>

      {/* 5. 各农场累计投入 */}
      <section className="bg-slate-50 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">各农场累计投入</h4>
        <div className="flex gap-1 bg-slate-200 rounded-lg p-0.5 mb-3">
          {d.farmInput.tabs.map((t, i) => (
            <button key={t} onClick={() => setInputTab(i)}
              className={cn('flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all', inputTab === i ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400')}>{t}</button>
          ))}
        </div>
        <div className="space-y-3">
          {d.farmInput.data.map((f) => (
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
          {d.farmInput.scale.map((s) => <span key={s}>{s}</span>)}
          <span>亿元</span>
        </div>
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
              {d.recipes.map((r, i) => (
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
