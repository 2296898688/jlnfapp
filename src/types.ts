/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'GROUP_ADMIN' | 'FARM_ADMIN' | 'OPERATOR' | 'NONGKEN_ADMIN' | 'LAND_COMPANY_ADMIN';

export interface User {
  id: string;
  username: string;
  realName: string;
  role: UserRole;
  avatar?: string;
  orgName: string;
  orgFilter?: string;
}

export interface TodoItem {
  id: string;
  title: string;
  type: 'TASK' | 'APPROVAL' | 'REPORT';
  status: 'PENDING' | 'COMPLETED';
  createTime: string;
}

export interface LandStat {
  label: string;
  value: number;
  unit: string;
  color: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'SOIL_SENSOR' | 'WEATHER_STATION' | 'SOIL_MOISTURE' | 'CAMERA' | 'SPORE_TRAP' | 'PEST_MONITOR' | 'FERTIGATION' | 'CONTROLLER' | 'SMART_VALVE';
  status: 'ONLINE' | 'OFFLINE' | 'FAULT';
  location: { lat: number; lng: number };
  lastData: Record<string, number | string>;
  // New fields for details
  deviceInfo?: {
    type: string;
    name: string;
    farm: string;
    adminRegion: string;
    manufacturer: string;
    model: string;
    remoteControlSupported: boolean;
  };
  installInfo?: {
    installer: string;
    installDate: string;
    model: string;
    supplier: string;
    address: string;
  };
  alarms?: {
    id: string;
    content: string;
    time: string;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
  historyData?: {
    time: string;
    value: number;
    metric: string;
  }[];
  collectedLogs?: {
    id: string;
    time: string;
    data: string;
    status: string;
  }[];
}

export interface Farm {
  id: string;
  name: string;
  totalArea: string;
  location: string;
  center: { lat: number; lng: number };
}

export interface PlantingRecord {
  id: string;
  unitName: string;
  crop: string;
  area: number;
  startTime: string;
  personnel: string;
}

export interface PlantingPlan {
  id: string;
  category: string; 
  crop: string;   
  variety: string; 
  details: {
    type: '承租' | '统种';
    count: number;
    area: number;
  }[];
}

export interface YieldRecord {
  id: string;
  category: string;
  details: {
    type: '承租' | '统种';
    plotCount: number;
    area: number;
    estimatedYield: number;
  }[];
}

export interface Staff {
  id: string;
  name: string;
  gender: '男' | '女';
  age: number;
  role: string;
  org: string;
  post: string;
  posts?: { org: string; post: string }[];
  lastLogin: string;
}

export interface StaffOperation {
  id: string;
  type: string;
  item: string;
  date: string;
  org: string;
  plotCount: number;
  area: number;
}

export interface StaffOperationDetail extends StaffOperation {
  crop: string;
  variety: string;
  plots: {
    name: string;
    code: string;
    area: number;
  }[];
}

export interface MapPlot {
  id: string;
  name: string;
  type: 'ZONGDI' | 'HIGH_STANDARD' | 'SALINE_ALKALI' | 'LEASING';
  area: number;
  crop?: string;
  variety?: string;
  status: 'STABLE' | 'FIXING' | 'IDLE';
  leaseType?: '统种' | '承租';
  location: { lat: number; lng: number };
  owner: string;
  contact: string;
  org: string;
  // Detailed fields for ZONGDI
  code?: string;
  version?: string;
  farm?: string;
  region?: string;
  category?: string;
  usageType?: string;
  attribution?: string;
  titleStatus?: string;
  certLocation?: string;
  certType?: string;
  certNo?: string;
  certAuthority?: string;
  certDate?: string;
  certHolder?: string;
  ownershipType?: string;
  unitNo?: string;
  rightType?: string;
  useRightType?: string;
  landClass?: string;
  useArea?: number;
  startDate?: string;
  endDate?: string;
  // HIGH_STANDARD fields
  planYear?: string;
  buildYear?: string;
  renovationStatus?: string;
  infoStatus?: string;
  rejectionReason?: string;
  belongingZongdi?: string;

  // SALINE_ALKALI fields
  salineLevel?: string;
  salineType?: string;

  // Planting (LEASING) detailed fields
  inputArea?: number;
  drawArea?: number;
  preCrop?: string;
  preCropVariety?: string;
  preCropNature?: string;
  contractorName?: string;
  contractorIdentity?: string;
  retirementDate?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  contractAmount?: number;
}

export interface RecipeMaterial {
  id: string;
  name: string;
  type: 'SEED' | 'FERTILIZER' | 'PESTICIDE';
  dosage: string;
  unitPrice?: string;
}

export interface AgronomicRecipe {
  id: string;
  name: string;
  suitableCrop: string;
  suitableOperation: string;
  materials: RecipeMaterial[];
  description?: string;
  waterUsage?: {
    dosage: string;
    unitPrice: string;
  };
}

export type MapViewType = 'land' | 'crops' | 'iot';

export interface FieldOperation {
  id: string;
  type: '播种' | '田间管理' | '收获';
  item: string;
  date: string;
  detail?: string;
  crop?: string;
  variety?: string;
  area?: number;
  operator?: string;
  machinery?: string;
}
