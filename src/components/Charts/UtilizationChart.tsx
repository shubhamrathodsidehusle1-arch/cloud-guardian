import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { InstanceMetrics } from '@/types';
import { format, parseISO } from 'date-fns';

interface UtilizationChartProps {
  metrics: InstanceMetrics;
  metric: 'cpu' | 'networkIn' | 'networkOut' | 'diskRead' | 'diskWrite';
  color?: string;
  label?: string;
  unit?: string;
  threshold?: number;
}

export function UtilizationChart({ metrics, metric, color = 'hsl(var(--primary))', label, unit = '%', threshold }: UtilizationChartProps) {
  // Downsample to every 6h for performance
  const raw = metrics[metric];
  const data = raw.filter((_, i) => i % 6 === 0).map(p => ({
    ts: format(parseISO(p.timestamp), 'MMM d HH:mm'),
    value: p.value,
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {label && <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{label}</h3>}
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="ts"
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))', fontFamily: 'monospace' }}
            axisLine={false} tickLine={false}
            interval={Math.floor(data.length / 5)}
          />
          <YAxis
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false} tickLine={false}
            tickFormatter={(v) => `${v}${unit}`}
          />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: 11 }}
            formatter={(v: number) => [`${v.toFixed(2)}${unit}`, label]}
          />
          {threshold && (
            <ReferenceLine y={threshold} stroke="hsl(var(--destructive))" strokeDasharray="4 4" strokeWidth={1} />
          )}
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
