/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import L from 'leaflet';

export type WeatherMetric = 'temp' | 'rain' | 'wind' | 'light' | 'humidity' | 'soilMoisture';

const METRIC_RANGES: Record<WeatherMetric, { min: number; max: number }> = {
  temp:     { min: -10, max: 40 },
  rain:     { min:   0, max: 80 },
  wind:     { min:   0, max: 15 },
  light:    { min: 200, max: 1200 },
  humidity: { min:  10, max: 100 },
  soilMoisture: { min: 0, max: 100 },
};

function seedVal(lat: number, lng: number, offset: number): number {
  const x = Math.round(lat * 1e5);
  const y = Math.round(lng * 1e5);
  const h = Math.sin(x * 0.1271 + y * 0.3109 + offset * 2.17) * 43758.5453;
  return (h - Math.floor(h) + 1) % 1;
}

function colorFor(metric: WeatherMetric, t: number): [number, number, number] {
  switch (metric) {
    case 'temp': {
      if (t < 0.2)  { const s = t / 0.2;  return [49+Math.round(s*150), 130+Math.round(s*55), 213-Math.round(s*53)]; }
      if (t < 0.4)  { const s=(t-0.2)/0.2; return [199+Math.round(s*56), 185+Math.round(s*25), 160-Math.round(s*70)]; }
      if (t < 0.6)  { const s=(t-0.4)/0.2; return [255, 210-Math.round(s*30), 90-Math.round(s*70)]; }
      if (t < 0.8)  { const s=(t-0.6)/0.2; return [255, 180-Math.round(s*100), 20]; }
      else          { const s=(t-0.8)/0.2; return [255-Math.round(s*60), 80-Math.round(s*50), 20]; }
    }
    case 'rain': {
      const s = 1 - t;
      return [180+Math.round(s*75), 200+Math.round(s*55), 240-Math.round(s*40)];
    }
    case 'wind': {
      if (t < 0.5)  { const s = t / 0.5;  return [240-Math.round(s*100), 248-Math.round(s*60), 255-Math.round(s*55)]; }
      else          { const s=(t-0.5)/0.5; return [140-Math.round(s*140), 188-Math.round(s*188), 200]; }
    }
    case 'light': {
      if (t < 0.5)  { const s = t / 0.5;  return [80+Math.round(s*100), 50+Math.round(s*180), 180-Math.round(s*40)]; }
      else          { const s=(t-0.5)/0.5; return [180+Math.round(s*75), 230+Math.round(s*25), 140+Math.round(s*115)]; }
    }
    case 'humidity': {
      if (t < 0.5)  { const s = t / 0.5;  return [200-Math.round(s*140), 80+Math.round(s*140), 40+Math.round(s*60)]; }
      else          { const s=(t-0.5)/0.5; return [60, 220-Math.round(s*120), 100+Math.round(s*155)]; }
    }
    case 'soilMoisture': {
      if (t < 0.5)  { const s = t / 0.5;  return [140-Math.round(s*120), 80+Math.round(s*120), 30+Math.round(s*70)]; }
      else          { const s=(t-0.5)/0.5; return [20, 200-Math.round(s*120), 100+Math.round(s*155)]; }
    }
  }
}

interface Props {
  map: L.Map | null;
  metric: WeatherMetric;
  visible: boolean;
}

export default function WeatherHeatmap({ map, metric, visible }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paneRef = useRef<HTMLElement | null>(null);

  // 创建自定义 pane 和 canvas（在 Leaflet 内部，地块图层下方）
  useEffect(() => {
    if (!map || !visible) return;

    // 自定义 pane，z-index 在 tile(200) 和 overlay(400) 之间
    let pane = map.getPane('weatherHeat') as HTMLElement | undefined;
    if (!pane) {
      pane = (map as any).createPane('weatherHeat');
      if (pane) pane.style.zIndex = '300';
    }
    paneRef.current = pane || null;

    // 创建 canvas 放入 pane
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvasRef.current = canvas;
    if (pane) pane.appendChild(canvas);

    return () => {
      canvasRef.current = null;
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [map, visible]);

  // 绘制
  useEffect(() => {
    if (!map || !visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const offscreen = document.createElement('canvas');

    const redraw = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      canvas.style.width = size.x + 'px';
      canvas.style.height = size.y + 'px';

      // 超低密度：屏幕只分 ~3 个色块
      const D = 5;
      const sw = D;
      const sh = Math.round(D * (size.y / size.x));
      offscreen.width = sw;
      offscreen.height = sh;
      const octx = offscreen.getContext('2d');
      if (!octx) return;

      const bounds = map.getBounds();
      const latMin = bounds.getSouth();
      const latMax = bounds.getNorth();
      const lngMin = bounds.getWest();
      const lngMax = bounds.getEast();

      for (let row = 0; row < sh; row++) {
        for (let col = 0; col < sw; col++) {
          const lat = latMin + (latMax - latMin) * (row / (sh - 1));
          const lng = lngMin + (lngMax - lngMin) * (col / (sw - 1));
          const t = seedVal(lat, lng, metric.charCodeAt(0));
          const [r, g, b] = colorFor(metric, t);
          octx.fillStyle = `rgba(${r},${g},${b},0.35)`;
          octx.fillRect(col, row, 1, 1);
        }
      }

      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, size.x, size.y);
      ctx.drawImage(offscreen, 0, 0, sw, sh, 0, 0, size.x, size.y);
    };

    map.on('moveend zoomend resize', redraw);
    redraw();

    return () => {
      map.off('moveend zoomend resize', redraw);
    };
  }, [map, metric, visible]);

  return null; // 不渲染 React 元素，canvas 直接挂在 Leaflet DOM 里
}
