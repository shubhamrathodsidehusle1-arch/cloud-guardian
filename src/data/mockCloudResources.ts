import { CloudResource, AWSServiceName, ResourceState } from '@/types/cloud-resource';
import { Region } from '@/types';

const regions: Region[] = ['us-east-1', 'us-east-2', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1'];
const accounts = [
  { id: '123456789012', name: 'Prod-Core' },
  { id: '234567890123', name: 'Staging-Platform' },
  { id: '345678901234', name: 'Dev-Team-Alpha' },
  { id: '456789012345', name: 'Analytics-Cluster' },
  { id: '567890123456', name: 'ML-Training' },
];

function rnd(min: number, max: number, decimals = 0) {
  const v = Math.random() * (max - min) + min;
  return decimals ? parseFloat(v.toFixed(decimals)) : Math.floor(v);
}
function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }
function randomDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - rnd(0, daysAgo));
  return d.toISOString();
}

// ─── EC2 Instances (40) ──────────────────────────────────────────────────────
const ec2Types = ['t3.micro', 't3.small', 't3.medium', 't3.large', 'm5.large', 'm5.xlarge', 'm5.2xlarge', 'c5.large', 'c5.xlarge', 'r5.large', 'r5.2xlarge', 'g4dn.xlarge'];
const ec2Names = ['web-server', 'api-gateway', 'batch-worker', 'ml-trainer', 'cache-node', 'log-aggregator', 'build-agent', 'etl-pipeline', 'monitoring-agent', 'nat-instance'];
const ec2CostMap: Record<string, number> = {
  't3.micro': 8, 't3.small': 17, 't3.medium': 33, 't3.large': 67,
  'm5.large': 96, 'm5.xlarge': 192, 'm5.2xlarge': 384,
  'c5.large': 87, 'c5.xlarge': 174, 'r5.large': 126, 'r5.2xlarge': 504, 'g4dn.xlarge': 528,
};

const ec2Resources: CloudResource[] = Array.from({ length: 40 }, (_, i) => {
  const account = pick(accounts, i);
  const idleScore = rnd(20, 100);
  const type = pick(ec2Types, i);
  const cost = ec2CostMap[type] || 50;
  const state: ResourceState = idleScore > 65 ? 'idle' : 'active';
  return {
    id: `cr-ec2-${String(i + 1).padStart(4, '0')}`,
    resourceId: `i-${Math.random().toString(16).slice(2, 12)}`,
    resourceType: 'ec2:instance',
    serviceName: 'ec2',
    displayName: `${pick(ec2Names, i)}-${String(i + 1).padStart(3, '0')}`,
    accountId: account.id,
    accountName: account.name,
    region: pick(regions, i),
    state,
    idleScore,
    monthlyCost: cost,
    potentialSavings: state === 'idle' ? cost * 0.9 : 0,
    metadata: {
      instanceType: type,
      cpuAvg: state === 'idle' ? rnd(0, 8, 1) : rnd(15, 85, 1),
      os: i % 4 === 0 ? 'Windows' : 'Linux',
      launchTime: randomDate(180),
    },
    tags: { Environment: account.name.includes('Prod') ? 'production' : 'staging', Team: `team-${String.fromCharCode(65 + (i % 5))}` },
    lastScannedAt: randomDate(1),
    flagged: false,
    ignored: false,
  };
});

// ─── RDS Instances (20) ──────────────────────────────────────────────────────
const rdsEngines = ['mysql', 'postgres', 'aurora-mysql', 'aurora-postgresql', 'sqlserver-se'];
const rdsClasses = ['db.t3.micro', 'db.t3.small', 'db.t3.medium', 'db.m5.large', 'db.r5.large', 'db.r5.2xlarge'];
const rdsCost: Record<string, number> = { 'db.t3.micro': 15, 'db.t3.small': 28, 'db.t3.medium': 55, 'db.m5.large': 145, 'db.r5.large': 220, 'db.r5.2xlarge': 880 };
const rdsNames = ['app-db', 'analytics-db', 'auth-db', 'reporting-db', 'staging-db', 'dev-db', 'legacy-db'];

const rdsResources: CloudResource[] = Array.from({ length: 20 }, (_, i) => {
  const account = pick(accounts, i + 1);
  const idleScore = rnd(15, 95);
  const cls = pick(rdsClasses, i);
  const cost = rdsCost[cls] || 100;
  const state: ResourceState = idleScore > 70 ? 'idle' : 'active';
  return {
    id: `cr-rds-${String(i + 1).padStart(4, '0')}`,
    resourceId: `${pick(rdsNames, i)}-${String(i + 1).padStart(3, '0')}`,
    resourceType: i % 3 === 0 ? 'rds:cluster' : 'rds:instance',
    serviceName: 'rds',
    displayName: `${pick(rdsNames, i)}-${String(i + 1).padStart(3, '0')}`,
    accountId: account.id,
    accountName: account.name,
    region: pick(regions, i + 2),
    state,
    idleScore,
    monthlyCost: cost,
    potentialSavings: state === 'idle' ? cost * 0.85 : 0,
    metadata: {
      engine: pick(rdsEngines, i),
      instanceClass: cls,
      connections: state === 'idle' ? rnd(0, 3) : rnd(10, 200),
      storageGB: rnd(20, 2000),
      multiAZ: i % 2 === 0,
    },
    tags: { Environment: account.name.includes('Prod') ? 'production' : 'staging' },
    lastScannedAt: randomDate(2),
    flagged: false,
    ignored: false,
  };
});

// ─── S3 Buckets (20) ─────────────────────────────────────────────────────────
const s3Names = ['data-lake', 'backup', 'logs', 'assets', 'ml-models', 'artifacts', 'archives', 'reports', 'terraform-state', 'audit-trail'];

const s3Resources: CloudResource[] = Array.from({ length: 20 }, (_, i) => {
  const account = pick(accounts, i + 2);
  const idleScore = rnd(10, 98);
  const sizeGB = rnd(1, 50000);
  const cost = parseFloat((sizeGB * 0.023).toFixed(2));
  const state: ResourceState = idleScore > 80 ? 'idle' : 'active';
  return {
    id: `cr-s3-${String(i + 1).padStart(4, '0')}`,
    resourceId: `arn:aws:s3:::${account.name.toLowerCase()}-${pick(s3Names, i)}-${String(i + 1).padStart(3, '0')}`,
    resourceType: 's3:bucket',
    serviceName: 's3',
    displayName: `${account.name.toLowerCase()}-${pick(s3Names, i)}-${String(i + 1).padStart(3, '0')}`,
    accountId: account.id,
    accountName: account.name,
    region: pick(regions, i + 1),
    state,
    idleScore,
    monthlyCost: cost,
    potentialSavings: state === 'idle' ? cost * 0.7 : 0,
    metadata: {
      sizeGB,
      objectCount: rnd(100, 10000000),
      storageClass: state === 'idle' ? 'STANDARD' : pick(['STANDARD', 'INTELLIGENT_TIERING', 'STANDARD_IA'], i),
      lastAccessedDaysAgo: state === 'idle' ? rnd(90, 365) : rnd(0, 14),
      versioning: i % 2 === 0,
    },
    tags: { Team: `team-${String.fromCharCode(65 + (i % 5))}` },
    lastScannedAt: randomDate(1),
    flagged: false,
    ignored: false,
  };
});

// ─── Lambda Functions (20) ───────────────────────────────────────────────────
const lambdaRuntimes = ['nodejs18.x', 'python3.11', 'python3.10', 'java17', 'go1.x', 'dotnet6'];
const lambdaNames = ['data-processor', 'event-handler', 'api-authorizer', 'notification-sender', 'image-resizer', 'report-generator', 'webhook-consumer', 'cleanup-job'];

const lambdaResources: CloudResource[] = Array.from({ length: 20 }, (_, i) => {
  const account = pick(accounts, i + 3);
  const idleScore = rnd(20, 99);
  const cost = parseFloat((rnd(0, 50, 2)).toFixed(2));
  const state: ResourceState = idleScore > 75 ? 'idle' : 'active';
  return {
    id: `cr-lambda-${String(i + 1).padStart(4, '0')}`,
    resourceId: `arn:aws:lambda:${pick(regions, i)}:${account.id}:function:${pick(lambdaNames, i)}-${String(i + 1).padStart(3, '0')}`,
    resourceType: 'lambda:function',
    serviceName: 'lambda',
    displayName: `${pick(lambdaNames, i)}-${String(i + 1).padStart(3, '0')}`,
    accountId: account.id,
    accountName: account.name,
    region: pick(regions, i),
    state,
    idleScore,
    monthlyCost: cost,
    potentialSavings: state === 'idle' ? cost * 0.95 : 0,
    metadata: {
      runtime: pick(lambdaRuntimes, i),
      memorySizeMB: pick([128, 256, 512, 1024, 2048], i),
      invocationsLast30d: state === 'idle' ? rnd(0, 5) : rnd(1000, 10000000),
      lastInvokedDaysAgo: state === 'idle' ? rnd(30, 180) : rnd(0, 2),
      avgDurationMs: rnd(10, 5000),
    },
    tags: { Team: `team-${String.fromCharCode(65 + (i % 5))}`, Service: pick(lambdaNames, i) },
    lastScannedAt: randomDate(1),
    flagged: false,
    ignored: false,
  };
});

// ─── DynamoDB Tables (10) ────────────────────────────────────────────────────
const dynamoNames = ['user-sessions', 'product-catalog', 'order-events', 'feature-flags', 'audit-log', 'cache-table', 'config-store', 'analytics-events'];

const dynamoResources: CloudResource[] = Array.from({ length: 10 }, (_, i) => {
  const account = pick(accounts, i + 4);
  const idleScore = rnd(10, 90);
  const cost = parseFloat((rnd(5, 800, 2)).toFixed(2));
  const state: ResourceState = idleScore > 70 ? 'idle' : 'active';
  return {
    id: `cr-dynamo-${String(i + 1).padStart(4, '0')}`,
    resourceId: `arn:aws:dynamodb:${pick(regions, i)}:${account.id}:table/${pick(dynamoNames, i)}`,
    resourceType: 'dynamodb:table',
    serviceName: 'dynamodb',
    displayName: pick(dynamoNames, i),
    accountId: account.id,
    accountName: account.name,
    region: pick(regions, i + 3),
    state,
    idleScore,
    monthlyCost: cost,
    potentialSavings: state === 'idle' ? cost * 0.6 : 0,
    metadata: {
      billingMode: i % 2 === 0 ? 'PROVISIONED' : 'PAY_PER_REQUEST',
      readCapacityUnits: i % 2 === 0 ? rnd(1, 1000) : null,
      writeCapacityUnits: i % 2 === 0 ? rnd(1, 500) : null,
      itemCount: rnd(0, 10000000),
      tableSizeGB: rnd(0, 500, 2),
    },
    tags: { Environment: account.name.includes('Prod') ? 'production' : 'staging' },
    lastScannedAt: randomDate(2),
    flagged: false,
    ignored: false,
  };
});

// ─── EKS Node Groups (10) ────────────────────────────────────────────────────
const eksNames = ['prod-cluster', 'staging-cluster', 'ml-cluster', 'analytics-cluster'];
const eksNodeGroups = ['general-workers', 'spot-workers', 'gpu-workers', 'memory-workers', 'compute-workers'];

const eksResources: CloudResource[] = Array.from({ length: 10 }, (_, i) => {
  const account = pick(accounts, i);
  const idleScore = rnd(15, 85);
  const nodes = rnd(2, 20);
  const cost = nodes * 150;
  const state: ResourceState = idleScore > 65 ? 'idle' : 'active';
  return {
    id: `cr-eks-${String(i + 1).padStart(4, '0')}`,
    resourceId: `arn:aws:eks:${pick(regions, i)}:${account.id}:cluster/${pick(eksNames, i)}/nodegroup/${pick(eksNodeGroups, i)}`,
    resourceType: 'eks:nodegroup',
    serviceName: 'eks',
    displayName: `${pick(eksNames, i)}/${pick(eksNodeGroups, i)}`,
    accountId: account.id,
    accountName: account.name,
    region: pick(regions, i),
    state,
    idleScore,
    monthlyCost: cost,
    potentialSavings: state === 'idle' ? cost * 0.5 : 0,
    metadata: {
      clusterName: pick(eksNames, i),
      nodegroupName: pick(eksNodeGroups, i),
      desiredNodes: nodes,
      instanceType: pick(['t3.large', 'm5.xlarge', 'c5.2xlarge', 'g4dn.xlarge'], i),
      cpuAvg: state === 'idle' ? rnd(2, 12, 1) : rnd(20, 75, 1),
      memoryAvg: state === 'idle' ? rnd(5, 20, 1) : rnd(25, 80, 1),
    },
    tags: { Cluster: pick(eksNames, i), Environment: account.name.includes('Prod') ? 'production' : 'staging' },
    lastScannedAt: randomDate(3),
    flagged: false,
    ignored: false,
  };
});

// ─── Combined export ─────────────────────────────────────────────────────────
export const mockCloudResources: CloudResource[] = [
  ...ec2Resources,
  ...rdsResources,
  ...s3Resources,
  ...lambdaResources,
  ...dynamoResources,
  ...eksResources,
];

export const flaggedResources = mockCloudResources.filter(r => r.idleScore > 65);
export const totalResourceCost = mockCloudResources.reduce((s, r) => s + r.monthlyCost, 0);
export const totalResourceSavings = mockCloudResources.reduce((s, r) => s + r.potentialSavings, 0);

export const resourcesByService = mockCloudResources.reduce((acc, r) => {
  acc[r.serviceName] = (acc[r.serviceName] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
