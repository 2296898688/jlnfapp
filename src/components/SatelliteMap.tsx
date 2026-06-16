/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPlot, Device, Farm } from '../types';

/* ═══════════ 地块颜色 ═══════════ */
const PLOT_COLORS: Record<string, string> = {
  ZONGDI: '#4B7B73',
  HIGH_STANDARD: '#2D9F7A',
  SALINE_ALKALI: '#E8A838',
  LEASING: '#7A9E8F',
};

/* ═══════════ 作物图标 ═══════════ */
const CROP_EMOJI: Record<string, string> = {
  '玉米': '🌽',
  '小麦': '🌾',
  '大豆': '🫘',
};

/* ═══════════ 模拟地块形状（吉林白城附近） ═══════════ */

const CENTERS = [
  { lat: 45.548, lng: 122.770 }, { lat: 45.546, lng: 122.785 },
  { lat: 45.542, lng: 122.758 }, { lat: 45.540, lng: 122.792 },
  { lat: 45.537, lng: 122.775 }, { lat: 45.535, lng: 122.805 },
  { lat: 45.533, lng: 122.762 }, { lat: 45.530, lng: 122.788 },
  { lat: 45.527, lng: 122.770 }, { lat: 45.525, lng: 122.798 },
  { lat: 45.522, lng: 122.782 }, { lat: 45.520, lng: 122.755 },
  { lat: 45.518, lng: 122.790 }, { lat: 45.538, lng: 122.818 },
  { lat: 45.528, lng: 122.740 }, { lat: 45.544, lng: 122.810 },
  { lat: 45.550, lng: 122.778 }, { lat: 45.544, lng: 122.798 },
  { lat: 45.539, lng: 122.765 }, { lat: 45.536, lng: 122.812 },
  { lat: 45.532, lng: 122.780 }, { lat: 45.529, lng: 122.802 },
  { lat: 45.526, lng: 122.762 }, { lat: 45.523, lng: 122.790 },
  { lat: 45.520, lng: 122.772 }, { lat: 45.517, lng: 122.798 },
  { lat: 45.541, lng: 122.805 }, { lat: 45.534, lng: 122.750 },
  { lat: 45.531, lng: 122.775 }, { lat: 45.524, lng: 122.740 },
  { lat: 45.547, lng: 122.795 }, { lat: 45.539, lng: 122.738 },
  { lat: 45.535, lng: 122.795 }, { lat: 45.529, lng: 122.755 },
  { lat: 45.525, lng: 122.808 }, { lat: 45.521, lng: 122.765 },
  { lat: 45.543, lng: 122.780 }, { lat: 45.537, lng: 122.822 },
  { lat: 45.533, lng: 122.740 }, { lat: 45.528, lng: 122.815 },
  { lat: 45.519, lng: 122.782 }, { lat: 45.545, lng: 122.765 },
  { lat: 45.540, lng: 122.748 }, { lat: 45.530, lng: 122.810 },
  { lat: 45.523, lng: 122.750 }, { lat: 45.516, lng: 122.805 },
];

/** 六套不同的不规则顶点偏移 — 模拟宗地真实边界 */
const IRREGULAR_SHAPES: [number, number][][] = [
  [[-0.006,-0.005],[0.002,-0.006],[0.007,-0.003],[0.006,0.003],[0.001,0.005],[-0.005,0.004],[-0.008,0.000]],
  [[-0.005,-0.004],[-0.001,-0.007],[0.006,-0.005],[0.008,-0.001],[0.007,0.004],[0.002,0.006],[-0.004,0.005],[-0.007,0.001]],
  [[-0.007,-0.003],[-0.002,-0.005],[0.004,-0.006],[0.008,-0.002],[0.009,0.002],[0.005,0.005],[-0.002,0.006],[-0.006,0.003]],
  [[-0.004,-0.006],[0.000,-0.008],[0.005,-0.005],[0.008,0.000],[0.006,0.005],[0.000,0.007],[-0.005,0.006],[-0.008,0.002]],
  [[-0.008,-0.002],[-0.003,-0.006],[0.002,-0.007],[0.007,-0.004],[0.008,0.001],[0.004,0.004],[-0.001,0.006],[-0.006,0.004]],
  [[-0.006,-0.004],[0.001,-0.006],[0.005,-0.003],[0.007,0.001],[0.004,0.005],[-0.001,0.006],[-0.005,0.003],[-0.008,-0.001]],
  [[-0.007,-0.005],[0.003,-0.006],[0.008,-0.001],[0.005,0.004],[-0.002,0.006],[-0.007,0.002],[-0.009,-0.002]],
  [[-0.004,-0.005],[0.002,-0.008],[0.007,-0.004],[0.006,0.002],[0.003,0.006],[-0.003,0.007],[-0.006,0.002]],
  [[-0.008,-0.003],[-0.004,-0.006],[0.003,-0.007],[0.008,-0.003],[0.007,0.003],[0.001,0.006],[-0.005,0.005],[-0.009,0.000]],
  [[-0.005,-0.006],[-0.001,-0.007],[0.005,-0.005],[0.009,-0.001],[0.006,0.004],[0.000,0.006],[-0.006,0.004],[-0.008,-0.001]],
  [[-0.002,-0.005],[0.005,-0.005],[0.008,0.001],[0.003,0.006],[-0.002,0.008],[-0.007,0.003]],
  [[-0.005,-0.002],[-0.001,-0.006],[0.004,-0.006],[0.008,-0.003],[0.009,0.002],[0.004,0.006],[-0.003,0.006],[-0.008,0.001]],
];

/** 较为规整的形状 — 高标准农田 */
const SEMI_REGULAR_SHAPES: [number, number][][] = [
  [[-0.005,-0.004],[0.005,-0.004],[0.005,0.004],[-0.005,0.004]],
  [[-0.006,-0.003],[0.004,-0.004],[0.006,0.002],[0.003,0.005],[-0.004,0.004]],
  [[-0.004,-0.005],[0.004,-0.005],[0.005,0.003],[-0.005,0.003]],
  [[-0.005,-0.002],[0.005,-0.003],[0.006,0.004],[0.002,0.005],[-0.004,0.004]],
  [[-0.006,-0.004],[0.005,-0.003],[0.005,0.005],[-0.004,0.005]],
  [[-0.004,-0.004],[0.005,-0.005],[0.005,0.003],[0.000,0.005],[-0.005,0.003]],
  [[-0.005,-0.005],[0.004,-0.005],[0.005,0.004],[-0.004,0.005]],
  [[-0.004,-0.003],[0.006,-0.003],[0.004,0.004],[-0.005,0.003]],
  [[-0.006,-0.005],[0.005,-0.004],[0.006,0.003],[-0.005,0.005]],
  [[-0.005,-0.003],[0.006,-0.004],[0.005,0.005],[-0.006,0.002]],
  [[-0.004,-0.005],[0.003,-0.006],[0.005,0.002],[0.002,0.005],[-0.005,0.004]],
  [[-0.005,-0.003],[0.006,-0.003],[0.005,0.004],[-0.005,0.004]],
];

/** 长方形 — 承包地块 */
const RECT_SHAPES: [number, number][][] = [
  [[-0.006,-0.003],[0.006,-0.003],[0.006,0.003],[-0.006,0.003]],
  [[-0.007,-0.002],[0.005,-0.002],[0.005,0.004],[-0.007,0.004]],
  [[-0.004,-0.004],[0.007,-0.004],[0.007,0.002],[-0.004,0.002]],
  [[-0.005,-0.003],[0.006,-0.003],[0.006,0.003],[-0.005,0.003]],
  [[-0.008,-0.002],[0.004,-0.002],[0.004,0.005],[-0.008,0.005]],
  [[-0.005,-0.004],[0.005,-0.004],[0.005,0.004],[-0.005,0.004]],
  [[-0.006,-0.002],[0.006,-0.002],[0.006,0.004],[-0.006,0.004]],
  [[-0.004,-0.003],[0.007,-0.003],[0.007,0.003],[-0.004,0.003]],
  [[-0.007,-0.004],[0.004,-0.004],[0.004,0.003],[-0.007,0.003]],
  [[-0.005,-0.002],[0.006,-0.002],[0.006,0.005],[-0.005,0.005]],
  [[-0.003,-0.003],[0.008,-0.003],[0.008,0.003],[-0.003,0.003]],
  [[-0.006,-0.004],[0.005,-0.004],[0.005,0.002],[-0.006,0.002]],
  [[-0.005,-0.003],[0.005,-0.003],[0.005,0.005],[-0.005,0.005]],
  [[-0.004,-0.002],[0.007,-0.002],[0.007,0.004],[-0.004,0.004]],
  [[-0.006,-0.003],[0.004,-0.003],[0.004,0.004],[-0.006,0.004]],
  [[-0.005,-0.004],[0.006,-0.004],[0.006,0.003],[-0.005,0.003]],
];

/** 地块 → 顶点 LatLng 数组 */
function plotLatLngs(plot: MapPlot, index: number): L.LatLng[] {
  const center = CENTERS[index % CENTERS.length];
  const isZongdi = plot.type === 'ZONGDI';
  const isLeasing = plot.type === 'LEASING';
  const isHighStd = plot.type === 'HIGH_STANDARD';

  let shape: [number, number][];
  let scale = 1.0;

  if (isZongdi) {
    shape = IRREGULAR_SHAPES[index % IRREGULAR_SHAPES.length];
    scale = 0.8 + (index % 5) * 0.1; // 不同大小
  } else if (isHighStd) {
    shape = SEMI_REGULAR_SHAPES[index % SEMI_REGULAR_SHAPES.length];
    scale = 0.9;
  } else if (isLeasing) {
    shape = RECT_SHAPES[index % RECT_SHAPES.length];
    scale = 0.8 + (index % 3) * 0.15;
  } else {
    shape = IRREGULAR_SHAPES[(index + 1) % IRREGULAR_SHAPES.length];
    scale = 0.85;
  }

  return shape.map(([dlng, dlat]) =>
    L.latLng(center.lat + dlat * scale, center.lng + dlng * scale),
  );
}

interface Props {
  plots: MapPlot[];
  devices: Device[];
  farms: Farm[];
  selectedFarmId: string;
  onFarmSelect: (farm: Farm) => void;
  showLand: boolean;
  showCrops: boolean;
  showIot: boolean;
  selectedPlot: MapPlot | null;
  selectedDevice: Device | null;
  onPlotClick: (plot: MapPlot) => void;
  onDeviceClick: (device: Device) => void;
  onPlotLongPress?: (plot: MapPlot) => void;
  onMapReady?: (map: L.Map) => void;
}

export default function SatelliteMap({
  plots,
  devices,
  farms,
  selectedFarmId,
  onFarmSelect,
  showLand,
  showCrops,
  showIot,
  selectedPlot,
  selectedDevice,
  onPlotClick,
  onDeviceClick,
  onPlotLongPress,
  onMapReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const plotLayerRef = useRef<L.LayerGroup | null>(null);
  const deviceLayerRef = useRef<L.LayerGroup | null>(null);
  const farmLayerRef = useRef<L.LayerGroup | null>(null);

  // 初始化地图
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [45.535, 122.780],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // 卫星底图（ESRI World Imagery，免费免 Key）
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18 },
    ).addTo(map);

    mapRef.current = map;
    plotLayerRef.current = L.layerGroup().addTo(map);
    deviceLayerRef.current = L.layerGroup().addTo(map);
    farmLayerRef.current = L.layerGroup().addTo(map);
    if (onMapReady) onMapReady(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 更新地块图层
  const updatePlots = useCallback(() => {
    const layer = plotLayerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;

    layer.clearLayers();

    if (!showLand && !showCrops) return;

    plots.forEach((plot, i) => {
      const latlngs = plotLatLngs(plot, i);
      const color = getPlotColor(plot, showCrops);
      const isSel = selectedPlot?.id === plot.id;

      const borderColor = isSel ? '#fff' : darkenColor(color, 0.3);
      const borderWeight = isSel ? 3 : 1.5;

      const polygon = L.polygon(latlngs, {
        color: borderColor,
        weight: borderWeight,
        fillColor: isSel ? '#fff' : color,
        fillOpacity: isSel ? 0.75 : 0.5,
        dashArray: isSel ? undefined : '0',
      });

      polygon.bindTooltip(plot.name, {
        direction: 'center',
        className: 'map-label',
        permanent: false,
      });

      // 长按检测 (移动端)
      let pressTimer: ReturnType<typeof setTimeout> | null = null;
      polygon.on('mousedown', () => { pressTimer = setTimeout(() => { if (onPlotLongPress) onPlotLongPress(plot); }, 500); });
      polygon.on('mouseup', () => { if (pressTimer) clearTimeout(pressTimer); });
      polygon.on('touchstart', () => { pressTimer = setTimeout(() => { if (onPlotLongPress) onPlotLongPress(plot); }, 500); });
      polygon.on('touchend', () => { if (pressTimer) clearTimeout(pressTimer); });

      polygon.on('click', () => {
        if (pressTimer) clearTimeout(pressTimer); // 取消长按
        onPlotClick(plot);
      });

      polygon.addTo(layer);

      // 种植分布模式 — 在作物地块中心显示图标
      if (showCrops && plot.crop && CROP_EMOJI[plot.crop]) {
        const centerLat = latlngs.reduce((s, ll) => s + ll.lat, 0) / latlngs.length;
        const centerLng = latlngs.reduce((s, ll) => s + ll.lng, 0) / latlngs.length;
        const emoji = CROP_EMOJI[plot.crop];
        const isSel = selectedPlot?.id === plot.id;

        const cropIcon = L.divIcon({
          className: 'leaflet-crop-marker',
          html: `<div style="
            font-size:${isSel ? '28' : '22'}px;
            line-height:1;
            filter:drop-shadow(0 1px 3px rgba(0,0,0,0.4));
            transform:translate(-50%,-50%);
            pointer-events:none;
          ">${emoji}</div>`,
          iconSize: [isSel ? 28 : 22, isSel ? 28 : 22],
          iconAnchor: [isSel ? 14 : 11, isSel ? 14 : 11],
        });

        L.marker([centerLat, centerLng], { icon: cropIcon, interactive: false }).addTo(layer);
      }
    });
  }, [plots, showLand, showCrops, selectedPlot, onPlotClick, onPlotLongPress]);

  /** HEX 颜色加深 */
  function darkenColor(hex: string, factor: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const d = (c: number) => Math.round(c * (1 - factor)).toString(16).padStart(2, '0');
    return `#${d(r)}${d(g)}${d(b)}`;
  }

  // 更新设备图层
  const updateDevices = useCallback(() => {
    const layer = deviceLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    if (!showIot) return;

    const showLabel = true;

    devices.forEach((d) => {
      const pos: [number, number] = [d.location.lat, d.location.lng];
      const isSel = selectedDevice?.id === d.id;
      const dSize = isSel ? 28 : 22;

      const icon = L.divIcon({
        className: 'leaflet-device-marker',
        html: `<div style="display:flex;align-items:center;gap:6px;white-space:nowrap;">
          <div style="
            width:${dSize}px;height:${dSize}px;
            background:#fff;
            border:2px solid ${isSel ? '#0D665E' : d.status === 'FAULT' ? '#F43F5E' : '#94a3b8'};
            border-radius:50%;display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 6px rgba(0,0,0,0.2);
            flex-shrink:0;
          ">
            <div style="width:8px;height:8px;border-radius:50%;
              background:${d.status === 'ONLINE' ? '#10B981' : d.status === 'FAULT' ? '#F43F5E' : '#94a3b8'}">
            </div>
          </div>
          ${showLabel ? `<span style="
            font-size:10px;font-weight:700;color:#1e293b;
            background:rgba(255,255,255,0.85);padding:2px 6px;border-radius:4px;
            box-shadow:0 1px 3px rgba(0,0,0,0.1);
          ">${d.name}</span>` : ''}
        </div>`,
        iconSize: showLabel ? [180, dSize + 4] : [dSize, dSize],
        iconAnchor: showLabel ? [0, dSize / 2 + 1] : [dSize / 2, dSize / 2],
      });

      const marker = L.marker(pos, { icon });

      marker.on('click', () => {
        onDeviceClick(d);
      });

      marker.addTo(layer);
    });
  }, [devices, showIot, selectedDevice, onDeviceClick]);

  // 更新农场标记
  const updateFarms = useCallback(() => {
    const layer = farmLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    farms.forEach((f) => {
      if (f.id === 'all') return; // 跳过"全集团"
      const isSel = f.id === selectedFarmId;

      const icon = L.divIcon({
        className: 'leaflet-farm-marker',
        html: `<div style="
          display:flex;flex-direction:column;align-items:center;
          position:absolute;bottom:0;left:50%;transform:translateX(-50%);
        ">
          <div style="
            background:${isSel ? '#0D665E' : '#fff'};
            color:${isSel ? '#fff' : '#0D665E'};
            border:2px solid ${isSel ? '#0D665E' : '#94a3b8'};
            border-radius:20px;
            padding:5px 12px;
            font-size:11px;
            font-weight:700;
            white-space:nowrap;
            box-shadow:0 2px 8px rgba(0,0,0,0.2);
          ">📍 ${f.name}</div>
          <div style="
            width:0;height:0;
            border-left:6px solid transparent;
            border-right:6px solid transparent;
            border-top:6px solid ${isSel ? '#0D665E' : '#94a3b8'};
          "></div>
        </div>`,
        iconSize: [120, 40],
        iconAnchor: [60, 0],
      });

      const marker = L.marker([f.center.lat, f.center.lng], { icon });
      marker.on('click', () => onFarmSelect(f));
      marker.addTo(layer);
    });
  }, [farms, selectedFarmId, onFarmSelect]);

  useEffect(() => { updatePlots(); }, [updatePlots]);
  useEffect(() => { updateDevices(); }, [updateDevices]);
  useEffect(() => { updateFarms(); }, [updateFarms]);

  // 选中项变化时，飞行到对应位置
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedPlot) {
      const idx = plots.findIndex((p) => p.id === selectedPlot.id);
      const latlngs = plotLatLngs(selectedPlot, idx >= 0 ? idx : 0);
      const bounds = L.latLngBounds(latlngs);
      map.flyToBounds(bounds, { padding: [80, 80], duration: 0.5 });
    } else if (selectedDevice) {
      map.flyTo([selectedDevice.location.lat, selectedDevice.location.lng], 16, { duration: 0.5 });
    }
  }, [selectedPlot, selectedDevice, plots, devices]);

  // 农场选中 → 飞行（跳过初始挂载）
  const farmInitRef = useRef(false);
  useEffect(() => {
    if (!farmInitRef.current) { farmInitRef.current = true; return; }
    const map = mapRef.current;
    if (!map) return;
    if (selectedFarmId === 'all') {
      map.flyTo([45.535, 122.780], 13, { duration: 0.4 });
      return;
    }
    const farm = farms.find((f) => f.id === selectedFarmId);
    if (farm) {
      map.flyTo([farm.center.lat, farm.center.lng], 15, { duration: 0.4 });
    }
  }, [selectedFarmId, farms]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ zIndex: 1 }}
    />
  );
}

function getPlotColor(plot: MapPlot, _showCrops: boolean): string {
  if (plot.type === 'LEASING') {
    return plot.leaseType === '承租' ? '#C4A27C' : PLOT_COLORS.LEASING;
  }
  return PLOT_COLORS[plot.type] || PLOT_COLORS.ZONGDI;
}
