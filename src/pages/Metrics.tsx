import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UtilizationChart } from '@/components/Charts/UtilizationChart';
import { mockResourceMetrics, resourceOptions, SERVICE_METRICS } from '@/data/mockResourceMetrics';
import { Badge } from '@/components/ui/badge';
import { InstanceMetrics } from '@/types';
import { AWSServiceName } from '@/types/cloud-resource';

const SERVICE_LABEL: Record<AWSServiceName, string> = {
  ec2: 'EC2', rds: 'RDS', s3: 'S3', lambda: 'Lambda', dynamodb: 'DynamoDB', eks: 'EKS', iam: 'IAM', elasticache: 'ElastiCache',
};

export default function Metrics() {
  const [selectedId, setSelectedId] = useState(resourceOptions[0].id);
  const [timeWindow, setTimeWindow] = useState<'7d' | '14d' | '30d'>('14d');

  const resourceMeta = resourceOptions.find(o => o.id === selectedId) ?? resourceOptions[0];
  const resourceMetric = mockResourceMetrics.find(m => m.resourceId === selectedId) ?? mockResourceMetrics[0];
  const availableMetrics = SERVICE_METRICS[resourceMetric.serviceName] ?? [];

  // Use first metric as primary "activity" indicator for idle detection
  const primaryMetricKey = availableMetrics[0]?.key;
  const primarySeries = primaryMetricKey ? (resourceMetric.metrics[primaryMetricKey] ?? []) : [];
  const recentAvg = primarySeries.length > 0
    ? primarySeries.slice(-48).reduce((s, p) => s + p.value, 0) / Math.min(primarySeries.length, 48)
    : 0;
  const isIdle = recentAvg < (resourceMetric.serviceName === 'ec2' ? 5 : recentAvg < 10 ? 10 : 0);

  // Build a backwards-compat InstanceMetrics shape for UtilizationChart
  const compatMetrics: InstanceMetrics = {
    instanceId: resourceMetric.resourceId,
    instanceName: resourceMetric.resourceName,
    region: resourceMetric.region,
    timeWindow,
    cpu: resourceMetric.metrics['cpu'] ?? [],
    networkIn: resourceMetric.metrics['networkIn'] ?? resourceMetric.metrics['requests'] ?? resourceMetric.metrics['invocations'] ?? [],
    networkOut: resourceMetric.metrics['networkOut'] ?? resourceMetric.metrics['dataTransferGB'] ?? [],
    diskRead: resourceMetric.metrics['diskRead'] ?? resourceMetric.metrics['readIOPS'] ?? resourceMetric.metrics['readCapacity'] ?? [],
    diskWrite: resourceMetric.metrics['diskWrite'] ?? resourceMetric.metrics['writeIOPS'] ?? resourceMetric.metrics['writeCapacity'] ?? [],
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Metrics & Time-Series</h2>
          <p className="text-sm text-muted-foreground mt-0.5">CloudWatch telemetry for any AWS resource</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="h-8 w-64 text-xs bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              {resourceOptions.map(o => (
                <SelectItem key={o.id} value={o.id}>
                  <span className="text-xs font-mono text-muted-foreground mr-2 uppercase">[{o.serviceName}]</span>
                  <span className="text-xs">{o.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeWindow} onValueChange={(v) => setTimeWindow(v as typeof timeWindow)}>
            <SelectTrigger className="h-8 w-24 text-xs bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="14d">14 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resource header */}
      <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono uppercase text-accent border-accent/30 bg-accent/5">
              {SERVICE_LABEL[resourceMetric.serviceName]}
            </Badge>
            <span className="text-sm font-semibold text-foreground">{resourceMetric.resourceName}</span>
            <Badge variant="outline" className={`text-[10px] ${isIdle ? 'text-destructive border-destructive/30 bg-destructive/10' : 'text-primary border-primary/30 bg-primary/10'}`}>
              {isIdle ? 'IDLE' : 'ACTIVE'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{resourceMeta.resourceType} · {resourceMetric.region}</p>
        </div>
        <div className="grid grid-cols-3 gap-6 text-center">
          {availableMetrics.slice(0, 3).map(def => {
            const series = resourceMetric.metrics[def.key] ?? [];
            const avg = series.length > 0 ? series.slice(-48).reduce((s, p) => s + p.value, 0) / Math.min(series.length, 48) : 0;
            return (
              <div key={def.key}>
                <p className="text-xs font-mono font-semibold text-foreground">{avg.toFixed(1)}{def.unit}</p>
                <p className="text-[10px] text-muted-foreground">Avg {def.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts grid — render per available metric */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableMetrics.map(def => {
          const seriesKey = def.key as keyof InstanceMetrics;
          return (
            <UtilizationChart
              key={def.key}
              metrics={compatMetrics}
              metric={seriesKey as 'cpu' | 'networkIn' | 'networkOut' | 'diskRead' | 'diskWrite'}
              color={def.color}
              label={def.label}
              unit={def.unit}
              threshold={def.key === 'cpu' ? 5 : undefined}
            />
          );
        })}
      </div>

      {isIdle && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-start gap-3">
          <span className="text-destructive font-mono text-sm mt-0.5">!</span>
          <div>
            <p className="text-sm font-semibold text-destructive">Idle Resource Detected</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This {SERVICE_LABEL[resourceMetric.serviceName]} resource shows consistently low activity metrics. It has been flagged for review in the Recommendations engine.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
