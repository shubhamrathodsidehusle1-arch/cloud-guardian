import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UtilizationChart } from '@/components/Charts/UtilizationChart';
import { mockMetricsData, instanceOptions } from '@/data/mockMetrics';
import { Badge } from '@/components/ui/badge';
import { InstanceMetrics } from '@/types';

export default function Metrics() {
  const [selectedId, setSelectedId] = useState(instanceOptions[0].id);
  const [timeWindow, setTimeWindow] = useState<'7d' | '14d' | '30d'>('14d');

  const metrics = mockMetricsData.find(m => m.instanceId === selectedId) ?? mockMetricsData[0];
  const isIdle = metrics.cpu.slice(-48).reduce((s, p) => s + p.value, 0) / 48 < 5;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Metrics & Time-Series</h2>
          <p className="text-sm text-muted-foreground mt-0.5">CloudWatch telemetry for selected EC2 instance</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="h-8 w-56 text-xs bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              {instanceOptions.map(o => (
                <SelectItem key={o.id} value={o.id}>
                  <span className="text-xs">{o.name}</span>
                  <span className="ml-2 text-[10px] text-muted-foreground">{o.region}</span>
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

      {/* Instance header */}
      <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{metrics.instanceName}</span>
            <Badge variant="outline" className={`text-[10px] ${isIdle ? 'text-destructive border-destructive/30 bg-destructive/10' : 'text-primary border-primary/30 bg-primary/10'}`}>
              {isIdle ? 'IDLE' : 'ACTIVE'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">{metrics.instanceId} · {metrics.region}</p>
        </div>
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { label: 'Avg CPU', value: `${(metrics.cpu.slice(-48).reduce((s, p) => s + p.value, 0) / 48).toFixed(1)}%` },
            { label: 'Avg Net In', value: `${(metrics.networkIn.slice(-48).reduce((s, p) => s + p.value, 0) / 48).toFixed(0)} KB/s` },
            { label: 'Avg Disk R', value: `${(metrics.diskRead.slice(-48).reduce((s, p) => s + p.value, 0) / 48).toFixed(0)} KB/s` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-mono font-semibold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UtilizationChart
          metrics={metrics} metric="cpu"
          color="hsl(var(--primary))" label="CPU Utilization" unit="%"
          threshold={5}
        />
        <UtilizationChart
          metrics={metrics} metric="networkIn"
          color="hsl(var(--accent))" label="Network In" unit=" KB/s"
        />
        <UtilizationChart
          metrics={metrics} metric="networkOut"
          color="hsl(188 60% 40%)" label="Network Out" unit=" KB/s"
        />
        <UtilizationChart
          metrics={metrics} metric="diskRead"
          color="hsl(38 80% 50%)" label="Disk Read" unit=" KB/s"
        />
        <UtilizationChart
          metrics={metrics} metric="diskWrite"
          color="hsl(38 60% 40%)" label="Disk Write" unit=" KB/s"
        />
      </div>

      {isIdle && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-start gap-3">
          <span className="text-destructive font-mono text-sm mt-0.5">!</span>
          <div>
            <p className="text-sm font-semibold text-destructive">Idle Instance Detected</p>
            <p className="text-xs text-muted-foreground mt-0.5">This instance shows consistently low CPU (&lt;5%) and minimal network activity. It has been flagged for review in the Recommendations engine.</p>
          </div>
        </div>
      )}
    </div>
  );
}
