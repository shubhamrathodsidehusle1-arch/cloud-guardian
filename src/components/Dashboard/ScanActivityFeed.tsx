import { mockScans } from '@/data/mockScans';
import { ScanStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusConfig: Record<ScanStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  running: { label: 'Running', color: 'text-accent', icon: Loader2 },
  completed: { label: 'Done', color: 'text-primary', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'text-destructive', icon: XCircle },
  queued: { label: 'Queued', color: 'text-muted-foreground', icon: Clock },
};

export function ScanActivityFeed() {
  const recent = [...mockScans].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).slice(0, 5);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Recent Scan Activity</h3>
      </div>
      <div className="divide-y divide-border">
        {recent.map((scan) => {
          const cfg = statusConfig[scan.status];
          const Icon = cfg.icon;
          return (
            <div key={scan.id} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
              <Icon className={`h-4 w-4 shrink-0 ${cfg.color} ${scan.status === 'running' ? 'animate-spin' : ''}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground truncate">{scan.accountName}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{scan.jobId}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {scan.status === 'running' ? (
                    <Progress value={scan.progress} className="h-1 w-20" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{scan.regions.slice(0, 2).join(', ')}{scan.regions.length > 2 ? ` +${scan.regions.length - 2}` : ''}</span>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(scan.startTime), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <Badge variant="outline" className={`text-[10px] border-0 bg-transparent ${cfg.color}`}>
                  {cfg.label}
                </Badge>
                {scan.status === 'completed' && (
                  <p className="text-[10px] text-muted-foreground">{scan.idleFound} flagged</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
