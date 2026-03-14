import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface UtilizationSparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function UtilizationSparkline({ data, color = 'hsl(var(--primary))', height = 30 }: UtilizationSparklineProps) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width={80} height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Generate sparkline data from avg cpu (simple synthetic)
export function generateSparkline(avg: number, points = 14): number[] {
  return Array.from({ length: points }, () => Math.max(0, avg + (Math.random() - 0.5) * avg * 0.8));
}
