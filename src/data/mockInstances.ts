import { EC2Instance, Region } from '@/types';

const regions: Region[] = ['us-east-1','us-east-2','us-west-2','eu-west-1','eu-central-1','ap-southeast-1','ap-northeast-1'];
const types = ['t3.micro','t3.small','t3.medium','t3.large','m5.large','m5.xlarge','m5.2xlarge','c5.large','c5.xlarge','r5.large','r5.2xlarge','g4dn.xlarge'];
const accounts = [
  { id: '123456789012', name: 'Prod-Core' },
  { id: '234567890123', name: 'Staging-Platform' },
  { id: '345678901234', name: 'Dev-Team-Alpha' },
  { id: '456789012345', name: 'Analytics-Cluster' },
  { id: '567890123456', name: 'ML-Training' },
];
const names = ['web-server','api-gateway','data-processor','batch-worker','ml-trainer','cache-node','log-aggregator','build-agent','test-runner','analytics-job','etl-pipeline','cron-worker','bastion-host','nat-instance','monitoring-agent'];

function rnd(min: number, max: number, decimals = 0) {
  const v = Math.random() * (max - min) + min;
  return decimals ? parseFloat(v.toFixed(decimals)) : Math.floor(v);
}

function randomDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - rnd(0, daysAgo));
  return d.toISOString();
}

export const mockInstances: EC2Instance[] = Array.from({ length: 120 }, (_, i) => {
  const account = accounts[i % accounts.length];
  const idleScore = rnd(20, 100);
  const isIdle = idleScore > 65;
  const cpuAvg = isIdle ? rnd(0, 8, 1) : rnd(15, 85, 1);
  const type = types[i % types.length];
  const costMap: Record<string, number> = {
    't3.micro': 8, 't3.small': 17, 't3.medium': 33, 't3.large': 67,
    'm5.large': 96, 'm5.xlarge': 192, 'm5.2xlarge': 384,
    'c5.large': 87, 'c5.xlarge': 174,
    'r5.large': 126, 'r5.2xlarge': 504,
    'g4dn.xlarge': 528,
  };
  const monthlyCost = costMap[type] || 50;

  return {
    id: `i-${String(i + 1).padStart(4, '0')}`,
    instanceId: `i-${Math.random().toString(16).slice(2, 12)}`,
    accountId: account.id,
    accountName: account.name,
    region: regions[i % regions.length],
    instanceType: type,
    name: `${names[i % names.length]}-${String(i + 1).padStart(3, '0')}`,
    status: isIdle ? 'idle' : 'active',
    idleScore,
    cpuAvg,
    cpuMax: cpuAvg + rnd(2, 15, 1),
    networkInAvg: rnd(0, isIdle ? 50 : 2000, 1),
    networkOutAvg: rnd(0, isIdle ? 30 : 1500, 1),
    diskReadAvg: rnd(0, isIdle ? 10 : 500, 1),
    diskWriteAvg: rnd(0, isIdle ? 5 : 300, 1),
    launchTime: randomDate(180),
    lastActiveTime: randomDate(isIdle ? 30 : 2),
    monthlyCost,
    potentialSavings: isIdle ? monthlyCost * 0.9 : 0,
    tags: { Environment: account.name.includes('Prod') ? 'production' : 'staging', Team: `team-${String.fromCharCode(65 + (i % 5))}` },
    os: i % 4 === 0 ? 'Windows' : 'Linux',
    state: i % 20 === 0 ? 'stopped' : 'running',
    flagged: false,
    ignored: false,
  };
});

export const idleInstances = mockInstances.filter(inst => inst.idleScore > 65);
