import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockCloudResources } from '@/data/mockCloudResources';
import { AWSServiceName } from '@/types/cloud-resource';

const SERVICE_COLORS: Record<AWSServiceName, string> = {
  ec2: 'hsl(var(--primary))',
  rds: 'hsl(var(--accent))',
  s3: 'hsl(38 92% 50%)',
  lambda: 'hsl(270 60% 60%)',
  dynamodb: 'hsl(188 78% 50%)',
  eks: 'hsl(158 64% 40%)',
  iam: 'hsl(38 60% 40%)',
  elasticache: 'hsl(var(--destructive))',
};

export function ResourceServicePieChart() {
  const serviceMap: Record<string, number> = {};
  mockCloudResources.filter(r => r.idleScore > 65).forEach(r => {
    serviceMap[r.serviceName] = (serviceMap[r.serviceName] || 0) + 1;
  });

  const data = Object.entries(serviceMap)
    .map(([name, value]) => ({ name: name.toUpperCase(), value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">Flagged by Service</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
            {data.map((entry, index) => {
              const svcName = entry.name.toLowerCase() as AWSServiceName;
              return (
                <Cell
                  key={index}
                  fill={SERVICE_COLORS[svcName] || 'hsl(var(--muted-foreground))'}
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                />
              );
            })}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: 12 }}
            formatter={(value: number) => [value, 'Flagged resources']}
          />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: 'hsl(var(--muted-foreground))' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Backward-compat alias
export { ResourceServicePieChart as InstanceTypePieChart };
