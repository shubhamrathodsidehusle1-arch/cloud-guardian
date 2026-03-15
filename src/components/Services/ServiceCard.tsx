import { useState } from 'react';
import { ServicePlugin, ServiceCapability } from '@/types/cloud-resource';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Server, Database, HardDrive, Zap, Table2, Container, MemoryStick, ShieldCheck,
  Play, CheckCircle2, AlertCircle, Clock,
} from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Server, Database, HardDrive, Zap, Table2, Container, MemoryStick, ShieldCheck,
};

const CAPABILITY_LABELS: Record<ServiceCapability, string> = {
  discover_resources: 'Discover',
  scan_resources: 'Scan',
  collect_metrics: 'Metrics',
  generate_recommendations: 'Recommend',
  perform_actions: 'Actions',
};

const CAPABILITY_COLORS: Record<ServiceCapability, string> = {
  discover_resources: 'border-primary/30 bg-primary/5 text-primary',
  scan_resources: 'border-accent/30 bg-accent/5 text-accent',
  collect_metrics: 'border-[hsl(38_92%_50%)]/30 bg-[hsl(38_92%_50%)]/5 text-[hsl(38_92%_50%)]',
  generate_recommendations: 'border-[hsl(270_60%_60%)]/30 bg-[hsl(270_60%_60%)]/5 text-[hsl(270_60%_60%)]',
  perform_actions: 'border-destructive/30 bg-destructive/5 text-destructive',
};

interface ServiceCardProps {
  plugin: ServicePlugin;
}

export function ServiceCard({ plugin }: ServiceCardProps) {
  const [enabled, setEnabled] = useState(plugin.enabled);
  const [scanning, setScanning] = useState(false);

  const Icon = ICON_MAP[plugin.icon] || Server;

  const handleScanNow = () => {
    if (!enabled) return;
    setScanning(true);
    setTimeout(() => setScanning(false), 3000);
  };

  return (
    <div className={cn(
      'rounded-lg border bg-card p-4 flex flex-col gap-4 transition-all',
      enabled ? 'border-border hover:border-border/80' : 'border-border/40 opacity-60',
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-md flex items-center justify-center shrink-0"
            style={{ background: `color-mix(in srgb, ${plugin.color} 12%, transparent)` }}
          >
            <Icon className="h-4.5 w-4.5" style={{ color: plugin.color }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">{plugin.displayName}</p>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">v{plugin.version}</p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          className="shrink-0"
        />
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{plugin.description}</p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md bg-muted/30 px-2 py-1.5 text-center">
          <p className="text-sm font-bold font-mono text-foreground">{plugin.resourceCount.toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Resources</p>
        </div>
        <div className="rounded-md bg-muted/30 px-2 py-1.5 text-center">
          <p className={cn('text-sm font-bold font-mono', plugin.flaggedCount > 0 ? 'text-destructive' : 'text-muted-foreground')}>
            {plugin.flaggedCount}
          </p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Flagged</p>
        </div>
        <div className="rounded-md bg-muted/30 px-2 py-1.5 text-center">
          <p className="text-sm font-bold font-mono text-foreground">{plugin.accountIds.length}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Accounts</p>
        </div>
      </div>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1">
        {plugin.capabilities.map(cap => (
          <Badge
            key={cap}
            variant="outline"
            className={cn('text-[9px] px-1.5 py-0 font-mono', CAPABILITY_COLORS[cap])}
          >
            {CAPABILITY_LABELS[cap]}
          </Badge>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          {enabled ? (
            scanning ? (
              <>
                <Play className="h-3 w-3 text-accent animate-pulse" />
                <span className="text-[10px] text-accent">Scanning…</span>
              </>
            ) : plugin.lastScanAt ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-primary" />
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(parseISO(plugin.lastScanAt), { addSuffix: true })}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 text-amber-400" />
                <span className="text-[10px] text-muted-foreground">Never scanned</span>
              </>
            )
          ) : (
            <>
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Disabled</span>
            </>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] gap-1 px-2"
          disabled={!enabled || scanning}
          onClick={handleScanNow}
        >
          <Play className="h-2.5 w-2.5" />
          Scan Now
        </Button>
      </div>
    </div>
  );
}
