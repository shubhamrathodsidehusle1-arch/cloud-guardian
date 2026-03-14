import { InstanceTable } from '@/components/Instances/InstanceTable';
import { idleInstances } from '@/data/mockInstances';
import { totalPotentialSavings } from '@/data/mockCosts';
import { AlertTriangle, DollarSign, Server, TrendingDown } from 'lucide-react';

export default function Instances() {
  const criticalCount = idleInstances.filter(i => i.idleScore >= 90).length;
  const highCount = idleInstances.filter(i => i.idleScore >= 75 && i.idleScore < 90).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Idle Instance Explorer</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Filter, sort, and action idle EC2 instances across all accounts</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Idle', value: idleInstances.length, icon: Server, color: 'text-foreground' },
          { label: 'Critical (≥90)', value: criticalCount, icon: AlertTriangle, color: 'text-destructive' },
          { label: 'High (≥75)', value: highCount, icon: TrendingDown, color: 'text-amber-400' },
          { label: 'Monthly Waste', value: `$${totalPotentialSavings.toLocaleString()}`, icon: DollarSign, color: 'text-primary' },
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

      <InstanceTable />
    </div>
  );
}
