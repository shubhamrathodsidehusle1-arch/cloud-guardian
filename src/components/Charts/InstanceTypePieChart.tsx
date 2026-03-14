import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockInstances } from '@/data/mockInstances';

const COLORS = [
  'hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(158 60% 35%)', 'hsl(188 60% 35%)',
  'hsl(var(--muted-foreground))', '#4ade80', '#22d3ee', '#a3e635', '#f59e0b',
];

export function InstanceTypePieChart() {
  const typeMap: Record<string, number> = {};
  mockInstances.filter(i => i.idleScore > 65).forEach(inst => {
    const family = inst.instanceType.split('.')[0];
    typeMap[family] = (typeMap[family] || 0) + 1;
  });

  const data = Object.entries(typeMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">Idle by Instance Family</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: 12 }}
            formatter={(value: number) => [value, 'Idle instances']}
          />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: 'hsl(var(--muted-foreground))' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
