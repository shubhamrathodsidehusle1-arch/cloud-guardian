import { CostTrendChart } from '@/components/Charts/CostTrendChart';
import { mockCostBreakdown, totalPotentialSavings, totalMonthlyCost } from '@/data/mockCosts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingDown, Zap, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function savingsColor(pct: number): string {
  if (pct >= 40) return 'text-destructive';
  if (pct >= 20) return 'text-amber-400';
  return 'text-primary';
}

export default function CostAnalysis() {
  const totalIdle = mockCostBreakdown.reduce((s, c) => s + c.idleMonthlyCost, 0);
  const byAccount = mockCostBreakdown.reduce((acc, c) => {
    acc[c.accountName] = (acc[c.accountName] || 0) + c.potentialSavings;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Cost Analysis</h2>
        <p className="text-sm text-muted-foreground mt-0.5">FinOps waste identification across all AWS accounts</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Monthly Spend', value: `$${totalMonthlyCost.toLocaleString()}`, icon: DollarSign, color: 'text-foreground' },
          { label: 'Idle Waste / Month', value: `$${totalIdle.toLocaleString()}`, icon: TrendingDown, color: 'text-destructive' },
          { label: 'Potential Savings', value: `$${totalPotentialSavings.toLocaleString()}`, icon: Zap, color: 'text-primary' },
          { label: 'Waste %', value: `${((totalIdle / totalMonthlyCost) * 100).toFixed(1)}%`, icon: BarChart2, color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3">
            <Icon className={`h-4 w-4 ${color}`} />
            <div>
              <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <CostTrendChart />
        </div>
        {/* Savings by account */}
        <div className="rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Savings by Account</h3>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(byAccount).sort((a, b) => b[1] - a[1]).map(([name, savings]) => (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground">{name}</span>
                  <span className="font-mono text-primary">${savings.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(savings / totalPotentialSavings) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Cost Breakdown by Account / Region</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Account</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Total Instances</TableHead>
              <TableHead>Idle Instances</TableHead>
              <TableHead>Monthly Cost</TableHead>
              <TableHead>Idle Cost</TableHead>
              <TableHead>Potential Savings</TableHead>
              <TableHead>Waste %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCostBreakdown.sort((a, b) => b.potentialSavings - a.potentialSavings).map(c => (
              <TableRow key={c.id} className="hover:bg-muted/20">
                <TableCell>
                  <div>
                    <p className="text-xs font-medium">{c.accountName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{c.accountId}</p>
                  </div>
                </TableCell>
                <TableCell><span className="text-xs font-mono text-muted-foreground">{c.region}</span></TableCell>
                <TableCell><span className="text-xs font-mono">{c.instanceCount}</span></TableCell>
                <TableCell><span className="text-xs font-mono text-amber-400">{c.idleInstanceCount}</span></TableCell>
                <TableCell><span className="text-xs font-mono">${c.totalMonthlyCost.toLocaleString()}</span></TableCell>
                <TableCell><span className="text-xs font-mono text-destructive">${c.idleMonthlyCost.toLocaleString()}</span></TableCell>
                <TableCell><span className="text-xs font-mono text-primary font-semibold">${c.potentialSavings.toLocaleString()}</span></TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('text-[10px] font-mono', savingsColor(c.savingsPercentage), 'border-current/30 bg-current/5')}>
                    {c.savingsPercentage.toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
