import { ServiceRegistry } from '@/components/Services/ServiceRegistry';
import { mockServicePlugins } from '@/data/mockServicePlugins';
import { Puzzle, Server, Database, HardDrive, Zap, Table2, Container } from 'lucide-react';

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ec2: Server, rds: Database, s3: HardDrive, lambda: Zap, dynamodb: Table2, eks: Container,
};

export default function Services() {
  const enabled = mockServicePlugins.filter(p => p.enabled);
  const totalResources = enabled.reduce((s, p) => s + p.resourceCount, 0);
  const totalFlagged = enabled.reduce((s, p) => s + p.flaggedCount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Service Plugin Registry</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Dynamically registered AWS service detectors — enable, configure, and scan individual services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Puzzle className="h-5 w-5 text-primary" />
          <span className="text-sm font-mono text-primary">{mockServicePlugins.length} plugins registered</span>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Plugins', value: enabled.length, color: 'text-primary' },
          { label: 'Total Resources', value: totalResources.toLocaleString(), color: 'text-foreground' },
          { label: 'Flagged Resources', value: totalFlagged, color: 'text-destructive' },
          { label: 'Service Types', value: [...new Set(enabled.flatMap(p => p.resourceTypes))].length, color: 'text-accent' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg border border-border bg-card px-4 py-3">
            <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Capability coverage */}
      <div className="rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Enabled Service Coverage</p>
        <div className="flex flex-wrap gap-3">
          {enabled.map(plugin => {
            const Icon = SERVICE_ICONS[plugin.serviceName] || Puzzle;
            return (
              <div key={plugin.id} className="flex items-center gap-1.5 text-xs">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground font-medium">{plugin.displayName}</span>
                <span className="text-muted-foreground">·</span>
                <span className="font-mono text-primary">{plugin.resourceCount}</span>
              </div>
            );
          })}
        </div>
      </div>

      <ServiceRegistry />
    </div>
  );
}
