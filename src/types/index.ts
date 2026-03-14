export type InstanceStatus = 'idle' | 'active' | 'stopped' | 'terminated';
export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed';
export type RecommendationType = 'terminate' | 'rightsize' | 'schedule' | 'snapshot';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Region =
  | 'us-east-1' | 'us-east-2' | 'us-west-1' | 'us-west-2'
  | 'eu-west-1' | 'eu-west-2' | 'eu-central-1'
  | 'ap-southeast-1' | 'ap-southeast-2' | 'ap-northeast-1'
  | 'sa-east-1' | 'ca-central-1';

export interface AWSAccount {
  id: string;
  accountId: string;
  name: string;
  environment: 'production' | 'staging' | 'development';
  totalInstances: number;
  idleInstances: number;
  monthlyCost: number;
  wasteCost: number;
}

export interface EC2Instance {
  id: string;
  instanceId: string;
  accountId: string;
  accountName: string;
  region: Region;
  instanceType: string;
  name: string;
  status: InstanceStatus;
  idleScore: number; // 0-100, higher = more idle
  cpuAvg: number;
  cpuMax: number;
  networkInAvg: number;
  networkOutAvg: number;
  diskReadAvg: number;
  diskWriteAvg: number;
  launchTime: string;
  lastActiveTime: string;
  monthlyCost: number;
  potentialSavings: number;
  tags: Record<string, string>;
  os: 'Linux' | 'Windows';
  state: 'running' | 'stopped';
  flagged: boolean;
  ignored: boolean;
}

export interface ScanJob {
  id: string;
  jobId: string;
  accountId: string;
  accountName: string;
  regions: Region[];
  status: ScanStatus;
  progress: number; // 0-100
  startTime: string;
  endTime?: string;
  instancesScanned: number;
  idleFound: number;
  errorMessage?: string;
  timeWindowDays: 7 | 14 | 30;
  triggeredBy: string;
}

export interface MetricDataPoint {
  timestamp: string;
  value: number;
}

export interface InstanceMetrics {
  instanceId: string;
  instanceName: string;
  region: Region;
  timeWindow: '7d' | '14d' | '30d';
  cpu: MetricDataPoint[];
  networkIn: MetricDataPoint[];
  networkOut: MetricDataPoint[];
  diskRead: MetricDataPoint[];
  diskWrite: MetricDataPoint[];
}

export interface CostBreakdown {
  id: string;
  accountId: string;
  accountName: string;
  region: Region;
  instanceCount: number;
  idleInstanceCount: number;
  totalMonthlyCost: number;
  idleMonthlyCost: number;
  potentialSavings: number;
  savingsPercentage: number;
}

export interface MonthlyCostTrend {
  month: string;
  totalCost: number;
  idleCost: number;
  savedCost: number;
}

export interface Recommendation {
  id: string;
  instanceId: string;
  instanceName: string;
  accountName: string;
  region: Region;
  instanceType: string;
  type: RecommendationType;
  priority: Priority;
  confidence: number; // 0-100
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  reasoning: string;
  suggestedAction: string;
  targetInstanceType?: string; // for rightsize
  status: 'pending' | 'approved' | 'dismissed' | 'executed';
  createdAt: string;
}

export interface KpiMetrics {
  totalInstances: number;
  idleInstances: number;
  activeScans: number;
  potentialMonthlySavings: number;
  totalMonthlyWaste: number;
  accountsMonitored: number;
  regionsScanned: number;
  lastScanTime: string;
}
