import { ScanJob, Region } from '@/types';

export const mockScans: ScanJob[] = [
  {
    id: '1', jobId: 'scan-a1b2c3d4', accountId: '123456789012', accountName: 'Prod-Core',
    regions: ['us-east-1','us-east-2','eu-west-1'] as Region[],
    status: 'running', progress: 67, startTime: new Date(Date.now() - 18 * 60000).toISOString(),
    instancesScanned: 229, idleFound: 31, timeWindowDays: 14, triggeredBy: 'scheduler',
  },
  {
    id: '2', jobId: 'scan-e5f6g7h8', accountId: '234567890123', accountName: 'Staging-Platform',
    regions: ['us-west-2','ap-southeast-1'] as Region[],
    status: 'completed', progress: 100, startTime: new Date(Date.now() - 2 * 3600000).toISOString(),
    endTime: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    instancesScanned: 128, idleFound: 62, timeWindowDays: 7, triggeredBy: 'admin@company.com',
  },
  {
    id: '3', jobId: 'scan-i9j0k1l2', accountId: '345678901234', accountName: 'Dev-Team-Alpha',
    regions: ['eu-central-1'] as Region[],
    status: 'completed', progress: 100, startTime: new Date(Date.now() - 6 * 3600000).toISOString(),
    endTime: new Date(Date.now() - 5.6 * 3600000).toISOString(),
    instancesScanned: 89, idleFound: 51, timeWindowDays: 30, triggeredBy: 'api-key:svc-scanner',
  },
  {
    id: '4', jobId: 'scan-m3n4o5p6', accountId: '456789012345', accountName: 'Analytics-Cluster',
    regions: ['us-east-1','us-west-2'] as Region[],
    status: 'failed', progress: 34, startTime: new Date(Date.now() - 4 * 3600000).toISOString(),
    endTime: new Date(Date.now() - 3.8 * 3600000).toISOString(),
    instancesScanned: 53, idleFound: 0, timeWindowDays: 14, triggeredBy: 'scheduler',
    errorMessage: 'IAM permission denied: ec2:DescribeInstanceStatus in ap-northeast-1',
  },
  {
    id: '5', jobId: 'scan-q7r8s9t0', accountId: '567890123456', accountName: 'ML-Training',
    regions: ['us-east-1','eu-west-1','ap-northeast-1'] as Region[],
    status: 'queued', progress: 0, startTime: new Date(Date.now() + 2 * 60000).toISOString(),
    instancesScanned: 0, idleFound: 0, timeWindowDays: 7, triggeredBy: 'admin@company.com',
  },
  {
    id: '6', jobId: 'scan-u1v2w3x4', accountId: '123456789012', accountName: 'Prod-Core',
    regions: ['us-east-1','us-east-2','eu-west-1','ap-southeast-1'] as Region[],
    status: 'completed', progress: 100, startTime: new Date(Date.now() - 26 * 3600000).toISOString(),
    endTime: new Date(Date.now() - 25 * 3600000).toISOString(),
    instancesScanned: 342, idleFound: 47, timeWindowDays: 14, triggeredBy: 'scheduler',
  },
];
