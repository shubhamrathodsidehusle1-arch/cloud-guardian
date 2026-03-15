import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { mockCloudResources } from '@/data/mockCloudResources';

const REGION_LABELS: Record<string, string> = {
  'us-east-1': 'US-E1', 'us-east-2': 'US-E2', 'us-west-1': 'US-W1', 'us-west-2': 'US-W2',
  'eu-west-1': 'EU-W1', 'eu-west-2': 'EU-W2', 'eu-central-1': 'EU-C1',
  'ap-southeast-1': 'AP-SE1', 'ap-southeast-2': 'AP-SE2', 'ap-northeast-1': 'AP-NE1',
  'sa-east-1': 'SA-E1', 'ca-central-1': 'CA-C1',
};

export function RegionBarChart() {
  const regionMap: Record<string, { total: number; flagged: number }> = {};
  mockCloudResources.forEach(r => {
    if (!regionMap[r.region]) regionMap[r.region] = { total: 0, flagged: 0 };
    regionMap[r.region].total++;
    if (r.idleScore > 65) regionMap[r.region].flagged++;
  });

  const data = Object.entries(regionMap)
    .map(([region, counts]) => ({ region: REGION_LABELS[region] || region, ...counts }))
    .sort((a, b) => b.flagged - a.flagged);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">Flagged Resources by Region</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="region" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: 12 }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
          />
          <Bar dataKey="total" name="Total" fill="hsl(var(--secondary))" radius={[2, 2, 0, 0]} />
          <Bar dataKey="flagged" name="Flagged" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="h-2 w-2 rounded-sm bg-secondary inline-block" />Total
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="h-2 w-2 rounded-sm bg-primary inline-block" />Flagged
        </div>
      </div>
    </div>
  );
}
