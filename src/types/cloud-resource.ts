import { Region, ScanStatus, RecommendationType, Priority, MetricDataPoint } from './index';

export type AWSServiceName = 'ec2' | 'rds' | 's3' | 'lambda' | 'dynamodb' | 'eks' | 'iam' | 'elasticache';

export type ResourceState = 'active' | 'idle' | 'stopped' | 'terminated' | 'unknown';

export type ServiceCapability =
  | 'discover_resources'
  | 'scan_resources'
  | 'collect_metrics'
  | 'generate_recommendations'
  | 'perform_actions';

export type ScanStage = 'discovery' | 'metrics_ingestion' | 'analysis' | 'recommendations' | 'complete';

// ─── Universal Resource Abstraction ─────────────────────────────────────────

export interface CloudResource {
  id: string;
  resourceId: string;           // AWS resource ARN or native ID
  resourceType: string;         // 'ec2:instance' | 'rds:cluster' | 's3:bucket' | 'lambda:function' etc.
  serviceName: AWSServiceName;
  displayName: string;
  accountId: string;
  accountName: string;
  region: Region;
  state: ResourceState;
  idleScore: number;            // 0–100 normalised across ALL services
  monthlyCost: number;
  potentialSavings: number;
  metadata: Record<string, unknown>; // service-specific payload
  tags: Record<string, string>;
  lastScannedAt: string;
  flagged: boolean;
  ignored: boolean;
}

// ─── Service Plugin Definition ───────────────────────────────────────────────

export interface ServicePlugin {
  id: string;
  serviceName: AWSServiceName;
  displayName: string;
  description: string;
  icon: string;                 // lucide icon name
  enabled: boolean;
  capabilities: ServiceCapability[];
  resourceTypes: string[];      // e.g. ['ec2:instance', 'ec2:spot']
  accountIds: string[];
  lastScanAt?: string;
  resourceCount: number;
  flaggedCount: number;
  version: string;
  config: Record<string, unknown>;
  color: string;                // hsl token name for visual differentiation
}

// ─── Generic Resource Metric ─────────────────────────────────────────────────

export interface MetricDefinition {
  key: string;
  label: string;
  unit: string;
  color: string;               // hsl(var(--xxx))
}

export interface ResourceMetric {
  resourceId: string;
  resourceName: string;
  serviceName: AWSServiceName;
  region: Region;
  timeWindow: '7d' | '14d' | '30d';
  metrics: Record<string, MetricDataPoint[]>; // key = metric_name
  availableMetrics: MetricDefinition[];
}

// ─── Generic Scan Job ────────────────────────────────────────────────────────

export interface GenericScanJob {
  id: string;
  jobId: string;
  accountId: string;
  accountName: string;
  regions: Region[];
  serviceTypes: AWSServiceName[];
  status: ScanStatus;
  progress: number;
  stage: ScanStage;
  startTime: string;
  endTime?: string;
  resourcesScanned: number;
  flaggedFound: number;
  errorMessage?: string;
  timeWindowDays: 7 | 14 | 30;
  triggeredBy: string;
}

// ─── Generic Recommendation ──────────────────────────────────────────────────

export interface GenericRecommendation {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  serviceName: AWSServiceName;
  accountName: string;
  region: Region;
  metadata: Record<string, string>; // service-specific context (e.g. instanceType, bucketSize)
  type: RecommendationType;
  priority: Priority;
  confidence: number;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  reasoning: string;
  suggestedAction: string;
  status: 'pending' | 'approved' | 'dismissed' | 'executed';
  createdAt: string;
}

// ─── AWS Account (extended with credential model) ────────────────────────────

export interface ManagedAWSAccount {
  id: string;
  accountId: string;
  name: string;
  environment: 'production' | 'staging' | 'development';
  roleArn: string;
  externalId: string;
  regions: Region[];
  enabled: boolean;
  connectionStatus: 'connected' | 'error' | 'pending' | 'unconfigured';
  lastValidatedAt?: string;
  totalResources: number;
  flaggedResources: number;
  monthlyCost: number;
  wasteCost: number;
}
