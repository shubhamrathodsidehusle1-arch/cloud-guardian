import { ResourceMetric, MetricDefinition, AWSServiceName } from '@/types/cloud-resource';
import { MetricDataPoint } from '@/types';
import { mockCloudResources } from './mockCloudResources';

function generateSeries(points: number, min: number, max: number, trend: 'flat' | 'spike' | 'declining' = 'flat'): MetricDataPoint[] {
  const now = Date.now();
  const intervalMs = (14 * 24 * 3600 * 1000) / points;
  let base = (min + max) / 2;
  return Array.from({ length: points }, (_, i) => {
    if (trend === 'spike' && i > points * 0.6 && i < points * 0.7) base = max * 0.9;
    else if (trend === 'declining') base = Math.max(min, base * 0.98);
    else base = min + Math.random() * (max - min) * 0.3 + (max - min) * 0.1;
    const value = parseFloat(Math.max(min, Math.min(max, base + (Math.random() - 0.5) * (max - min) * 0.2)).toFixed(2));
    return { timestamp: new Date(now - (points - i) * intervalMs).toISOString(), value };
  });
}

export const SERVICE_METRICS: Record<AWSServiceName, MetricDefinition[]> = {
  ec2: [
    { key: 'cpu', label: 'CPU Utilization', unit: '%', color: 'hsl(var(--primary))' },
    { key: 'networkIn', label: 'Network In', unit: ' KB/s', color: 'hsl(var(--accent))' },
    { key: 'networkOut', label: 'Network Out', unit: ' KB/s', color: 'hsl(188 60% 40%)' },
    { key: 'diskRead', label: 'Disk Read', unit: ' KB/s', color: 'hsl(38 80% 50%)' },
    { key: 'diskWrite', label: 'Disk Write', unit: ' KB/s', color: 'hsl(38 60% 40%)' },
  ],
  rds: [
    { key: 'connections', label: 'DB Connections', unit: '', color: 'hsl(var(--accent))' },
    { key: 'cpu', label: 'CPU Utilization', unit: '%', color: 'hsl(var(--primary))' },
    { key: 'readIOPS', label: 'Read IOPS', unit: '/s', color: 'hsl(188 60% 40%)' },
    { key: 'writeIOPS', label: 'Write IOPS', unit: '/s', color: 'hsl(38 80% 50%)' },
    { key: 'freeStorageGB', label: 'Free Storage', unit: ' GB', color: 'hsl(158 60% 35%)' },
  ],
  s3: [
    { key: 'requests', label: 'Requests', unit: '/day', color: 'hsl(38 92% 50%)' },
    { key: 'dataTransferGB', label: 'Data Transfer', unit: ' GB/day', color: 'hsl(var(--primary))' },
    { key: 'objectCount', label: 'Object Count', unit: '', color: 'hsl(var(--accent))' },
    { key: 'storageGB', label: 'Storage Used', unit: ' GB', color: 'hsl(158 60% 35%)' },
  ],
  lambda: [
    { key: 'invocations', label: 'Invocations', unit: '/day', color: 'hsl(270 60% 60%)' },
    { key: 'duration', label: 'Avg Duration', unit: ' ms', color: 'hsl(var(--accent))' },
    { key: 'errors', label: 'Errors', unit: '/day', color: 'hsl(var(--destructive))' },
    { key: 'throttles', label: 'Throttles', unit: '/day', color: 'hsl(38 92% 50%)' },
  ],
  dynamodb: [
    { key: 'readCapacity', label: 'Read Capacity', unit: ' CU/s', color: 'hsl(188 78% 50%)' },
    { key: 'writeCapacity', label: 'Write Capacity', unit: ' CU/s', color: 'hsl(var(--primary))' },
    { key: 'throttledRequests', label: 'Throttled Reqs', unit: '/min', color: 'hsl(var(--destructive))' },
    { key: 'latency', label: 'Latency', unit: ' ms', color: 'hsl(38 80% 50%)' },
  ],
  eks: [
    { key: 'cpu', label: 'Node CPU', unit: '%', color: 'hsl(var(--primary))' },
    { key: 'memory', label: 'Node Memory', unit: '%', color: 'hsl(var(--accent))' },
    { key: 'pods', label: 'Running Pods', unit: '', color: 'hsl(158 60% 35%)' },
    { key: 'networkIn', label: 'Network In', unit: ' MB/s', color: 'hsl(188 60% 40%)' },
  ],
  iam: [
    { key: 'apiCalls', label: 'API Calls', unit: '/day', color: 'hsl(38 92% 50%)' },
  ],
  elasticache: [
    { key: 'hitRate', label: 'Cache Hit Rate', unit: '%', color: 'hsl(var(--primary))' },
    { key: 'connections', label: 'Connections', unit: '', color: 'hsl(var(--accent))' },
    { key: 'memoryUsage', label: 'Memory Usage', unit: '%', color: 'hsl(38 80% 50%)' },
  ],
};

function buildMetricsForResource(r: typeof mockCloudResources[0]): ResourceMetric {
  const defs = SERVICE_METRICS[r.serviceName] || [];
  const isIdle = r.idleScore > 65;
  const metricsMap: Record<string, MetricDataPoint[]> = {};

  defs.forEach(def => {
    switch (def.key) {
      case 'cpu': metricsMap[def.key] = generateSeries(96, isIdle ? 0 : 15, isIdle ? 8 : 75, isIdle ? 'flat' : 'spike'); break;
      case 'networkIn': case 'networkOut': metricsMap[def.key] = generateSeries(96, isIdle ? 0 : 100, isIdle ? 50 : 2000); break;
      case 'diskRead': case 'diskWrite': metricsMap[def.key] = generateSeries(96, 0, isIdle ? 10 : 500); break;
      case 'connections': metricsMap[def.key] = generateSeries(96, isIdle ? 0 : 5, isIdle ? 3 : 200); break;
      case 'readIOPS': case 'writeIOPS': metricsMap[def.key] = generateSeries(96, isIdle ? 0 : 50, isIdle ? 20 : 5000); break;
      case 'requests': metricsMap[def.key] = generateSeries(96, isIdle ? 0 : 1000, isIdle ? 10 : 1000000); break;
      case 'invocations': metricsMap[def.key] = generateSeries(96, isIdle ? 0 : 100, isIdle ? 5 : 100000, isIdle ? 'declining' : 'spike'); break;
      case 'duration': metricsMap[def.key] = generateSeries(96, 10, 5000); break;
      case 'errors': metricsMap[def.key] = generateSeries(96, 0, isIdle ? 5 : 100); break;
      case 'memory': metricsMap[def.key] = generateSeries(96, isIdle ? 5 : 25, isIdle ? 20 : 80); break;
      default: metricsMap[def.key] = generateSeries(96, 0, 100);
    }
  });

  return {
    resourceId: r.id,
    resourceName: r.displayName,
    serviceName: r.serviceName,
    region: r.region,
    timeWindow: '14d',
    metrics: metricsMap,
    availableMetrics: defs,
  };
}

export const mockResourceMetrics: ResourceMetric[] = mockCloudResources.slice(0, 30).map(buildMetricsForResource);

export const resourceOptions = mockCloudResources.slice(0, 30).map(r => ({
  id: r.id,
  name: r.displayName,
  region: r.region,
  serviceName: r.serviceName,
  resourceType: r.resourceType,
}));
