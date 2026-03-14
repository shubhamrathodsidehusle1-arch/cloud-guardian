import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockCostTrend } from '@/data/mockCosts';

function formatUSD(v: number) {
  return `$${(v / 1000).toFixed(0)}k`;
}

export function CostTrendChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Cost Trend</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={mockCostTrend} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="idleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatUSD} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: 12 }}
            formatter={(v: number) => [`$${v.toLocaleString()}`, '']}
          />
          <Area type="monotone" dataKey="totalCost" name="Total Cost" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} fill="url(#totalGrad)" />
          <Area type="monotone" dataKey="idleCost" name="Idle Waste" stroke="hsl(var(--destructive))" strokeWidth={2} fill="url(#idleGrad)" />
          <Area type="monotone" dataKey="savedCost" name="Savings" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#savedGrad)" />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: 'hsl(var(--muted-foreground))' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
