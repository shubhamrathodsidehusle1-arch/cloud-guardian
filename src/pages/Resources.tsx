import { ResourceTable } from '@/components/Resources/ResourceTable';
import { mockCloudResources, flaggedResources, totalResourceSavings } from '@/data/mockCloudResources';
import { mockServicePlugins } from '@/data/mockServicePlugins';
import { AlertTriangle, DollarSign, Box, Puzzle } from 'lucide-react';

export default function Resources() {
  const totalResources = mockCloudResources.length;
  const flaggedCount = flaggedResources.length;
  const criticalCount = mockCloudResources.filter(r => r.idleScore >= 90).length;
  const enabledServices = mockServicePlugins.filter(p => p.enabled).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Resource Explorer</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Filter, sort, and action cloud resources across all AWS services and accounts
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Resources', value: totalResources, icon: Box, color: 'text-foreground' },
          { label: 'Flagged Resources', value: flaggedCount, icon: AlertTriangle, color: 'text-destructive' },
          { label: 'Critical (≥90)', value: criticalCount, icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'Monthly Waste', value: `$${Math.round(totalResourceSavings).toLocaleString()}`, icon: DollarSign, color: 'text-primary' },
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

      {/* Service coverage note */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Puzzle className="h-3.5 w-3.5 text-primary" />
        <span>Showing resources from <span className="text-foreground font-medium">{enabledServices} active service plugins</span> — manage plugins in the <a href="/services" className="text-primary hover:underline">Service Registry</a></span>
      </div>

      <ResourceTable />
    </div>
  );
}
