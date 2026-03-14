import { InstanceMetrics, MetricDataPoint } from '@/types';

function generateTimeSeries(days: number, baseValue: number, variance: number, trend = 0): MetricDataPoint[] {
  const points: MetricDataPoint[] = [];
  const now = new Date();
  const intervals = days * 24; // hourly points
  for (let i = intervals; i >= 0; i--) {
    const ts = new Date(now.getTime() - i * 3600 * 1000);
    const noise = (Math.random() - 0.5) * variance;
    const trendOffset = (trend * (intervals - i)) / intervals;
    const value = Math.max(0, baseValue + noise + trendOffset);
    points.push({ timestamp: ts.toISOString(), value: parseFloat(value.toFixed(2)) });
  }
  return points;
}

function generateIdleTimeSeries(days: number): MetricDataPoint[] {
  // Very low CPU with occasional spikes
  const points: MetricDataPoint[] = [];
  const now = new Date();
  const intervals = days * 24;
  for (let i = intervals; i >= 0; i--) {
    const ts = new Date(now.getTime() - i * 3600 * 1000);
    const spike = Math.random() < 0.03 ? Math.random() * 40 : 0;
    const base = Math.random() * 2;
    points.push({ timestamp: ts.toISOString(), value: parseFloat((base + spike).toFixed(2)) });
  }
  return points;
}

export const mockMetricsData: InstanceMetrics[] = [
  {
    instanceId: 'i-0001idle', instanceName: 'web-server-001', region: 'us-east-1', timeWindow: '14d',
    cpu: generateIdleTimeSeries(14),
    networkIn: generateTimeSeries(14, 12, 8),
    networkOut: generateTimeSeries(14, 8, 5),
    diskRead: generateTimeSeries(14, 3, 2),
    diskWrite: generateTimeSeries(14, 1, 1),
  },
  {
    instanceId: 'i-0002active', instanceName: 'api-gateway-002', region: 'us-east-1', timeWindow: '14d',
    cpu: generateTimeSeries(14, 52, 20, 5),
    networkIn: generateTimeSeries(14, 850, 300),
    networkOut: generateTimeSeries(14, 640, 250),
    diskRead: generateTimeSeries(14, 120, 60),
    diskWrite: generateTimeSeries(14, 90, 45),
  },
  {
    instanceId: 'i-0003batch', instanceName: 'batch-worker-003', region: 'eu-west-1', timeWindow: '14d',
    cpu: generateTimeSeries(14, 3, 3),
    networkIn: generateTimeSeries(14, 25, 15),
    networkOut: generateTimeSeries(14, 10, 8),
    diskRead: generateTimeSeries(14, 5, 4),
    diskWrite: generateTimeSeries(14, 2, 2),
  },
  {
    instanceId: 'i-0004ml', instanceName: 'ml-trainer-004', region: 'us-west-2', timeWindow: '14d',
    cpu: generateTimeSeries(14, 78, 15, -10),
    networkIn: generateTimeSeries(14, 1200, 500),
    networkOut: generateTimeSeries(14, 400, 200),
    diskRead: generateTimeSeries(14, 800, 300),
    diskWrite: generateTimeSeries(14, 600, 250),
  },
];

export const instanceOptions = mockMetricsData.map(m => ({ id: m.instanceId, name: m.instanceName, region: m.region }));
