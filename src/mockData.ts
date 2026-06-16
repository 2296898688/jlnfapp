import { User, TodoItem, LandStat, Device, PlantingRecord, PlantingPlan, AgronomicRecipe, YieldRecord, Staff, StaffOperationDetail, MapPlot, Farm, FieldOperation } from './types';

// ─── 三种角色的演示用户 ───
export const DEMO_USERS: Record<string, User> = {
  admin: {
    id: 'u-admin',
    username: 'admin',
    realName: '农发集团管理',
    role: 'GROUP_ADMIN',
    orgName: '吉林农发集团',
    orgFilter: undefined,
    avatar: '',
  },
  nongken: {
    id: 'u-nongken',
    username: 'nongken',
    realName: '农垦集团管理',
    role: 'NONGKEN_ADMIN',
    orgName: '吉林农垦集团',
    orgFilter: undefined,
    avatar: '',
  },
  land: {
    id: 'u-land',
    username: 'land',
    realName: '土地资源公司',
    role: 'LAND_COMPANY_ADMIN',
    orgName: '吉林土地发展公司',
    orgFilter: undefined,
    avatar: '',
  },
  farm: {
    id: 'u-farm',
    username: 'farm',
    realName: '白城牧场管理员',
    role: 'FARM_ADMIN',
    orgName: '白城牧场',
    orgFilter: '白城牧场',
    avatar: '',
  },
};

// 默认用户（兼容旧代码）
export const mockUser: User = DEMO_USERS['admin'];

export const mockTodos: TodoItem[] = [
  { id: '1', title: '智能水阀 B-12 离线预警：检测通讯模块状态', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 09:12' },
  { id: '2', title: '土壤墒情站 S-07 传感器电量低于 10%，请及时更换', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 10:45' },
  { id: '3', title: '盐碱地 3 号监测终端环境湿度数据异常波动', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 11:30' },
  { id: '4', title: '自动气象站 P-01 风速计堵塞提醒，建议前往清理', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 13:20' },
];

// ─── 角色专属告警（统一为物联网设备告警） ───
export const ROLE_TODOS: Record<string, TodoItem[]> = {
  GROUP_ADMIN: [
    { id: 'ga1', title: '白城牧场：智能水阀 B-12 离线预警，需关注通讯模块', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 09:12' },
    { id: 'ga2', title: '镇南种羊场：土壤墒情站 S-07 传感器电量低于 10%', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 10:45' },
    { id: 'ga3', title: '长岭种马场：盐碱地 3 号监测终端湿度数据异常波动', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 11:30' },
    { id: 'ga4', title: '白城牧场：自动气象站 P-01 风速计堵塞，建议清理', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 13:20' },
  ],
  FARM_ADMIN: [
    { id: 'fa1', title: '智能水阀 B-12 离线预警：检测通讯模块状态', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 09:12' },
    { id: 'fa2', title: '土壤墒情站 S-07 传感器电量低于 10%，请及时更换', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 10:45' },
    { id: 'fa3', title: '盐碱地 3 号监测终端环境湿度数据异常波动', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 11:30' },
    { id: 'fa4', title: '自动气象站 P-01 风速计堵塞提醒，建议前往清理', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 13:20' },
  ],
  OPERATOR: [
    { id: 'op1', title: '土壤传感器 #03 湿度读数偏离阈值，请现场核查', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 09:12' },
    { id: 'op2', title: '智能水阀 B-12 通讯模块离线，请检查电源连接', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 10:45' },
    { id: 'op3', title: '气象站 P-01 风速计数据中断，需前往清理堵塞物', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 11:30' },
    { id: 'op4', title: '墒情站 S-07 电池电量低于 10%，请安排更换', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 13:20' },
  ],
  NONGKEN_ADMIN: [
    { id: 'nk1', title: '白城牧场：宗地确权进度需关注，3块宗地待办', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 09:12' },
    { id: 'nk2', title: '镇南种羊场：承租合同即将到期，请及时续签', type: 'APPROVAL', status: 'PENDING', createTime: '2024-05-20 10:45' },
    { id: 'nk3', title: '长岭种马场：土壤墒情站 M-02 数据异常波动', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 11:30' },
    { id: 'nk4', title: '白城牧场：本月土地利用率统计报告已生成', type: 'REPORT', status: 'COMPLETED', createTime: '2024-05-20 13:20' },
  ],
  LAND_COMPANY_ADMIN: [
    { id: 'lc1', title: '白城牧场：智能水阀 B-12 离线预警，需关注通讯模块', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 09:12' },
    { id: 'lc2', title: '镇南种羊场：高标准农田建设进度更新', type: 'APPROVAL', status: 'PENDING', createTime: '2024-05-20 10:45' },
    { id: 'lc3', title: '长岭种马场：盐碱地改良项目阶段验收报告', type: 'REPORT', status: 'PENDING', createTime: '2024-05-20 11:30' },
    { id: 'lc4', title: '白城牧场：自动气象站 P-01 风速计堵塞，建议清理', type: 'TASK', status: 'PENDING', createTime: '2024-05-20 13:20' },
  ],
};

// ─── 角色专属 KPI 数据 ───
export const ROLE_KPIS: Record<string, { label: string; value: string; sub: string; color: string }[]> = {
  GROUP_ADMIN: [
    { label: '全集团总面积', value: '30.8万', sub: '较去年+2.1%', color: 'indigo' },
    { label: '在田作物', value: '12类', sub: '覆盖 4 个农场', color: 'emerald' },
    { label: '本月产值', value: '1,286万', sub: '较上月+8.3%', color: 'amber' },
    { label: '设备在线率', value: '94.8%', sub: '故障 15 台', color: 'blue' },
  ],
  FARM_ADMIN: [
    { label: '农场总面积', value: '4.5万', sub: '宗地 124 块', color: 'indigo' },
    { label: '在田作物', value: '5类', sub: '玉米/小麦/大豆为主', color: 'emerald' },
    { label: '本月投入', value: '86.5万', sub: '预算执行 72%', color: 'amber' },
    { label: '设备在线率', value: '96.2%', sub: '故障 3 台', color: 'blue' },
  ],
  OPERATOR: [
    { label: '我的地块', value: '12块', sub: '面积 1,250 亩', color: 'indigo' },
    { label: '今日任务', value: '3项', sub: '追肥 / 除草 / 巡检', color: 'emerald' },
    { label: '本周完成', value: '8项', sub: '完成率 89%', color: 'amber' },
    { label: '负责设备', value: '24台', sub: '在线 23 / 故障 1', color: 'blue' },
  ],
  NONGKEN_ADMIN: [
    { label: '全集团宗地', value: '12块', sub: '总面积 30.8万亩', color: 'indigo' },
    { label: '在田作物', value: '12类', sub: '覆盖 4 个农场', color: 'emerald' },
    { label: '本月产值', value: '1,286万', sub: '较上月+8.3%', color: 'amber' },
    { label: '设备在线率', value: '94.8%', sub: '故障 15 台', color: 'blue' },
  ],
  LAND_COMPANY_ADMIN: [
    { label: '全集团总面积', value: '30.8万', sub: '较去年+2.1%', color: 'indigo' },
    { label: '在田作物', value: '12类', sub: '覆盖 4 个农场', color: 'emerald' },
    { label: '本月产值', value: '1,286万', sub: '较上月+8.3%', color: 'amber' },
    { label: '设备在线率', value: '94.8%', sub: '故障 15 台', color: 'blue' },
  ],
};

export const landStats: LandStat[] = [
  { label: '宗地总数', value: 124, unit: '块', color: '#3B82F6' },
  { label: '总面积', value: 45200, unit: '亩', color: '#10B981' },
  { label: '高标准农田', value: 32000, unit: '亩', color: '#F59E0B' },
  { label: '盐碱地', value: 8500, unit: '亩', color: '#6366F1' },
];

export const deviceStats = [
  { label: '物联网设备', value: 1560, unit: '台', color: '#0EA5E9' },
  { label: '在线设备', value: 1480, unit: '台', color: '#22C55E' },
  { label: '离线设备', value: 65, unit: '台', color: '#94A3B8' },
  { label: '故障设备', value: 15, unit: '台', color: '#EF4444' },
];

export const springProgress = [
  { name: '统种地', value: 85 },
  { name: '承租地', value: 70 },
];

export const harvestProgress = [
  { name: '统种地', value: 45 },
  { name: '承租地', value: 30 },
];

export const mockFarms: Farm[] = [
  { id: 'all', name: '全集团视角', totalArea: '30.8万亩', location: '吉林省·白城市', center: { lat: 45.535, lng: 122.780 } },
  { id: 'f1', name: '白城牧场', totalArea: '12.5万亩', location: '吉林省·白城市', center: { lat: 45.542, lng: 122.758 } },
  { id: 'f2', name: '镇南种羊场', totalArea: '8.2万亩', location: '吉林省·白城市', center: { lat: 45.530, lng: 122.788 } },
  { id: 'f3', name: '长岭种马场', totalArea: '10.1万亩', location: '吉林省·白城市', center: { lat: 45.520, lng: 122.755 } },
  { id: 'f4', name: '洮南农场', totalArea: '6.8万亩', location: '吉林省·白城市', center: { lat: 45.552, lng: 122.810 } },
  { id: 'f5', name: '大安农场', totalArea: '7.5万亩', location: '吉林省·白城市', center: { lat: 45.548, lng: 122.720 } },
  { id: 'f6', name: '通榆农场', totalArea: '9.2万亩', location: '吉林省·白城市', center: { lat: 45.510, lng: 122.800 } },
];

export const mockWeather = {
  temp: 26,
  condition: '晴',
  conditionIcon: '☀️',
  humidity: 38,
  windDir: '南风',
  windSpeed: 2,
  rainfall: 2,
  trend: '近三天无降雨',
  location: '吉林省·白城市',
};

export interface WeatherGridCell {
  lat: number;
  lng: number;
  temp: number;        // -10 ~ 40
  rain: number;         // 0 ~ 80 mm
  wind: number;         // 0 ~ 15 m/s
  light: number;        // 200 ~ 1200 W/m²
  humidity: number;     // 10 ~ 100 %
  soilMoisture: number; // 0 ~ 100 %
}

// 15×15 气象网格，覆盖地图可见区域
function seedRandom(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function generateWeatherGrid(): WeatherGridCell[] {
  const grid: WeatherGridCell[] = [];
  const LAT_MIN = 45.514;
  const LAT_MAX = 45.552;
  const LNG_MIN = 122.735;
  const LNG_MAX = 122.825;
  const SIZE = 15;

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const lat = LAT_MIN + (LAT_MAX - LAT_MIN) * (row / (SIZE - 1));
      const lng = LNG_MIN + (LNG_MAX - LNG_MIN) * (col / (SIZE - 1));
      const r = (v: number) => seedRandom(row + v, col + v);

      // 模拟空间连续性：相邻格点值相近
      grid.push({
        lat,
        lng,
        temp: 15 + r(0.1) * 22,                                  // 15~37°C
        rain: Math.max(0, r(0.2) * 60 - 10 + (row < 5 ? 20 : 0)), // 东北偏多
        wind: 1 + r(0.3) * 12,                                    // 1~13 m/s
        light: 300 + r(0.4) * 800 + (col > 10 ? 100 : 0),         // 东侧偏亮
        humidity: 25 + r(0.5) * 60,                               // 25~85%
        soilMoisture: 10 + r(0.6) * 75,                           // 10~85%
      });
    }
  }
  return grid;
}

export const mockWeatherGrid = generateWeatherGrid();

export const mockCropAnalysis = {
  planTotal: 120,      // 万亩
  planLeased: 2.1,     // 承租耕地
  planUnified: 1.9,    // 统种耕地
  leaseRent: 0.5,      // 亿元租金
  cropBreakdown: [
    { crop: '玉米', area: 52, color: '#E8A838' },
    { crop: '大豆', area: 35, color: '#8B5CF6' },
    { crop: '小麦', area: 20, color: '#4B8FE0' },
    { crop: '其他', area: 13, color: '#CBD5E1' },
  ],

  recipes: [
    { pesticide: 2, fertilizer: 0, additive: 0, operation: '播种', crop: '玉米' },
    { pesticide: 4, fertilizer: 0, additive: 0, operation: '田间管理', crop: '玉米' },
    { pesticide: 5, fertilizer: 0, additive: 0, operation: '田间管理', crop: '大豆' },
    { pesticide: 4, fertilizer: 0, additive: 0, operation: '田间管理', crop: '玉米' },
    { pesticide: 4, fertilizer: 0, additive: 0, operation: '田间管理', crop: '大豆' },
    { pesticide: 0, fertilizer: 3, additive: 0, operation: '播种', crop: '大豆' },
    { pesticide: 4, fertilizer: 0, additive: 0, operation: '田间管理', crop: '大豆' },
  ],

  unifiedInput: { materials: 876, machinery: 390, other: 529 }, // 万元

  farmLeaseRatio: [
    { farm: '白城牧场', lease: 1.9, leasePct: 52.1, unifiedPct: 47.9 },
    { farm: '镇南种羊场', lease: 1.6, leasePct: 48.4, unifiedPct: 51.6 },
    { farm: '长岭种马场', lease: 1.2, leasePct: 47.9, unifiedPct: 52.1 },
  ],

  farmProgress: {
    tabs: ['春播', '夏管', '秋收'] as string[],
    overall: 55,
    categories: ['粮食', '油料', '经济', '牧草', '杂粮及其他'] as string[],
    data: [
      { farm: '白城牧场', 粮食: 62, 油料: 48, 经济: 35, 牧草: 28, 杂粮及其他: 20 },
      { farm: '镇南种羊场', 粮食: 58, 油料: 52, 经济: 30, 牧草: 25, 杂粮及其他: 18 },
      { farm: '长岭种马场', 粮食: 50, 油料: 45, 经济: 38, 牧草: 30, 杂粮及其他: 22 },
    ],
  },

  farmInput: {
    tabs: ['农资', '农机', '其他'] as string[],
    data: [
      { farm: '长岭种马场', pct: 60 },
      { farm: '镇南种羊场', pct: 55 },
      { farm: '白城牧场', pct: 40 },
    ],
    scale: [0.07, 0.42, 0.87, 1.17, 1.57, 1.97, 2.37],
  },
};

export const mockLandAnalysis = {
  totalArea: 324.1,       // 万亩
  confirmedArea: 44.7,    // 已确权
  unconfirmedArea: 192.8, // 未确权
  confirmRate: 13.8,      // 确权完成率 %

  // 确权面积分布
  rightsDistribution: [
    { label: '已发证', value: 44.3, pct: 13.7, color: '#0D665E' },
    { label: '已登记未发证', value: 43.6, pct: 13.5, color: '#2D9F7A' },
    { label: '已确权未登记', value: 43.3, pct: 13.4, color: '#E8A838' },
    { label: '未确权', value: 192.9, pct: 59.5, color: '#CBD5E1' },
  ],

  // 土地利用占比
  landUse: [
    { label: '耕地', pct: 54.15, color: '#0D665E' },
    { label: '草地', pct: 16.57, color: '#4ADE80' },
    { label: '其他', pct: 18.39, color: '#CBD5E1' },
    { label: '建设用地', pct: 10.89, color: '#F59E0B' },
  ],

  // 各农场土地类型
  farmLandTypes: [
    { farm: '白城牧场', 耕地: 85, 草地: 8, 其他: 5, 建设用地: 2 },
    { farm: '镇南种羊场', 耕地: 78, 草地: 12, 其他: 7, 建设用地: 3 },
    { farm: '长岭种马场', 耕地: 82, 草地: 10, 其他: 6, 建设用地: 2 },
  ],

  // 各农场确权对比
  farmRights: [
    { farm: '白城牧场', 已发证: 15, 已登记未发证: 12, 已确权未登记: 10, 未确权: 58 },
    { farm: '镇南种羊场', 已发证: 18, 已登记未发证: 14, 已确权未登记: 8, 未确权: 55 },
    { farm: '长岭种马场', 已发证: 10, 已登记未发证: 17, 已确权未登记: 12, 未确权: 56 },
  ],

  // 各行政区确权占比
  regionRights: [
    { region: '吉林省', pct: 88.5 },
    { region: '吉林市', pct: 72.3 },
    { region: '辽源市', pct: 65.8 },
    { region: '白山市', pct: 58.2 },
    { region: '白城市', pct: 51.6 },
    { region: '松原市', pct: 44.1 },
    { region: '延边州', pct: 39.7 },
    { region: '四平市', pct: 35.2 },
    { region: '通化市', pct: 28.8 },
  ],
};

/** 土地资源公司专属分析数据 */
export const mockLandCompanyAnalysis = {
  // 高标准农田各农场面积（亩）
  highStandardByFarm: [
    { farm: '白城牧场', area: 5684, plots: 2, color: '#0D665E' },
    { farm: '镇南种羊场', area: 3201, plots: 1, color: '#2D9F7A' },
    { farm: '长岭种马场', area: 4641, plots: 2, color: '#4B7B73' },
  ],
  // 盐碱地等级分布
  salineByLevel: [
    { level: '轻度', area: 2563, plots: 1, color: '#E8A838' },
    { level: '中度', area: 7301, plots: 2, color: '#D97706' },
    { level: '重度', area: 4111, plots: 2, color: '#DC2626' },
  ],
  // 盐碱地类型分布
  salineByType: [
    { type: '苏打盐碱地', area: 7394, plots: 3, color: '#E8A838' },
    { type: '氯化物盐碱地', area: 6581, plots: 2, color: '#7C3AED' },
  ],
  // 汇总
  totalHighStandard: 13526,   // 亩
  totalSaline: 13975,         // 亩
};

export const mockDevices: Device[] = [
  // ═══ 白城牧场 (3台) ═══
  {
    id: 'dev1', name: '土壤传感器03', type: 'SOIL_SENSOR', status: 'ONLINE',
    location: { lat: 45.544, lng: 122.765 },
    lastData: { humidity: 0.68, temp: 17 },
    deviceInfo: { type: '土壤传感器', name: '土壤传感器03', farm: '白城牧场', adminRegion: '吉林省-白城市-洮北区-平台镇', manufacturer: '生产厂家名称', model: 'XT-706', remoteControlSupported: false },
    alarms: [
      { id: 'al1', content: '湿度告警: 土壤湿度过低', time: '2026-10-5', level: 'MEDIUM' },
      { id: 'al2', content: '温度异常', time: '2026-10-2', level: 'LOW' },
    ]
  },
  {
    id: 'dev4', name: '土壤传感器07', type: 'SOIL_SENSOR', status: 'ONLINE',
    location: { lat: 45.540, lng: 122.750 },
    lastData: { humidity: 0.72, temp: 18 },
    deviceInfo: { type: '土壤传感器', name: '土壤传感器07', farm: '白城牧场', adminRegion: '吉林省-白城市-洮北区', manufacturer: '农发科技', model: 'XT-708', remoteControlSupported: false },
    alarms: []
  },
  {
    id: 'dev5', name: '智能水阀 B-12', type: 'SMART_VALVE', status: 'OFFLINE',
    location: { lat: 45.547, lng: 122.758 },
    lastData: {},
    deviceInfo: { type: '智能水阀', name: '智能水阀 B-12', farm: '白城牧场', adminRegion: '吉林省-白城市-洮北区', manufacturer: '灌溉科技', model: 'IV-300', remoteControlSupported: true },
    alarms: [{ id: 'al5', content: '通讯模块离线超过72小时', time: '2026-10-10', level: 'HIGH' }]
  },

  // ═══ 镇南种羊场 (3台) ═══
  {
    id: 'dev2', name: '自动气象站 P-01', type: 'WEATHER_STATION', status: 'ONLINE',
    location: { lat: 45.532, lng: 122.795 },
    lastData: { temp: 24, humidity: '45%', wind: '12 m/s', rain: '2 mm' },
    deviceInfo: { type: '自动气象站', name: '自动气象站 P-01', farm: '镇南种羊场', adminRegion: '吉林省-白城市-洮北区', manufacturer: '精工仪表', model: 'AWS-200', remoteControlSupported: true },
    alarms: []
  },
  {
    id: 'dev6', name: '土壤墒情站 S-07', type: 'SOIL_SENSOR', status: 'ONLINE',
    location: { lat: 45.530, lng: 122.785 },
    lastData: { humidity: 0.55, temp: 20 },
    deviceInfo: { type: '土壤墒情站', name: '土壤墒情站 S-07', farm: '镇南种羊场', adminRegion: '吉林省-白城市-洮北区', manufacturer: '农发科技', model: 'SM-100', remoteControlSupported: false },
    alarms: [{ id: 'al6', content: '传感器电量低于10%', time: '2026-10-09', level: 'MEDIUM' }]
  },
  {
    id: 'dev7', name: '智能控制终端 Z-3', type: 'CONTROLLER', status: 'FAULT',
    location: { lat: 45.528, lng: 122.790 },
    lastData: { voltage: '11V', current: '1.5A' },
    deviceInfo: { type: '智能控制终端', name: '智能控制终端 Z-3', farm: '镇南种羊场', adminRegion: '吉林省-白城市', manufacturer: '智控科技', model: 'CTL-X2', remoteControlSupported: true },
    alarms: [{ id: 'al7', content: '电压异常低于阈值', time: '2026-10-07', level: 'HIGH' }]
  },

  // ═══ 长岭种马场 (3台) ═══
  {
    id: 'dev3', name: '土壤传感器11', type: 'SOIL_SENSOR', status: 'ONLINE',
    location: { lat: 45.522, lng: 122.760 },
    lastData: { humidity: 0.61, temp: 19 },
    deviceInfo: { type: '土壤传感器', name: '土壤传感器11', farm: '长岭种马场', adminRegion: '吉林省-松原市-长岭县', manufacturer: '精工仪表', model: 'XT-710', remoteControlSupported: false },
    alarms: []
  },
  {
    id: 'dev8', name: '自动气象站 P-04', type: 'WEATHER_STATION', status: 'ONLINE',
    location: { lat: 45.518, lng: 122.748 },
    lastData: { temp: 27, humidity: '40%', wind: '8 m/s', rain: '0 mm' },
    deviceInfo: { type: '自动气象站', name: '自动气象站 P-04', farm: '长岭种马场', adminRegion: '吉林省-松原市-长岭县', manufacturer: '精工仪表', model: 'AWS-200', remoteControlSupported: true },
    alarms: []
  },
  {
    id: 'dev9', name: '土壤传感器15', type: 'SOIL_SENSOR', status: 'OFFLINE',
    location: { lat: 45.525, lng: 122.755 },
    lastData: {},
    deviceInfo: { type: '土壤传感器', name: '土壤传感器15', farm: '长岭种马场', adminRegion: '吉林省-松原市-长岭县', manufacturer: '农发科技', model: 'XT-705', remoteControlSupported: false },
    alarms: [{ id: 'al8', content: '设备离线超过24小时', time: '2026-10-11', level: 'HIGH' }]
  },

  // ═══ 白城牧场 — 新增类型 ═══
  {
    id: 'dev10', name: '田间摄像头 C-01', type: 'CAMERA', status: 'ONLINE',
    location: { lat: 45.545, lng: 122.772 },
    lastData: { snapshot: '2026-10-11 08:30', resolution: '1080p' },
    deviceInfo: { type: '摄像头', name: '田间摄像头 C-01', farm: '白城牧场', adminRegion: '吉林省-白城市-洮北区', manufacturer: '海康威视', model: 'DS-2CD', remoteControlSupported: true },
    alarms: []
  },
  {
    id: 'dev11', name: '孢子捕捉仪 S-01', type: 'SPORE_TRAP', status: 'ONLINE',
    location: { lat: 45.542, lng: 122.762 },
    lastData: { sporeCount: 128, risk: '低' },
    deviceInfo: { type: '孢子捕捉仪', name: '孢子捕捉仪 S-01', farm: '白城牧场', adminRegion: '吉林省-白城市-洮北区', manufacturer: '云飞科技', model: 'YF-SC01', remoteControlSupported: false },
    alarms: []
  },

  // ═══ 镇南种羊场 — 新增类型 ═══
  {
    id: 'dev12', name: '虫情测报灯 P-02', type: 'PEST_MONITOR', status: 'ONLINE',
    location: { lat: 45.535, lng: 122.798 },
    lastData: { pestCount: 45, species: '粘虫' },
    deviceInfo: { type: '虫情测报设备', name: '虫情测报灯 P-02', farm: '镇南种羊场', adminRegion: '吉林省-白城市-洮北区', manufacturer: '云飞科技', model: 'YF-CB01', remoteControlSupported: false },
    alarms: [{ id: 'al9', content: '虫量超阈值', time: '2026-10-08', level: 'MEDIUM' }]
  },
  {
    id: 'dev13', name: '水肥一体机 F-01', type: 'FERTIGATION', status: 'ONLINE',
    location: { lat: 45.533, lng: 122.788 },
    lastData: { flow: '2.5L/s', pressure: '0.3MPa', ec: '1.8mS/cm' },
    deviceInfo: { type: '水肥一体机', name: '水肥一体机 F-01', farm: '镇南种羊场', adminRegion: '吉林省-白城市-洮北区', manufacturer: '大禹节水', model: 'DY-F01', remoteControlSupported: true },
    alarms: []
  },

  // ═══ 长岭种马场 — 新增类型 ═══
  {
    id: 'dev14', name: '田间摄像头 C-03', type: 'CAMERA', status: 'ONLINE',
    location: { lat: 45.520, lng: 122.762 },
    lastData: { snapshot: '2026-10-11 09:00', resolution: '1080p' },
    deviceInfo: { type: '摄像头', name: '田间摄像头 C-03', farm: '长岭种马场', adminRegion: '吉林省-松原市-长岭县', manufacturer: '海康威视', model: 'DS-2CD', remoteControlSupported: true },
    alarms: []
  },
  {
    id: 'dev15', name: '土壤墒情站 M-02', type: 'SOIL_MOISTURE', status: 'ONLINE',
    location: { lat: 45.524, lng: 122.750 },
    lastData: { depth10: 28, depth20: 32, depth40: 38 },
    deviceInfo: { type: '土壤墒情站', name: '土壤墒情站 M-02', farm: '长岭种马场', adminRegion: '吉林省-松原市-长岭县', manufacturer: '农发科技', model: 'SM-200', remoteControlSupported: false },
    alarms: []
  },

  // ═══ 洮南农场 ═══
  { id: 'dev19', name: '土壤传感器 T-01', type: 'SOIL_SENSOR', status: 'ONLINE',
    location: { lat: 45.553, lng: 122.812 },
    lastData: { humidity: 0.58, temp: 19 },
    deviceInfo: { type: '土壤传感器', name: '土壤传感器 T-01', farm: '洮南农场', adminRegion: '吉林省-白城市-洮南市', manufacturer: '农发科技', model: 'XT-710', remoteControlSupported: false },
    alarms: []
  },
  { id: 'dev20', name: '自动气象站 T-01', type: 'WEATHER_STATION', status: 'ONLINE',
    location: { lat: 45.550, lng: 122.808 },
    lastData: { temp: 25, humidity: '42%', wind: '10 m/s', rain: '1 mm' },
    deviceInfo: { type: '自动气象站', name: '自动气象站 T-01', farm: '洮南农场', adminRegion: '吉林省-白城市-洮南市', manufacturer: '精工仪表', model: 'AWS-200', remoteControlSupported: true },
    alarms: []
  },

  // ═══ 大安农场 ═══
  { id: 'dev21', name: '土壤墒情站 D-01', type: 'SOIL_MOISTURE', status: 'ONLINE',
    location: { lat: 45.546, lng: 122.722 },
    lastData: { depth10: 32, depth20: 36, depth40: 42 },
    deviceInfo: { type: '土壤墒情站', name: '土壤墒情站 D-01', farm: '大安农场', adminRegion: '吉林省-白城市-大安市', manufacturer: '农发科技', model: 'SM-200', remoteControlSupported: false },
    alarms: [{ id: 'al10', content: '墒情偏低预警', time: '2026-10-12', level: 'MEDIUM' }]
  },
  { id: 'dev22', name: '水肥一体机 D-01', type: 'FERTIGATION', status: 'ONLINE',
    location: { lat: 45.549, lng: 122.718 },
    lastData: { flow: '2.1L/s', pressure: '0.28MPa', ec: '1.6mS/cm' },
    deviceInfo: { type: '水肥一体机', name: '水肥一体机 D-01', farm: '大安农场', adminRegion: '吉林省-白城市-大安市', manufacturer: '大禹节水', model: 'DY-F02', remoteControlSupported: true },
    alarms: []
  },

  // ═══ 通榆农场 ═══
  { id: 'dev23', name: '虫情测报灯 TY-01', type: 'PEST_MONITOR', status: 'ONLINE',
    location: { lat: 45.513, lng: 122.796 },
    lastData: { pestCount: 32, species: '草地螟' },
    deviceInfo: { type: '虫情测报设备', name: '虫情测报灯 TY-01', farm: '通榆农场', adminRegion: '吉林省-白城市-通榆县', manufacturer: '云飞科技', model: 'YF-CB01', remoteControlSupported: false },
    alarms: []
  },
  { id: 'dev24', name: '土壤传感器 TY-01', type: 'SOIL_SENSOR', status: 'FAULT',
    location: { lat: 45.510, lng: 122.801 },
    lastData: { humidity: 0.32, temp: 21 },
    deviceInfo: { type: '土壤传感器', name: '土壤传感器 TY-01', farm: '通榆农场', adminRegion: '吉林省-白城市-通榆县', manufacturer: '精工仪表', model: 'XT-708', remoteControlSupported: false },
    alarms: [{ id: 'al11', content: '传感器数据异常', time: '2026-10-13', level: 'HIGH' }]
  },

  // ═══ 农场摄像头（用于实时画面+方向控制） ═══
  {
    id: 'dev16', name: '牧场主摄像头', type: 'CAMERA', status: 'ONLINE',
    location: { lat: 45.544, lng: 122.768 },
    lastData: { resolution: '1080p', fps: 25 },
    deviceInfo: { type: '摄像头', name: '牧场主摄像头', farm: '白城牧场', adminRegion: '吉林省-白城市-洮北区', manufacturer: '海康威视', model: 'PTZ-800', remoteControlSupported: true },
    alarms: []
  },
  {
    id: 'dev17', name: '种羊场全景摄像头', type: 'CAMERA', status: 'ONLINE',
    location: { lat: 45.531, lng: 122.792 },
    lastData: { resolution: '1080p', fps: 25 },
    deviceInfo: { type: '摄像头', name: '种羊场全景摄像头', farm: '镇南种羊场', adminRegion: '吉林省-白城市-洮北区', manufacturer: '海康威视', model: 'PTZ-800', remoteControlSupported: true },
    alarms: []
  },
  {
    id: 'dev18', name: '马场监控摄像头', type: 'CAMERA', status: 'ONLINE',
    location: { lat: 45.521, lng: 122.752 },
    lastData: { resolution: '1080p', fps: 25 },
    deviceInfo: { type: '摄像头', name: '马场监控摄像头', farm: '长岭种马场', adminRegion: '吉林省-松原市-长岭县', manufacturer: '海康威视', model: 'PTZ-800', remoteControlSupported: true },
    alarms: []
  },
];

export const mockMapPlots: MapPlot[] = [
  // ═══════════ 宗地 (8块) ═══════════
  {
    id: 'p1', name: '二队3号地', type: 'ZONGDI', area: 12425.09,
    code: 'ZD-JL-ZN-2020-013-0067', version: '三调数据',
    farm: '镇南种羊场', region: '吉林省-白城市-洮北区-平台镇',
    category: '农用地', usageType: '耕地 - 水田 - 013',
    attribution: '农垦集团', status: 'STABLE', titleStatus: '已发证',
    certLocation: '吉林省白城市洮北区平台镇东五村',
    certType: '不动产权证书', certAuthority: '吉林省不动产登记局',
    certDate: '2023-01-09', certHolder: '吉林农发集团有限公司',
    ownershipType: '单独所有', unitNo: '220802 013006 GB00067',
    rightType: '国家所有', useRightType: '划拨',
    landClass: '水田', useArea: 11598.65,
    startDate: '2023-01-09', endDate: '2043-01-08',
    location: { lat: 43.805, lng: 125.305 },
    owner: '农垦集团', contact: '138****0001', org: '第一农场',
  },
  {
    id: 'p2', name: '镇南-东风3号地', type: 'ZONGDI', area: 13580.42,
    code: 'ZD-JL-ZN-2021-015-0089', version: '三调数据',
    farm: '镇南种羊场', region: '吉林省-白城市-洮北区-东风镇',
    category: '农用地', usageType: '耕地 - 旱地 - 011',
    attribution: '农垦集团', status: 'STABLE', titleStatus: '已发证',
    certLocation: '吉林省白城市洮北区东风镇兴隆村',
    certType: '不动产权证书', certAuthority: '吉林省不动产登记局',
    certDate: '2022-06-15', certHolder: '吉林农发集团有限公司',
    ownershipType: '单独所有', unitNo: '220802 015011 GB00089',
    rightType: '国家所有', useRightType: '划拨',
    landClass: '旱地', useArea: 12860.33,
    startDate: '2022-06-15', endDate: '2042-06-14',
    location: { lat: 43.795, lng: 125.315 },
    owner: '农垦集团', contact: '139****0002', org: '第一农场',
  },
  {
    id: 'p7', name: '白城河西一号地', type: 'ZONGDI', area: 9876.50,
    code: 'ZD-JL-BC-2019-006-0021', version: '三调数据',
    farm: '白城牧场', region: '吉林省-白城市-洮北区-青山镇',
    category: '农用地', usageType: '耕地 - 水田 - 013',
    attribution: '农垦集团', status: 'STABLE', titleStatus: '已发证',
    certLocation: '吉林省白城市洮北区青山镇靠山村',
    certType: '不动产权证书', certAuthority: '吉林省不动产登记局',
    certDate: '2021-10-20', certHolder: '吉林农发集团有限公司',
    ownershipType: '单独所有', unitNo: '220802 006013 GB00021',
    rightType: '国家所有', useRightType: '划拨',
    landClass: '水田', useArea: 9420.18,
    startDate: '2021-10-20', endDate: '2041-10-19',
    location: { lat: 43.810, lng: 125.280 },
    owner: '农垦集团', contact: '138****0010', org: '第二农场',
  },
  {
    id: 'p8', name: '白城-南岗4号地', type: 'ZONGDI', area: 15320.78,
    code: 'ZD-JL-BC-2018-009-0045', version: '三调数据',
    farm: '白城牧场', region: '吉林省-白城市-洮北区-德顺镇',
    category: '农用地', usageType: '耕地 - 旱地 - 011',
    attribution: '农垦集团', status: 'STABLE', titleStatus: '已发证',
    certLocation: '吉林省白城市洮北区德顺镇明山村',
    certType: '不动产权证书', certAuthority: '吉林省不动产登记局',
    certDate: '2020-05-08', certHolder: '吉林农发集团有限公司',
    ownershipType: '共有', unitNo: '220802 009011 GB00045',
    rightType: '集体所有', useRightType: '承包',
    landClass: '旱地', useArea: 14890.62,
    startDate: '2020-05-08', endDate: '2050-05-07',
    location: { lat: 43.788, lng: 125.260 },
    owner: '集体', contact: '137****0011', org: '第二农场',
  },
  {
    id: 'p9', name: '长岭-东大甸子', type: 'ZONGDI', area: 11240.33,
    code: 'ZD-JL-CL-2022-003-0012', version: '三调数据',
    farm: '长岭种马场', region: '吉林省-松原市-长岭县-太平川镇',
    category: '农用地', usageType: '耕地 - 水田 - 013',
    attribution: '农垦集团', status: 'STABLE', titleStatus: '已发证',
    certLocation: '吉林省松原市长岭县太平川镇新民村',
    certType: '不动产权证书', certAuthority: '吉林省不动产登记局',
    certDate: '2023-03-22', certHolder: '吉林农发集团有限公司',
    ownershipType: '单独所有', unitNo: '220722 003013 GB00012',
    rightType: '国家所有', useRightType: '划拨',
    landClass: '水田', useArea: 10890.55,
    startDate: '2023-03-22', endDate: '2043-03-21',
    location: { lat: 43.820, lng: 125.340 },
    owner: '农垦集团', contact: '136****0012', org: '第三农场',
  },
  {
    id: 'p10', name: '长岭-北甸子2号', type: 'ZONGDI', area: 7620.15,
    code: 'ZD-JL-CL-2020-005-0056', version: '三调数据',
    farm: '长岭种马场', region: '吉林省-松原市-长岭县-太平山镇',
    category: '农用地', usageType: '耕地 - 旱地 - 011',
    attribution: '农垦集团', status: 'FIXING', titleStatus: '办理中',
    certLocation: '吉林省松原市长岭县太平山镇吴大屯村',
    certType: '不动产权证书', certAuthority: '吉林省不动产登记局',
    certDate: '', certHolder: '吉林农发集团有限公司',
    ownershipType: '单独所有', unitNo: '220722 005011 GB00056',
    rightType: '国家所有', useRightType: '划拨',
    landClass: '旱地', useArea: 7450.80,
    startDate: '', endDate: '',
    location: { lat: 43.830, lng: 125.350 },
    owner: '农垦集团', contact: '135****0013', org: '第三农场',
  },
  {
    id: 'p11', name: '镇南-苇塘西地', type: 'ZONGDI', area: 18350.60,
    code: 'ZD-JL-ZN-2019-011-0102', version: '三调数据',
    farm: '镇南种羊场', region: '吉林省-白城市-洮北区-平台镇',
    category: '农用地', usageType: '耕地 - 水田 - 013',
    attribution: '农垦集团', status: 'STABLE', titleStatus: '已发证',
    certLocation: '吉林省白城市洮北区平台镇光明村',
    certType: '不动产权证书', certAuthority: '吉林省不动产登记局',
    certDate: '2019-11-30', certHolder: '吉林农发集团有限公司',
    ownershipType: '单独所有', unitNo: '220802 011013 GB00102',
    rightType: '国家所有', useRightType: '划拨',
    landClass: '水田', useArea: 17920.44,
    startDate: '2019-11-30', endDate: '2049-11-29',
    location: { lat: 43.800, lng: 125.290 },
    owner: '农垦集团', contact: '139****0014', org: '第一农场',
  },
  {
    id: 'p12', name: '白城-新立屯地', type: 'ZONGDI', area: 6450.28,
    code: 'ZD-JL-BC-2021-008-0033', version: '三调数据',
    farm: '白城牧场', region: '吉林省-白城市-洮北区-林海镇',
    category: '农用地', usageType: '耕地 - 旱地 - 011',
    attribution: '农垦集团', status: 'STABLE', titleStatus: '已发证',
    certLocation: '吉林省白城市洮北区林海镇新立村',
    certType: '不动产权证书', certAuthority: '吉林省不动产登记局',
    certDate: '2022-08-14', certHolder: '吉林农发集团有限公司',
    ownershipType: '共有', unitNo: '220802 008011 GB00033',
    rightType: '集体所有', useRightType: '承包',
    landClass: '旱地', useArea: 6280.75,
    startDate: '2022-08-14', endDate: '2052-08-13',
    location: { lat: 43.780, lng: 125.250 },
    owner: '集体', contact: '138****0015', org: '第二农场',
  },

  // ═══════════ 高标准农田 (3块) ═══════════
  {
    id: 'p5', name: '渠东高标农田三区', type: 'HIGH_STANDARD', area: 2563.36,
    code: 'GB-JL-BC-2024-011-0004', belongingZongdi: 'ZD-JL-ZN-2020-013-0067',
    farm: '白城牧场', renovationStatus: '已完成',
    planYear: '2023', buildYear: '2024',
    usageType: '耕地-水田', region: '吉林省-白城市-洮北区-平台镇',
    infoStatus: '已验收', status: 'STABLE',
    location: { lat: 43.825, lng: 125.275 },
    owner: '农垦集团', contact: '135****0005', org: '第一农场',
  },
  {
    id: 'p14', name: '东风高标准示范方', type: 'HIGH_STANDARD', area: 3200.80,
    code: 'GB-JL-BC-2023-015-0012', belongingZongdi: 'ZD-JL-ZN-2021-015-0089',
    farm: '镇南种羊场', renovationStatus: '已完成',
    planYear: '2022', buildYear: '2023',
    usageType: '耕地-旱地', region: '吉林省-白城市-洮北区-东风镇',
    infoStatus: '已验收', status: 'STABLE',
    location: { lat: 43.792, lng: 125.320 },
    owner: '农垦集团', contact: '137****0020', org: '第一农场',
  },
  {
    id: 'p15', name: '太平川高标准田块', type: 'HIGH_STANDARD', area: 1890.45,
    code: 'GB-JL-CL-2024-003-0008', belongingZongdi: 'ZD-JL-CL-2022-003-0012',
    farm: '长岭种马场', renovationStatus: '施工中',
    planYear: '2024', buildYear: '2025',
    usageType: '耕地-水田', region: '吉林省-松原市-长岭县-太平川镇',
    infoStatus: '已备案', status: 'FIXING',
    location: { lat: 43.818, lng: 125.342 },
    owner: '农垦集团', contact: '136****0021', org: '第三农场',
  },

  // ═══════════ 盐碱地 (3块) ═══════════
  {
    id: 'p3', name: '南村盐碱地改良二区', type: 'SALINE_ALKALI', area: 2563.36,
    code: 'YJ-JL-BC-2022-011-0004', belongingZongdi: 'ZD-JL-BC-2018-009-0045',
    salineLevel: '轻度盐碱地', salineType: '苏打盐碱地',
    usageType: '耕地-水田', farm: '白城牧场',
    region: '吉林省-白城市-洮北区-德顺镇',
    infoStatus: '已验收', status: 'STABLE',
    location: { lat: 43.785, lng: 125.295 },
    owner: '农垦集团', contact: '137****0003', org: '技术中心',
  },
  {
    id: 'p16', name: '大岗子盐碱地试验区', type: 'SALINE_ALKALI', area: 4320.60,
    code: 'YJ-JL-BC-2023-009-0015', belongingZongdi: 'ZD-JL-BC-2018-009-0045',
    salineLevel: '中度盐碱地', salineType: '氯化物盐碱地',
    usageType: '耕地-旱地', farm: '白城牧场',
    region: '吉林省-白城市-洮北区-德顺镇',
    infoStatus: '改良中', status: 'FIXING',
    location: { lat: 43.782, lng: 125.288 },
    owner: '农垦集团', contact: '138****0022', org: '技术中心',
  },
  {
    id: 'p17', name: '镇南盐碱地治理一号', type: 'SALINE_ALKALI', area: 1850.35,
    code: 'YJ-JL-BC-2021-011-0022', belongingZongdi: 'ZD-JL-ZN-2020-013-0067',
    salineLevel: '重度盐碱地', salineType: '苏打盐碱地',
    usageType: '未利用地', farm: '镇南种羊场',
    region: '吉林省-白城市-洮北区-平台镇',
    infoStatus: '已备案', status: 'IDLE',
    location: { lat: 43.808, lng: 125.298 },
    owner: '农垦集团', contact: '139****0023', org: '技术中心',
  },

  // ═══════════ 承包（种植分布）(3块) ═══════════
  {
    id: 'p4', name: '镇南-招商租赁L1区', type: 'LEASING', leaseType: '承租', area: 1236.61, crop: '小麦',
    version: '2026年种植季', code: 'ZL-JL-ZN-2026-013-0101',
    belongingZongdi: 'ZD-JL-ZN-2020-013-0067', farm: '镇南种羊场',
    usageType: '耕地-水田', inputArea: 1236.61, drawArea: 1230.45,
    preCrop: '玉米', preCropVariety: '先育335', preCropNature: '新种',
    contractorName: '松原市丰达农业合作社', contractorIdentity: '企业法人',
    retirementDate: '2030-12-31', contractStartDate: '2026-03-15', contractEndDate: '2027-03-14', contractAmount: 4500,
    status: 'STABLE', location: { lat: 43.815, lng: 125.285 },
    owner: '合作社', contact: '136****0004', org: '经营部',
  },
  {
    id: 'p6', name: '长岭统种示范区M1', type: 'LEASING', leaseType: '统种', area: 1500.00, crop: '玉米',
    version: '2026年种植季', code: 'ZL-JL-CL-2026-005-0201',
    belongingZongdi: 'ZD-JL-CL-2022-003-0012', farm: '长岭种马场',
    usageType: '耕地-水田', inputArea: 1500.00, drawArea: 1492.35,
    preCrop: '大豆', preCropVariety: '中黄13', preCropNature: '新种',
    contractorName: '长岭县惠民农机专业合作社', contractorIdentity: '企业法人',
    retirementDate: '2029-06-30', contractStartDate: '2026-04-01', contractEndDate: '2027-03-31', contractAmount: 3800,
    status: 'STABLE', location: { lat: 43.835, lng: 125.265 },
    owner: '合作社', contact: '134****0006', org: '第二农场',
  },
  {
    id: 'p18', name: '白城-光明村承包地', type: 'LEASING', leaseType: '承租', area: 820.30, crop: '大豆',
    version: '2026年种植季', code: 'ZL-JL-BC-2026-008-0301',
    belongingZongdi: 'ZD-JL-BC-2019-006-0021', farm: '白城牧场',
    usageType: '耕地-旱地', inputArea: 820.30, drawArea: 815.60,
    preCrop: '高粱', preCropVariety: '吉杂127', preCropNature: '重茬',
    contractorName: '王建国', contractorIdentity: '个人',
    retirementDate: '2028-03-15', contractStartDate: '2026-03-20', contractEndDate: '2027-03-19', contractAmount: 2800,
    status: 'STABLE', location: { lat: 43.812, lng: 125.272 },
    owner: '个人', contact: '135****0024', org: '经营部',
  },

  // ═══════════ 承包 — 统种 (6块) ═══════════
  {
    id: 'p19', name: '镇南统种玉米A区', type: 'LEASING', leaseType: '统种', area: 2100.50, crop: '玉米',
    version: '2026年种植季', code: 'ZL-JL-ZN-2026-014-0202',
    belongingZongdi: 'ZD-JL-ZN-2020-013-0067', farm: '镇南种羊场',
    usageType: '耕地-水田', inputArea: 2100.50, drawArea: 2085.30,
    preCrop: '玉米', preCropVariety: '郑单958', preCropNature: '重茬',
    contractorName: '镇南统种合作社', contractorIdentity: '企业法人',
    retirementDate: '2032-12-31', contractStartDate: '2026-04-10', contractEndDate: '2027-04-09', contractAmount: 5200,
    status: 'STABLE', location: { lat: 43.808, lng: 125.312 },
    owner: '合作社', contact: '138****0030', org: '经营部',
  },
  {
    id: 'p20', name: '白城-统种大豆一号', type: 'LEASING', leaseType: '统种', area: 1650.80, crop: '大豆',
    version: '2026年种植季', code: 'ZL-JL-BC-2026-009-0203',
    belongingZongdi: 'ZD-JL-BC-2019-006-0021', farm: '白城牧场',
    usageType: '耕地-旱地', inputArea: 1650.80, drawArea: 1630.20,
    preCrop: '大豆', preCropVariety: '黑河43', preCropNature: '重茬',
    contractorName: '白城农垦统种联社', contractorIdentity: '企业法人',
    retirementDate: '2031-06-30', contractStartDate: '2026-03-25', contractEndDate: '2027-03-24', contractAmount: 4200,
    status: 'STABLE', location: { lat: 43.805, lng: 125.265 },
    owner: '合作社', contact: '139****0031', org: '经营部',
  },
  {
    id: 'p21', name: '长岭-统种小麦示范区', type: 'LEASING', leaseType: '统种', area: 1880.30, crop: '小麦',
    version: '2026年种植季', code: 'ZL-JL-CL-2026-006-0204',
    belongingZongdi: 'ZD-JL-CL-2022-003-0012', farm: '长岭种马场',
    usageType: '耕地-水田', inputArea: 1880.30, drawArea: 1865.10,
    preCrop: '小麦', preCropVariety: '蒙麦20', preCropNature: '新种',
    contractorName: '长岭县统种农业有限公司', contractorIdentity: '企业法人',
    retirementDate: '2030-09-30', contractStartDate: '2026-04-05', contractEndDate: '2027-04-04', contractAmount: 4600,
    status: 'STABLE', location: { lat: 43.828, lng: 125.345 },
    owner: '公司', contact: '136****0032', org: '第二农场',
  },
  {
    id: 'p22', name: '镇南统种玉米B区', type: 'LEASING', leaseType: '统种', area: 1320.60, crop: '玉米',
    version: '2026年种植季', code: 'ZL-JL-ZN-2026-015-0205',
    belongingZongdi: 'ZD-JL-ZN-2021-015-0089', farm: '镇南种羊场',
    usageType: '耕地-旱地', inputArea: 1320.60, drawArea: 1305.40,
    preCrop: '玉米', preCropVariety: '先育335', preCropNature: '新种',
    contractorName: '镇南统种合作社', contractorIdentity: '企业法人',
    retirementDate: '2031-03-31', contractStartDate: '2026-03-18', contractEndDate: '2027-03-17', contractAmount: 3500,
    status: 'STABLE', location: { lat: 43.792, lng: 125.308 },
    owner: '合作社', contact: '138****0033', org: '经营部',
  },
  {
    id: 'p23', name: '白城统种小麦基地', type: 'LEASING', leaseType: '统种', area: 2450.00, crop: '小麦',
    version: '2026年种植季', code: 'ZL-JL-BC-2026-010-0206',
    belongingZongdi: 'ZD-JL-BC-2021-008-0033', farm: '白城牧场',
    usageType: '耕地-旱地', inputArea: 2450.00, drawArea: 2425.80,
    preCrop: '小麦', preCropVariety: '京麦31', preCropNature: '新种',
    contractorName: '白城统种农业发展公司', contractorIdentity: '企业法人',
    retirementDate: '2033-12-31', contractStartDate: '2026-04-15', contractEndDate: '2027-04-14', contractAmount: 5800,
    status: 'STABLE', location: { lat: 43.775, lng: 125.245 },
    owner: '公司', contact: '137****0034', org: '经营部',
  },
  {
    id: 'p24', name: '长岭统种大豆东区', type: 'LEASING', leaseType: '统种', area: 1100.25, crop: '大豆',
    version: '2026年种植季', code: 'ZL-JL-CL-2026-007-0207',
    belongingZongdi: 'ZD-JL-CL-2020-005-0056', farm: '长岭种马场',
    usageType: '耕地-旱地', inputArea: 1100.25, drawArea: 1085.60,
    preCrop: '大豆', preCropVariety: '中黄13', preCropNature: '重茬',
    contractorName: '长岭县惠民农机专业合作社', contractorIdentity: '企业法人',
    retirementDate: '2029-12-31', contractStartDate: '2026-04-20', contractEndDate: '2027-04-19', contractAmount: 3100,
    status: 'STABLE', location: { lat: 43.825, lng: 125.358 },
    owner: '合作社', contact: '134****0035', org: '第二农场',
  },

  // ═══════════ 承包 — 承租 (6块) ═══════════
  {
    id: 'p25', name: '白城-李庄承租玉米地', type: 'LEASING', leaseType: '承租', area: 950.40, crop: '玉米',
    version: '2026年种植季', code: 'ZL-JL-BC-2026-011-0302',
    belongingZongdi: 'ZD-JL-BC-2019-006-0021', farm: '白城牧场',
    usageType: '耕地-旱地', inputArea: 950.40, drawArea: 938.20,
    preCrop: '玉米', preCropVariety: '郑单958', preCropNature: '新种',
    contractorName: '李明德', contractorIdentity: '个人',
    retirementDate: '2028-06-30', contractStartDate: '2026-03-10', contractEndDate: '2027-03-09', contractAmount: 3200,
    status: 'STABLE', location: { lat: 43.808, lng: 125.255 },
    owner: '个人', contact: '135****0040', org: '经营部',
  },
  {
    id: 'p26', name: '镇南-承租大豆三队', type: 'LEASING', leaseType: '承租', area: 1780.60, crop: '大豆',
    version: '2026年种植季', code: 'ZL-JL-ZN-2026-016-0303',
    belongingZongdi: 'ZD-JL-ZN-2021-015-0089', farm: '镇南种羊场',
    usageType: '耕地-旱地', inputArea: 1780.60, drawArea: 1760.40,
    preCrop: '大豆', preCropVariety: '黑河43', preCropNature: '新种',
    contractorName: '赵志强', contractorIdentity: '个人',
    retirementDate: '2029-10-31', contractStartDate: '2026-03-28', contractEndDate: '2027-03-27', contractAmount: 5000,
    status: 'STABLE', location: { lat: 43.798, lng: 125.322 },
    owner: '个人', contact: '136****0041', org: '经营部',
  },
  {
    id: 'p27', name: '长岭-承租小麦地块', type: 'LEASING', leaseType: '承租', area: 1250.80, crop: '小麦',
    version: '2026年种植季', code: 'ZL-JL-CL-2026-008-0304',
    belongingZongdi: 'ZD-JL-CL-2022-003-0012', farm: '长岭种马场',
    usageType: '耕地-水田', inputArea: 1250.80, drawArea: 1235.30,
    preCrop: '小麦', preCropVariety: '蒙麦20', preCropNature: '新种',
    contractorName: '松原市金穗农业公司', contractorIdentity: '企业法人',
    retirementDate: '2030-04-30', contractStartDate: '2026-04-12', contractEndDate: '2027-04-11', contractAmount: 4200,
    status: 'STABLE', location: { lat: 43.832, lng: 125.335 },
    owner: '公司', contact: '137****0042', org: '经营部',
  },
  {
    id: 'p28', name: '白城-承租玉米二区', type: 'LEASING', leaseType: '承租', area: 2100.00, crop: '玉米',
    version: '2026年种植季', code: 'ZL-JL-BC-2026-012-0305',
    belongingZongdi: 'ZD-JL-BC-2018-009-0045', farm: '白城牧场',
    usageType: '耕地-旱地', inputArea: 2100.00, drawArea: 2080.50,
    preCrop: '玉米', preCropVariety: '先育335', preCropNature: '重茬',
    contractorName: '张永发', contractorIdentity: '个人',
    retirementDate: '2027-12-31', contractStartDate: '2026-03-22', contractEndDate: '2027-03-21', contractAmount: 6000,
    status: 'STABLE', location: { lat: 43.785, lng: 125.252 },
    owner: '个人', contact: '138****0043', org: '经营部',
  },
  {
    id: 'p29', name: '镇南-承租小麦南地', type: 'LEASING', leaseType: '承租', area: 890.35, crop: '小麦',
    version: '2026年种植季', code: 'ZL-JL-ZN-2026-017-0306',
    belongingZongdi: 'ZD-JL-ZN-2019-011-0102', farm: '镇南种羊场',
    usageType: '耕地-水田', inputArea: 890.35, drawArea: 878.20,
    preCrop: '小麦', preCropVariety: '京麦31', preCropNature: '新种',
    contractorName: '镇赉县丰登合作社', contractorIdentity: '企业法人',
    retirementDate: '2029-08-31', contractStartDate: '2026-04-08', contractEndDate: '2027-04-07', contractAmount: 3000,
    status: 'STABLE', location: { lat: 43.802, lng: 125.295 },
    owner: '合作社', contact: '139****0044', org: '经营部',
  },
  {
    id: 'p30', name: '长岭承租大豆北区', type: 'LEASING', leaseType: '承租', area: 1560.75, crop: '大豆',
    version: '2026年种植季', code: 'ZL-JL-CL-2026-009-0307',
    belongingZongdi: 'ZD-JL-CL-2020-005-0056', farm: '长岭种马场',
    usageType: '耕地-旱地', inputArea: 1560.75, drawArea: 1545.30,
    preCrop: '大豆', preCropVariety: '中黄13', preCropNature: '重茬',
    contractorName: '刘大伟', contractorIdentity: '个人',
    retirementDate: '2028-03-31', contractStartDate: '2026-03-15', contractEndDate: '2027-03-14', contractAmount: 4600,
    status: 'STABLE', location: { lat: 43.822, lng: 125.362 },
    owner: '个人', contact: '135****0045', org: '经营部',
  },

  // ═══════════ 长岭补充 ═══════════
  {
    id: 'p31', name: '长岭-南大甸子', type: 'ZONGDI', area: 14580.60,
    code: 'ZD-JL-CL-2021-004-0078', version: '三调数据',
    farm: '长岭种马场', region: '吉林省-松原市-长岭县-太平川镇',
    category: '农用地', usageType: '耕地 - 旱地 - 011',
    attribution: '农垦集团', status: 'STABLE', titleStatus: '已发证',
    certLocation: '吉林省松原市长岭县太平川镇兴隆村',
    certType: '不动产权证书', certAuthority: '吉林省不动产登记局',
    certDate: '2022-04-18', certHolder: '吉林农发集团有限公司',
    ownershipType: '单独所有', unitNo: '220722 004011 GB00078',
    rightType: '国家所有', useRightType: '划拨',
    landClass: '旱地', useArea: 14020.35,
    startDate: '2022-04-18', endDate: '2042-04-17',
    location: { lat: 43.822, lng: 125.350 },
    owner: '农垦集团', contact: '136****0050', org: '第三农场',
  },
  {
    id: 'p32', name: '长岭太平川高标二区', type: 'HIGH_STANDARD', area: 2750.40,
    code: 'GB-JL-CL-2024-004-0018', belongingZongdi: 'ZD-JL-CL-2021-004-0078',
    farm: '长岭种马场', renovationStatus: '施工中',
    planYear: '2024', buildYear: '2025',
    usageType: '耕地-旱地', region: '吉林省-松原市-长岭县-太平川镇',
    infoStatus: '已备案', status: 'FIXING',
    location: { lat: 43.820, lng: 125.348 },
    owner: '农垦集团', contact: '136****0051', org: '第三农场',
  },
  {
    id: 'p33', name: '长岭盐碱地治理试验区', type: 'SALINE_ALKALI', area: 2980.50,
    code: 'YJ-JL-CL-2023-004-0030', belongingZongdi: 'ZD-JL-CL-2021-004-0078',
    salineLevel: '中度盐碱地', salineType: '苏打盐碱地',
    usageType: '耕地-旱地', farm: '长岭种马场',
    region: '吉林省-松原市-长岭县-太平川镇',
    infoStatus: '改良中', status: 'FIXING',
    location: { lat: 43.818, lng: 125.355 },
    owner: '农垦集团', contact: '137****0052', org: '技术中心',
  },
  {
    id: 'p34', name: '长岭统种玉米南片', type: 'LEASING', leaseType: '统种', area: 1950.20, crop: '玉米',
    version: '2026年种植季', code: 'ZL-JL-CL-2026-010-0401',
    belongingZongdi: 'ZD-JL-CL-2021-004-0078', farm: '长岭种马场',
    usageType: '耕地-旱地', inputArea: 1950.20, drawArea: 1930.50,
    preCrop: '玉米', preCropVariety: '郑单958', preCropNature: '重茬',
    contractorName: '长岭统种农业有限公司', contractorIdentity: '企业法人',
    retirementDate: '2031-06-30', contractStartDate: '2026-04-05', contractEndDate: '2027-04-04', contractAmount: 4800,
    status: 'STABLE', location: { lat: 43.816, lng: 125.360 },
    owner: '公司', contact: '136****0053', org: '第二农场',
  },
  {
    id: 'p35', name: '长岭-王庄子承租地', type: 'LEASING', leaseType: '承租', area: 1080.45, crop: '大豆',
    version: '2026年种植季', code: 'ZL-JL-CL-2026-011-0402',
    belongingZongdi: 'ZD-JL-CL-2021-004-0078', farm: '长岭种马场',
    usageType: '耕地-旱地', inputArea: 1080.45, drawArea: 1065.30,
    preCrop: '大豆', preCropVariety: '黑河43', preCropNature: '新种',
    contractorName: '王守信', contractorIdentity: '个人',
    retirementDate: '2029-12-31', contractStartDate: '2026-03-18', contractEndDate: '2027-03-17', contractAmount: 3500,
    status: 'STABLE', location: { lat: 43.824, lng: 125.365 },
    owner: '个人', contact: '135****0054', org: '经营部',
  },

  // ═══════════ 镇南补充 ═══════════
  {
    id: 'p36', name: '镇南-东岗6号地', type: 'ZONGDI', area: 16200.80,
    code: 'ZD-JL-ZN-2020-012-0115', version: '三调数据',
    farm: '镇南种羊场', region: '吉林省-白城市-洮北区-平台镇',
    category: '农用地', usageType: '耕地 - 水田 - 013',
    attribution: '农垦集团', status: 'STABLE', titleStatus: '已发证',
    certLocation: '吉林省白城市洮北区平台镇东岗村',
    certType: '不动产权证书', certAuthority: '吉林省不动产登记局',
    certDate: '2020-09-22', certHolder: '吉林农发集团有限公司',
    ownershipType: '单独所有', unitNo: '220802 012013 GB00115',
    rightType: '国家所有', useRightType: '划拨',
    landClass: '水田', useArea: 15890.40,
    startDate: '2020-09-22', endDate: '2040-09-21',
    location: { lat: 43.808, lng: 125.318 },
    owner: '农垦集团', contact: '139****0055', org: '第一农场',
  },
  {
    id: 'p37', name: '镇南盐碱地改良三区', type: 'SALINE_ALKALI', area: 2260.35,
    code: 'YJ-JL-BC-2022-012-0035', belongingZongdi: 'ZD-JL-ZN-2020-012-0115',
    salineLevel: '重度盐碱地', salineType: '氯化物盐碱地',
    usageType: '未利用地', farm: '镇南种羊场',
    region: '吉林省-白城市-洮北区-平台镇',
    infoStatus: '已备案', status: 'IDLE',
    location: { lat: 43.806, lng: 125.315 },
    owner: '农垦集团', contact: '138****0056', org: '技术中心',
  },
  {
    id: 'p38', name: '镇南统种大豆西区', type: 'LEASING', leaseType: '统种', area: 1750.60, crop: '大豆',
    version: '2026年种植季', code: 'ZL-JL-ZN-2026-018-0403',
    belongingZongdi: 'ZD-JL-ZN-2020-012-0115', farm: '镇南种羊场',
    usageType: '耕地-水田', inputArea: 1750.60, drawArea: 1732.40,
    preCrop: '大豆', preCropVariety: '中黄13', preCropNature: '新种',
    contractorName: '镇南统种合作社', contractorIdentity: '企业法人',
    retirementDate: '2032-03-31', contractStartDate: '2026-04-12', contractEndDate: '2027-04-11', contractAmount: 4300,
    status: 'STABLE', location: { lat: 43.804, lng: 125.310 },
    owner: '合作社', contact: '138****0057', org: '经营部',
  },
  {
    id: 'p39', name: '镇南-承租玉米东地', type: 'LEASING', leaseType: '承租', area: 1350.80, crop: '玉米',
    version: '2026年种植季', code: 'ZL-JL-ZN-2026-019-0404',
    belongingZongdi: 'ZD-JL-ZN-2020-012-0115', farm: '镇南种羊场',
    usageType: '耕地-水田', inputArea: 1350.80, drawArea: 1335.20,
    preCrop: '玉米', preCropVariety: '先育335', preCropNature: '重茬',
    contractorName: '孙德胜', contractorIdentity: '个人',
    retirementDate: '2028-09-30', contractStartDate: '2026-03-28', contractEndDate: '2027-03-27', contractAmount: 4200,
    status: 'STABLE', location: { lat: 43.810, lng: 125.308 },
    owner: '个人', contact: '137****0058', org: '经营部',
  },

  // ═══════════ 白城补充 ═══════════
  {
    id: 'p40', name: '白城-青山高标准农田', type: 'HIGH_STANDARD', area: 3120.50,
    code: 'GB-JL-BC-2024-012-0022', belongingZongdi: 'ZD-JL-BC-2019-006-0021',
    farm: '白城牧场', renovationStatus: '已完成',
    planYear: '2023', buildYear: '2024',
    usageType: '耕地-水田', region: '吉林省-白城市-洮北区-青山镇',
    infoStatus: '已验收', status: 'STABLE',
    location: { lat: 43.808, lng: 125.278 },
    owner: '农垦集团', contact: '138****0059', org: '第二农场',
  },
  {
    id: 'p41', name: '白城统种大豆二号', type: 'LEASING', leaseType: '统种', area: 1420.35, crop: '大豆',
    version: '2026年种植季', code: 'ZL-JL-BC-2026-013-0405',
    belongingZongdi: 'ZD-JL-BC-2019-006-0021', farm: '白城牧场',
    usageType: '耕地-旱地', inputArea: 1420.35, drawArea: 1405.60,
    preCrop: '大豆', preCropVariety: '黑河43', preCropNature: '新种',
    contractorName: '白城农垦统种联社', contractorIdentity: '企业法人',
    retirementDate: '2030-09-30', contractStartDate: '2026-04-02', contractEndDate: '2027-04-01', contractAmount: 3800,
    status: 'STABLE', location: { lat: 43.805, lng: 125.270 },
    owner: '合作社', contact: '137****0060', org: '经营部',
  },
  {
    id: 'p42', name: '白城-承租小麦新地', type: 'LEASING', leaseType: '承租', area: 1180.60, crop: '小麦',
    version: '2026年种植季', code: 'ZL-JL-BC-2026-014-0406',
    belongingZongdi: 'ZD-JL-BC-2019-006-0021', farm: '白城牧场',
    usageType: '耕地-旱地', inputArea: 1180.60, drawArea: 1165.30,
    preCrop: '小麦', preCropVariety: '蒙麦20', preCropNature: '新种',
    contractorName: '刘长河', contractorIdentity: '个人',
    retirementDate: '2027-06-30', contractStartDate: '2026-03-22', contractEndDate: '2027-03-21', contractAmount: 3600,
    status: 'STABLE', location: { lat: 43.810, lng: 125.262 },
    owner: '个人', contact: '135****0061', org: '经营部',
  },
  { id: 'p43', name: '镇南-东岗宗地7号', type: 'ZONGDI', area: 11230.45, code: 'ZD-JL-ZN-2021-016-0101', version: '三调数据', farm: '镇南种羊场', region: '吉林省-白城市-洮北区-东风镇', category: '农用地', usageType: '耕地-旱地-011', attribution: '农垦集团', status: 'STABLE', titleStatus: '已发证', certLocation: '吉林省白城市洮北区东风镇东岗村', certType: '不动产权证书', certAuthority: '吉林省不动产登记局', certDate: '2023-03-15', certHolder: '吉林农发集团有限公司', ownershipType: '单独所有', unitNo: '220802 016011 GB00101', rightType: '国家所有', useRightType: '划拨', landClass: '旱地', useArea: 10780.22, startDate: '2023-03-15', endDate: '2043-03-14', location: { lat: 43.790, lng: 125.322 }, owner: '农垦集团', contact: '138****0101', org: '第一农场' },
  { id: 'p44', name: '镇南-平台高标三区', type: 'HIGH_STANDARD', area: 2850.50, code: 'GB-JL-ZN-2023-017-0102', farm: '镇南种羊场', region: '吉林省-白城市-洮北区-平台镇', renovationStatus: '已完成', status: 'STABLE', planYear: '2022', buildYear: '2023', belongingZongdi: 'ZD-JL-ZN-2021-016-0101', usageType: '耕地-水田', infoStatus: '正常', location: { lat: 43.798, lng: 125.310 }, owner: '农垦集团', contact: '138****0102', org: '第一农场' },
  { id: 'p45', name: '镇南-平台盐碱改良地', type: 'SALINE_ALKALI', area: 5230.75, code: 'YD-JL-ZN-2023-018-0103', farm: '镇南种羊场', region: '吉林省-白城市-洮北区-平台镇', status: 'STABLE', salineLevel: '中度盐碱地', salineType: '苏打盐碱地', belongingZongdi: 'ZD-JL-ZN-2019-011-0102', usageType: '未利用地', infoStatus: '正常', location: { lat: 43.802, lng: 125.305 }, owner: '农垦集团', contact: '138****0103', org: '第二农场' },
  { id: 'p46', name: '镇南-统种玉米示范区', type: 'LEASING', leaseType: '统种', area: 3450.20, crop: '玉米', version: '2026年种植季', code: 'ZL-JL-ZN-2026-019-0104', belongingZongdi: 'ZD-JL-ZN-2020-012-0115', farm: '镇南种羊场', usageType: '耕地-旱地', inputArea: 3450.20, drawArea: 3400.10, preCrop: '玉米', preCropVariety: '郑单958', preCropNature: '重茬', contractorName: '镇南统种农民合作社', contractorIdentity: '企业法人', retirementDate: '2030-10-15', contractStartDate: '2026-04-05', contractEndDate: '2027-04-04', contractAmount: 9600, status: 'STABLE', location: { lat: 43.795, lng: 125.320 }, owner: '合作社', contact: '139****0104', org: '经营部' },
  { id: 'p47', name: '镇南-承租大豆东地', type: 'LEASING', leaseType: '承租', area: 1560.35, crop: '大豆', version: '2026年种植季', code: 'ZL-JL-ZN-2026-020-0105', belongingZongdi: 'ZD-JL-ZN-2021-015-0089', farm: '镇南种羊场', usageType: '耕地-水田', inputArea: 1560.35, drawArea: 1540.80, preCrop: '大豆', preCropVariety: '中黄13', preCropNature: '新种', contractorName: '镇南农业科技有限公司', contractorIdentity: '企业法人', retirementDate: '2028-05-31', contractStartDate: '2026-04-18', contractEndDate: '2027-04-17', contractAmount: 5200, status: 'STABLE', location: { lat: 43.788, lng: 125.328 }, owner: '公司', contact: '136****0105', org: '经营部' },
  { id: 'p48', name: '长岭-太平川宗地9号', type: 'ZONGDI', area: 9876.30, code: 'ZD-JL-CL-2022-004-0201', version: '三调数据', farm: '长岭种马场', region: '吉林省-松原市-长岭县-太平川镇', category: '农用地', usageType: '耕地-旱地-011', attribution: '农垦集团', status: 'STABLE', titleStatus: '已发证', certLocation: '吉林省松原市长岭县太平川镇太平村', certType: '不动产权证书', certAuthority: '吉林省不动产登记局', certDate: '2022-08-20', certHolder: '吉林农发集团有限公司', ownershipType: '单独所有', unitNo: '220722 004011 GB00201', rightType: '国家所有', useRightType: '划拨', landClass: '旱地', useArea: 9420.15, startDate: '2022-08-20', endDate: '2042-08-19', location: { lat: 43.845, lng: 125.350 }, owner: '农垦集团', contact: '139****0201', org: '第三农场' },
  { id: 'p49', name: '长岭-太平山高标示范区', type: 'HIGH_STANDARD', area: 3200.60, code: 'GB-JL-CL-2024-005-0202', farm: '长岭种马场', region: '吉林省-松原市-长岭县-太平山镇', renovationStatus: '已完成', status: 'STABLE', planYear: '2023', buildYear: '2024', belongingZongdi: 'ZD-JL-CL-2022-004-0201', usageType: '耕地-水田', infoStatus: '正常', location: { lat: 43.850, lng: 125.345 }, owner: '农垦集团', contact: '139****0202', org: '第三农场' },
  { id: 'p50', name: '长岭-太平川盐碱地块', type: 'SALINE_ALKALI', area: 4860.90, code: 'YD-JL-CL-2022-006-0203', farm: '长岭种马场', region: '吉林省-松原市-长岭县-太平川镇', status: 'STABLE', salineLevel: '轻度盐碱地', salineType: '氯化物盐碱地', belongingZongdi: 'ZD-JL-CL-2020-005-0056', usageType: '未利用地', infoStatus: '正常', location: { lat: 43.840, lng: 125.355 }, owner: '农垦集团', contact: '139****0203', org: '第三农场' },
  { id: 'p51', name: '长岭-统种小麦基地', type: 'LEASING', leaseType: '统种', area: 4200.80, crop: '小麦', version: '2026年种植季', code: 'ZL-JL-CL-2026-007-0204', belongingZongdi: 'ZD-JL-CL-2021-004-0078', farm: '长岭种马场', usageType: '耕地-水田', inputArea: 4200.80, drawArea: 4150.30, preCrop: '小麦', preCropVariety: '蒙麦20', preCropNature: '重茬', contractorName: '长岭县农兴统种合作社', contractorIdentity: '企业法人', retirementDate: '2031-08-20', contractStartDate: '2026-04-10', contractEndDate: '2027-04-09', contractAmount: 12000, status: 'STABLE', location: { lat: 43.855, lng: 125.340 }, owner: '合作社', contact: '138****0204', org: '经营部' },
  { id: 'p52', name: '长岭-承租玉米北地', type: 'LEASING', leaseType: '承租', area: 1850.45, crop: '玉米', version: '2026年种植季', code: 'ZL-JL-CL-2026-008-0205', belongingZongdi: 'ZD-JL-CL-2022-003-0012', farm: '长岭种马场', usageType: '耕地-旱地', inputArea: 1850.45, drawArea: 1830.20, preCrop: '玉米', preCropVariety: '先育335', preCropNature: '重茬', contractorName: '张德发', contractorIdentity: '个人', retirementDate: '2028-12-31', contractStartDate: '2026-03-28', contractEndDate: '2027-03-27', contractAmount: 5500, status: 'STABLE', location: { lat: 43.848, lng: 125.358 }, owner: '个人', contact: '135****0205', org: '经营部' },

  // ═══ 洮南农场 ═══
  { id: 'p53', name: '洮南-黑水高标农田', type: 'HIGH_STANDARD', area: 3860.50, code: 'GB-JL-TN-2024-001-0301', farm: '洮南农场', region: '吉林省-白城市-洮南市-黑水镇', renovationStatus: '施工中', status: 'STABLE', planYear: '2024', buildYear: '2025', belongingZongdi: 'ZD-JL-TN-2021-001-0301', usageType: '耕地-水田', infoStatus: '正常', location: { lat: 45.555, lng: 122.815 }, owner: '农垦集团', contact: '138****0301', org: '洮南农场' },
  { id: 'p54', name: '洮南-安定盐碱治理区', type: 'SALINE_ALKALI', area: 3560.20, code: 'YD-JL-TN-2023-002-0302', farm: '洮南农场', region: '吉林省-白城市-洮南市-安定镇', status: 'STABLE', salineLevel: '重度盐碱地', salineType: '苏打盐碱地', belongingZongdi: 'ZD-JL-TN-2020-002-0302', usageType: '未利用地', infoStatus: '正常', location: { lat: 45.548, lng: 122.805 }, owner: '农垦集团', contact: '138****0302', org: '洮南农场' },

  // ═══ 大安农场 ═══
  { id: 'p55', name: '大安-月亮泡高标农田', type: 'HIGH_STANDARD', area: 4250.80, code: 'GB-JL-DA-2024-001-0401', farm: '大安农场', region: '吉林省-白城市-大安市-月亮泡镇', renovationStatus: '已完成', status: 'STABLE', planYear: '2023', buildYear: '2024', belongingZongdi: 'ZD-JL-DA-2022-001-0401', usageType: '耕地-旱地', infoStatus: '正常', location: { lat: 45.550, lng: 122.725 }, owner: '农垦集团', contact: '139****0401', org: '大安农场' },
  { id: 'p56', name: '大安-安广盐碱改良地', type: 'SALINE_ALKALI', area: 4820.60, code: 'YD-JL-DA-2022-002-0402', farm: '大安农场', region: '吉林省-白城市-大安市-安广镇', status: 'STABLE', salineLevel: '中度盐碱地', salineType: '氯化物盐碱地', belongingZongdi: 'ZD-JL-DA-2021-002-0045', usageType: '未利用地', infoStatus: '正常', location: { lat: 45.545, lng: 122.718 }, owner: '农垦集团', contact: '139****0402', org: '大安农场' },

  // ═══ 通榆农场 ═══
  { id: 'p57', name: '通榆-向海高标示范区', type: 'HIGH_STANDARD', area: 3980.30, code: 'GB-JL-TY-2024-001-0501', farm: '通榆农场', region: '吉林省-白城市-通榆县-向海乡', renovationStatus: '已完成', status: 'STABLE', planYear: '2023', buildYear: '2024', belongingZongdi: 'ZD-JL-TY-2022-001-0501', usageType: '耕地-旱地', infoStatus: '正常', location: { lat: 45.512, lng: 122.798 }, owner: '农垦集团', contact: '137****0501', org: '通榆农场' },
  { id: 'p58', name: '通榆-兴隆山盐碱地块', type: 'SALINE_ALKALI', area: 5120.40, code: 'YD-JL-TY-2023-002-0502', farm: '通榆农场', region: '吉林省-白城市-通榆县-兴隆山镇', status: 'STABLE', salineLevel: '轻度盐碱地', salineType: '苏打盐碱地', belongingZongdi: 'ZD-JL-TY-2020-002-0050', usageType: '未利用地', infoStatus: '正常', location: { lat: 45.508, lng: 122.793 }, owner: '农垦集团', contact: '137****0502', org: '通榆农场' },
];

export const mockPlotOperations: Record<string, FieldOperation[]> = {
  p4: [
    { id: 'op-p4-1', type: '播种', item: '小麦平播', date: '2026-04-15', crop: '小麦', variety: '蒙麦20', detail: '播种量 15kg/亩' },
    { id: 'op-p4-2', type: '田间管理', item: '春季除草', date: '2026-05-10', detail: '化学除草剂喷洒' },
    { id: 'op-p4-3', type: '田间管理', item: '追肥', date: '2026-06-02', detail: '尿素 10kg/亩' },
    { id: 'op-p4-4', type: '收获', item: '小麦收割', date: '2026-07-20', crop: '小麦', variety: '蒙麦20', detail: '预计产量 420kg/亩' },
  ],
  p6: [
    { id: 'op-p6-1', type: '播种', item: '玉米精量播种', date: '2026-04-20', crop: '玉米', variety: '郑单958', detail: '株距 25cm，行距 60cm' },
    { id: 'op-p6-2', type: '田间管理', item: '苗后除草', date: '2026-05-15', detail: '机械中耕除草' },
    { id: 'op-p6-3', type: '田间管理', item: '灌水', date: '2026-06-25', detail: '滴灌 30m³/亩' },
    { id: 'op-p6-4', type: '田间管理', item: '追肥', date: '2026-07-05', detail: '复合肥 15kg/亩' },
    { id: 'op-p6-5', type: '收获', item: '玉米机械收获', date: '2026-10-15', crop: '玉米', variety: '郑单958', detail: '预计产量 650kg/亩' },
  ],
  p18: [
    { id: 'op-p18-1', type: '播种', item: '大豆播种', date: '2026-05-01', crop: '大豆', variety: '中黄13', detail: '播种量 5kg/亩' },
    { id: 'op-p18-2', type: '田间管理', item: '除草', date: '2026-06-10', detail: '人工除草 + 化学除草' },
    { id: 'op-p18-3', type: '收获', item: '大豆收割', date: '2026-09-25', crop: '大豆', variety: '中黄13', detail: '预计产量 180kg/亩' },
  ],
  p19: [
    { id: 'op-p19-1', type: '播种', item: '玉米精量播种', date: '2026-04-18', crop: '玉米', variety: '郑单958', detail: '株距 25cm，行距 60cm' },
    { id: 'op-p19-2', type: '田间管理', item: '灌水', date: '2026-06-20', detail: '喷灌 25m³/亩' },
    { id: 'op-p19-3', type: '田间管理', item: '追肥', date: '2026-07-10', detail: '尿素 12kg/亩' },
    { id: 'op-p19-4', type: '收获', item: '玉米机械收获', date: '2026-10-20', crop: '玉米', variety: '郑单958', detail: '预计产量 680kg/亩' },
  ],
  p20: [
    { id: 'op-p20-1', type: '播种', item: '大豆播种', date: '2026-05-05', crop: '大豆', variety: '黑河43', detail: '播种量 5kg/亩' },
    { id: 'op-p20-2', type: '田间管理', item: '除草', date: '2026-06-15', detail: '机械中耕' },
    { id: 'op-p20-3', type: '收获', item: '大豆收割', date: '2026-09-28', crop: '大豆', variety: '黑河43', detail: '预计产量 190kg/亩' },
  ],
  p21: [
    { id: 'op-p21-1', type: '播种', item: '小麦条播', date: '2026-04-12', crop: '小麦', variety: '蒙麦20', detail: '播种量 16kg/亩' },
    { id: 'op-p21-2', type: '田间管理', item: '春季除草', date: '2026-05-08', detail: '化学除草' },
    { id: 'op-p21-3', type: '田间管理', item: '灌水', date: '2026-06-15', detail: '滴灌 28m³/亩' },
    { id: 'op-p21-4', type: '收获', item: '小麦收割', date: '2026-07-25', crop: '小麦', variety: '蒙麦20', detail: '预计产量 410kg/亩' },
  ],
  p22: [
    { id: 'op-p22-1', type: '播种', item: '玉米播种', date: '2026-04-22', crop: '玉米', variety: '先育335', detail: '株距 28cm，行距 60cm' },
    { id: 'op-p22-2', type: '田间管理', item: '苗后除草', date: '2026-05-20', detail: '除草剂喷洒' },
    { id: 'op-p22-3', type: '收获', item: '玉米收获', date: '2026-10-10', crop: '玉米', variety: '先育335', detail: '预计产量 630kg/亩' },
  ],
  p23: [
    { id: 'op-p23-1', type: '播种', item: '小麦播种', date: '2026-04-10', crop: '小麦', variety: '京麦31', detail: '播种量 14kg/亩' },
    { id: 'op-p23-2', type: '田间管理', item: '追肥', date: '2026-06-05', detail: '磷酸二铵 10kg/亩' },
    { id: 'op-p23-3', type: '田间管理', item: '灌水', date: '2026-06-20', detail: '喷灌 30m³/亩' },
    { id: 'op-p23-4', type: '收获', item: '小麦收割', date: '2026-07-30', crop: '小麦', variety: '京麦31', detail: '预计产量 430kg/亩' },
  ],
  p24: [
    { id: 'op-p24-1', type: '播种', item: '大豆播种', date: '2026-05-08', crop: '大豆', variety: '中黄13', detail: '播种量 4.5kg/亩' },
    { id: 'op-p24-2', type: '田间管理', item: '除草', date: '2026-06-18', detail: '机械除草' },
    { id: 'op-p24-3', type: '收获', item: '大豆收割', date: '2026-09-22', crop: '大豆', variety: '中黄13', detail: '预计产量 175kg/亩' },
  ],
  p25: [
    { id: 'op-p25-1', type: '播种', item: '玉米播种', date: '2026-04-25', crop: '玉米', variety: '郑单958', detail: '株距 26cm' },
    { id: 'op-p25-2', type: '田间管理', item: '除草', date: '2026-05-25', detail: '人工除草' },
    { id: 'op-p25-3', type: '收获', item: '玉米收获', date: '2026-10-12', crop: '玉米', variety: '郑单958', detail: '预计产量 600kg/亩' },
  ],
  p26: [
    { id: 'op-p26-1', type: '播种', item: '大豆播种', date: '2026-05-03', crop: '大豆', variety: '黑河43', detail: '播种量 5kg/亩' },
    { id: 'op-p26-2', type: '田间管理', item: '灌水', date: '2026-06-22', detail: '滴灌 20m³/亩' },
    { id: 'op-p26-3', type: '田间管理', item: '追肥', date: '2026-07-08', detail: '复合肥 10kg/亩' },
    { id: 'op-p26-4', type: '收获', item: '大豆收割', date: '2026-09-30', crop: '大豆', variety: '黑河43', detail: '预计产量 185kg/亩' },
  ],
  p27: [
    { id: 'op-p27-1', type: '播种', item: '小麦播种', date: '2026-04-14', crop: '小麦', variety: '蒙麦20', detail: '播种量 15kg/亩' },
    { id: 'op-p27-2', type: '田间管理', item: '除草', date: '2026-05-12', detail: '化学除草' },
    { id: 'op-p27-3', type: '田间管理', item: '灌水', date: '2026-06-18', detail: '喷灌 25m³/亩' },
    { id: 'op-p27-4', type: '收获', item: '小麦收割', date: '2026-07-22', crop: '小麦', variety: '蒙麦20', detail: '预计产量 400kg/亩' },
  ],
  p28: [
    { id: 'op-p28-1', type: '播种', item: '玉米播种', date: '2026-04-20', crop: '玉米', variety: '先育335', detail: '株距 27cm' },
    { id: 'op-p28-2', type: '田间管理', item: '灌水', date: '2026-06-28', detail: '滴灌 28m³/亩' },
    { id: 'op-p28-3', type: '田间管理', item: '追肥', date: '2026-07-12', detail: '尿素 15kg/亩' },
    { id: 'op-p28-4', type: '收获', item: '玉米收获', date: '2026-10-18', crop: '玉米', variety: '先育335', detail: '预计产量 660kg/亩' },
  ],
  p29: [
    { id: 'op-p29-1', type: '播种', item: '小麦条播', date: '2026-04-16', crop: '小麦', variety: '京麦31', detail: '播种量 13kg/亩' },
    { id: 'op-p29-2', type: '田间管理', item: '除草', date: '2026-05-14', detail: '机械除草' },
    { id: 'op-p29-3', type: '收获', item: '小麦收割', date: '2026-07-18', crop: '小麦', variety: '京麦31', detail: '预计产量 380kg/亩' },
  ],
  p30: [
    { id: 'op-p30-1', type: '播种', item: '大豆播种', date: '2026-05-10', crop: '大豆', variety: '中黄13', detail: '播种量 5kg/亩' },
    { id: 'op-p30-2', type: '田间管理', item: '除草', date: '2026-06-20', detail: '化学除草' },
    { id: 'op-p30-3', type: '田间管理', item: '灌水', date: '2026-07-15', detail: '滴灌 18m³/亩' },
    { id: 'op-p30-4', type: '收获', item: '大豆收割', date: '2026-09-26', crop: '大豆', variety: '中黄13', detail: '预计产量 170kg/亩' },
  ],
  // 新增地块的田间作业
  p34: [
    { id: 'op-p34-1', type: '播种', item: '玉米精量播种', date: '2026-04-18', crop: '玉米', variety: '郑单958', detail: '株距 25cm，行距 60cm' },
    { id: 'op-p34-2', type: '田间管理', item: '灌水', date: '2026-06-22', detail: '滴灌 25m³/亩' },
    { id: 'op-p34-3', type: '田间管理', item: '追肥', date: '2026-07-15', detail: '尿素 12kg/亩' },
    { id: 'op-p34-4', type: '收获', item: '玉米机械收获', date: '2026-10-20', crop: '玉米', variety: '郑单958', detail: '预计产量 660kg/亩' },
  ],
  p35: [
    { id: 'op-p35-1', type: '播种', item: '大豆播种', date: '2026-05-06', crop: '大豆', variety: '黑河43', detail: '播种量 4.5kg/亩' },
    { id: 'op-p35-2', type: '田间管理', item: '除草', date: '2026-06-15', detail: '人工除草' },
    { id: 'op-p35-3', type: '田间管理', item: '灌水', date: '2026-07-10', detail: '滴灌 18m³/亩' },
    { id: 'op-p35-4', type: '收获', item: '大豆收割', date: '2026-09-28', crop: '大豆', variety: '黑河43', detail: '预计产量 180kg/亩' },
  ],
  p38: [
    { id: 'op-p38-1', type: '播种', item: '大豆播种', date: '2026-05-02', crop: '大豆', variety: '中黄13', detail: '播种量 5kg/亩' },
    { id: 'op-p38-2', type: '田间管理', item: '除草', date: '2026-06-10', detail: '机械中耕' },
    { id: 'op-p38-3', type: '田间管理', item: '灌水', date: '2026-07-18', detail: '喷灌 22m³/亩' },
    { id: 'op-p38-4', type: '收获', item: '大豆收割', date: '2026-09-25', crop: '大豆', variety: '中黄13', detail: '预计产量 185kg/亩' },
  ],
  p39: [
    { id: 'op-p39-1', type: '播种', item: '玉米播种', date: '2026-04-22', crop: '玉米', variety: '先育335', detail: '株距 27cm' },
    { id: 'op-p39-2', type: '田间管理', item: '灌水', date: '2026-06-25', detail: '滴灌 28m³/亩' },
    { id: 'op-p39-3', type: '田间管理', item: '追肥', date: '2026-07-20', detail: '复合肥 15kg/亩' },
    { id: 'op-p39-4', type: '收获', item: '玉米收获', date: '2026-10-15', crop: '玉米', variety: '先育335', detail: '预计产量 640kg/亩' },
  ],
  p41: [
    { id: 'op-p41-1', type: '播种', item: '大豆播种', date: '2026-05-04', crop: '大豆', variety: '黑河43', detail: '播种量 5kg/亩' },
    { id: 'op-p41-2', type: '田间管理', item: '除草', date: '2026-06-12', detail: '化学除草' },
    { id: 'op-p41-3', type: '田间管理', item: '灌水', date: '2026-07-08', detail: '滴灌 20m³/亩' },
    { id: 'op-p41-4', type: '收获', item: '大豆收割', date: '2026-09-22', crop: '大豆', variety: '黑河43', detail: '预计产量 175kg/亩' },
  ],
  p42: [
    { id: 'op-p42-1', type: '播种', item: '小麦条播', date: '2026-04-12', crop: '小麦', variety: '蒙麦20', detail: '播种量 15kg/亩' },
    { id: 'op-p42-2', type: '田间管理', item: '春季除草', date: '2026-05-10', detail: '化学除草' },
    { id: 'op-p42-3', type: '田间管理', item: '追肥', date: '2026-06-08', detail: '尿素 10kg/亩' },
    { id: 'op-p42-4', type: '收获', item: '小麦收割', date: '2026-07-25', crop: '小麦', variety: '蒙麦20', detail: '预计产量 410kg/亩' },
  ],
  p43: [{ id: 'op-p43-1', type: '播种', item: '玉米精量播种', date: '2026-04-20', crop: '玉米', variety: '郑单958', detail: '株距25cm行距60cm' }, { id: 'op-p43-2', type: '田间管理', item: '苗后除草', date: '2026-05-15', detail: '机械中耕除草' }, { id: 'op-p43-3', type: '田间管理', item: '灌水', date: '2026-06-25', detail: '滴灌30m³/亩' }, { id: 'op-p43-4', type: '收获', item: '玉米机械收获', date: '2026-10-15', crop: '玉米', variety: '郑单958', detail: '预计650kg/亩' }],
  p44: [{ id: 'op-p44-1', type: '播种', item: '小麦条播', date: '2026-04-12', crop: '小麦', variety: '蒙麦20', detail: '播种量15kg/亩' }, { id: 'op-p44-2', type: '田间管理', item: '春季除草', date: '2026-05-10', detail: '化学除草剂喷洒' }, { id: 'op-p44-3', type: '田间管理', item: '追肥', date: '2026-06-02', detail: '尿素10kg/亩' }, { id: 'op-p44-4', type: '收获', item: '小麦收割', date: '2026-07-20', crop: '小麦', variety: '蒙麦20', detail: '预计420kg/亩' }],
  p45: [{ id: 'op-p45-1', type: '田间管理', item: '盐碱地改良深耕', date: '2026-04-25', detail: '深翻30cm配合有机肥' }, { id: 'op-p45-2', type: '田间管理', item: '灌水洗盐', date: '2026-05-20', detail: '大水漫灌80m³/亩' }],
  p46: [{ id: 'op-p46-1', type: '播种', item: '玉米精量播种', date: '2026-04-18', crop: '玉米', variety: '郑单958', detail: '株距25cm行距60cm' }, { id: 'op-p46-2', type: '田间管理', item: '灌水', date: '2026-06-22', detail: '滴灌25m³/亩' }, { id: 'op-p46-3', type: '田间管理', item: '追肥', date: '2026-07-15', detail: '尿素12kg/亩' }, { id: 'op-p46-4', type: '收获', item: '玉米机械收获', date: '2026-10-20', crop: '玉米', variety: '郑单958', detail: '预计660kg/亩' }],
  p47: [{ id: 'op-p47-1', type: '播种', item: '大豆播种', date: '2026-05-02', crop: '大豆', variety: '中黄13', detail: '播种量5kg/亩' }, { id: 'op-p47-2', type: '田间管理', item: '除草', date: '2026-06-10', detail: '机械中耕' }, { id: 'op-p47-3', type: '收获', item: '大豆收割', date: '2026-09-25', crop: '大豆', variety: '中黄13', detail: '预计185kg/亩' }],
  p48: [{ id: 'op-p48-1', type: '播种', item: '玉米播种', date: '2026-04-22', crop: '玉米', variety: '先育335', detail: '株距27cm' }, { id: 'op-p48-2', type: '田间管理', item: '灌水', date: '2026-06-25', detail: '滴灌28m³/亩' }, { id: 'op-p48-3', type: '田间管理', item: '追肥', date: '2026-07-20', detail: '复合肥15kg/亩' }, { id: 'op-p48-4', type: '收获', item: '玉米收获', date: '2026-10-15', crop: '玉米', variety: '先育335', detail: '预计640kg/亩' }],
  p49: [{ id: 'op-p49-1', type: '播种', item: '大豆播种', date: '2026-05-04', crop: '大豆', variety: '黑河43', detail: '播种量5kg/亩' }, { id: 'op-p49-2', type: '田间管理', item: '除草', date: '2026-06-12', detail: '化学除草' }, { id: 'op-p49-3', type: '田间管理', item: '灌水', date: '2026-07-08', detail: '滴灌20m³/亩' }, { id: 'op-p49-4', type: '收获', item: '大豆收割', date: '2026-09-22', crop: '大豆', variety: '黑河43', detail: '预计175kg/亩' }],
  p50: [{ id: 'op-p50-1', type: '田间管理', item: '盐碱地深松改良', date: '2026-04-20', detail: '深松35cm施用改良剂' }, { id: 'op-p50-2', type: '田间管理', item: '灌水压碱', date: '2026-05-15', detail: '喷灌60m³/亩' }],
  p51: [{ id: 'op-p51-1', type: '播种', item: '小麦条播', date: '2026-04-12', crop: '小麦', variety: '蒙麦20', detail: '播种量15kg/亩' }, { id: 'op-p51-2', type: '田间管理', item: '春季除草', date: '2026-05-10', detail: '化学除草' }, { id: 'op-p51-3', type: '田间管理', item: '追肥', date: '2026-06-08', detail: '尿素10kg/亩' }, { id: 'op-p51-4', type: '收获', item: '小麦收割', date: '2026-07-25', crop: '小麦', variety: '蒙麦20', detail: '预计410kg/亩' }],
  p52: [{ id: 'op-p52-1', type: '播种', item: '玉米精量播种', date: '2026-04-20', crop: '玉米', variety: '郑单958', detail: '株距25cm行距60cm' }, { id: 'op-p52-2', type: '田间管理', item: '苗后除草', date: '2026-05-15', detail: '机械中耕除草' }, { id: 'op-p52-3', type: '田间管理', item: '追肥', date: '2026-07-05', detail: '复合肥15kg/亩' }, { id: 'op-p52-4', type: '收获', item: '玉米机械收获', date: '2026-10-15', crop: '玉米', variety: '郑单958', detail: '预计650kg/亩' }],
};

export const mockPlanting: PlantingRecord[] = [
  { id: 'p1', unitName: '第一农场-3号地', crop: '玉米', area: 500, startTime: '2024-04-15', personnel: '王小二' },
  { id: 'p2', unitName: '第一农场-5号地', crop: '大豆', area: 350, startTime: '2024-04-20', personnel: '李大壮' },
];

export const mockPlantingPlans: PlantingPlan[] = [
  {
    id: 'plan1',
    category: '粮食作物',
    crop: '小麦',
    variety: '蒙麦20',
    details: [
      { type: '承租', count: 123, area: 12345.67 },
      { type: '统种', count: 123, area: 12345.67 },
    ]
  },
  {
    id: 'plan2',
    category: '粮食作物',
    crop: '玉米',
    variety: '郑单958',
    details: [
      { type: '承租', count: 80, area: 8500.2 },
    ]
  },
  {
    id: 'plan3',
    category: '油料作物',
    crop: '大豆',
    variety: '中黄13',
    details: [
      { type: '承租', count: 200, area: 15600.75 },
    ]
  }
];

export const mockYieldRecords: YieldRecord[] = [
  {
    id: 'y1',
    category: '粮食作物',
    details: [
      { type: '承租', plotCount: 156, area: 12450.5, estimatedYield: 8500 },
      { type: '统种', plotCount: 84, area: 8500.2, estimatedYield: 6200 }
    ]
  },
  {
    id: 'y2',
    category: '油料作物',
    details: [
      { type: '承租', plotCount: 42, area: 3200.7, estimatedYield: 1200 },
      { type: '统种', plotCount: 15, area: 1200.3, estimatedYield: 450 }
    ]
  },
  {
    id: 'y3',
    category: '经济作物',
    details: [
      { type: '承租', plotCount: 12, area: 850.5, estimatedYield: 300 },
      { type: '统种', plotCount: 8, area: 450.2, estimatedYield: 180 }
    ]
  },
  {
    id: 'y4',
    category: '牧草、杂粮及其他作物',
    details: [
      { type: '承租', plotCount: 5, area: 240.5, estimatedYield: 120 }
    ]
  }
];

export const mockRecipes: AgronomicRecipe[] = [
  {
    id: 'r1',
    name: '玉米苗期控旺配方',
    suitableCrop: '玉米',
    suitableOperation: '田间管理',
    description: '适用于播种后30-40天，玉米6-8叶期使用，防止徒长。',
    materials: [
      { id: 'm1', name: '矮壮素', type: 'PESTICIDE', dosage: '50ml/亩', unitPrice: '45' },
      { id: 'm2', name: '磷酸二氢钾', type: 'FERTILIZER', dosage: '100g/亩', unitPrice: '12' }
    ]
  },
  {
    id: 'r2',
    name: '小麦”一喷三防”配方',
    suitableCrop: '小麦',
    suitableOperation: '植保',
    description: '通过喷洒药剂，同时起到防病、防虫、防干热风的作用。',
    materials: [
      { id: 'm3', name: '吡虫啉', type: 'PESTICIDE', dosage: '20g/亩', unitPrice: '35' },
      { id: 'm4', name: '三唑酮', type: 'PESTICIDE', dosage: '80g/亩', unitPrice: '28' },
      { id: 'm5', name: '磷酸二氢钾', type: 'FERTILIZER', dosage: '150g/亩', unitPrice: '12' }
    ]
  },
  {
    id: 'r3',
    name: '大豆初花期追肥配方',
    suitableCrop: '大豆',
    suitableOperation: '施肥',
    description: '大豆初花期追施氮磷钾复合肥，促进结荚。',
    materials: [
      { id: 'm6', name: '尿素', type: 'FERTILIZER', dosage: '5kg/亩', unitPrice: '28' },
      { id: 'm7', name: '过磷酸钙', type: 'FERTILIZER', dosage: '15kg/亩', unitPrice: '18' },
      { id: 'm8', name: '硫酸钾', type: 'FERTILIZER', dosage: '8kg/亩', unitPrice: '35' }
    ]
  },
  {
    id: 'r4',
    name: '玉米播种基肥配方',
    suitableCrop: '玉米',
    suitableOperation: '播种',
    description: '播种时一次性施入底肥，保证苗期至拔节期养分供应。',
    materials: [
      { id: 'm9', name: '复合肥(15-15-15)', type: 'FERTILIZER', dosage: '40kg/亩', unitPrice: '32' },
      { id: 'm10', name: '有机肥', type: 'FERTILIZER', dosage: '500kg/亩', unitPrice: '8' }
    ]
  },
  {
    id: 'r5',
    name: '小麦播前拌种配方',
    suitableCrop: '小麦',
    suitableOperation: '播种',
    description: '播前药剂拌种，预防地下害虫和土传病害。',
    materials: [
      { id: 'm11', name: '戊唑醇悬浮种衣剂', type: 'PESTICIDE', dosage: '30ml/亩', unitPrice: '55' },
      { id: 'm12', name: '吡虫啉种衣剂', type: 'PESTICIDE', dosage: '40ml/亩', unitPrice: '42' }
    ]
  },
  {
    id: 'r6',
    name: '大豆苗后除草配方',
    suitableCrop: '大豆',
    suitableOperation: '田间管理',
    description: '大豆2-3片复叶期使用，防除一年生禾本科和阔叶杂草。',
    materials: [
      { id: 'm13', name: '精喹禾灵', type: 'PESTICIDE', dosage: '60ml/亩', unitPrice: '38' },
      { id: 'm14', name: '氟磺胺草醚', type: 'PESTICIDE', dosage: '100ml/亩', unitPrice: '45' }
    ]
  },
  {
    id: 'r7',
    name: '高粱拔节期追肥配方',
    suitableCrop: '高粱',
    suitableOperation: '施肥',
    description: '高粱拔节至孕穗期追施氮肥，促进穗分化。',
    materials: [
      { id: 'm15', name: '尿素', type: 'FERTILIZER', dosage: '20kg/亩', unitPrice: '28' },
      { id: 'm16', name: '氯化钾', type: 'FERTILIZER', dosage: '10kg/亩', unitPrice: '30' }
    ]
  },
  {
    id: 'r8',
    name: '玉米穗期追肥配方',
    suitableCrop: '玉米',
    suitableOperation: '施肥',
    description: '大喇叭口期追施氮肥，促进穗大粒多。',
    materials: [
      { id: 'm17', name: '尿素', type: 'FERTILIZER', dosage: '25kg/亩', unitPrice: '28' },
      { id: 'm18', name: '硫酸锌', type: 'FERTILIZER', dosage: '1kg/亩', unitPrice: '15' }
    ]
  },
];

export const mockStaffs: Staff[] = [
  {
    id: 's1',
    name: '某某某',
    gender: '男',
    age: 35,
    role: '角色名称',
    org: '农发集团 > XXXXX农场1',
    post: '岗位1',
    posts: [
      { org: '农发集团 > XXXXX农场1', post: '1111' },
      { org: '农发集团 > XXXXX农场1', post: '2222' }
    ],
    lastLogin: '2027-10-26 15:12:11'
  },
  {
    id: 's2',
    name: '张三',
    gender: '男',
    age: 28,
    role: '管理员',
    org: '农发集团 > XXXXX农场2',
    post: '岗位2',
    posts: [
      { org: '农发集团 > XXXXX农场2', post: '001' }
    ],
    lastLogin: '2027-10-26 14:20:05'
  },
  {
    id: 's3',
    name: '李丽',
    gender: '女',
    age: 30,
    role: '技术员',
    org: '农发集团 > XXXXX农场1',
    post: '岗位1',
    lastLogin: '2027-10-26 12:05:33'
  }
];

export const mockStaffOperations: StaffOperationDetail[] = [
  {
    id: 'so1',
    type: '田间管理',
    item: '除草',
    date: '2026-11-4',
    org: 'XXX农场',
    plotCount: 3,
    area: 8021,
    crop: '小麦',
    variety: '京麦31',
    plots: [
      { name: '地块名称(地块编号)', code: 'B2021-01', area: 2021 },
      { name: '地块名称(地块编号)', code: 'B2021-02', area: 2021 },
      { name: '地块名称(地块编号)', code: 'B2021-03', area: 2145 }
    ]
  },
  {
    id: 'so2',
    type: '田间管理',
    item: '苗前灭草',
    date: '2026-9-5',
    org: 'XXX农场',
    plotCount: 2,
    area: 4500,
    crop: '大豆',
    variety: '黑河43',
    plots: [
      { name: '北区01号', code: 'N01', area: 2200 },
      { name: '北区02号', code: 'N02', area: 2300 }
    ]
  },
  {
    id: 'so3',
    type: '播种',
    item: '平播',
    date: '2026-5-5',
    org: 'XXX农场',
    plotCount: 5,
    area: 12000,
    crop: '玉米',
    variety: '先育335',
    plots: []
  }
];
