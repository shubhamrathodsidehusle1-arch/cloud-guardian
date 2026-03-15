import { mockScans } from '@/data/mockScans';
import { ScanStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Clock, Loader2, ChevronDown, ChevronUp, CheckCheck } from 'lucide-react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const statusConfig: Record<ScanStatus, { label: string; className: string; Icon: React.ComponentType<{ className?: string }> }> = {
  running: { label: 'Running', className: 'text-accent border-accent/30 bg-accent/10', Icon: Loader2 },
  completed: { label: 'Completed', className: 'text-primary border-primary/30 bg-primary/10', Icon: CheckCircle2 },
  failed: { label: 'Failed', className: 'text-destructive border-destructive/30 bg-destructive/10', Icon: XCircle },
  queued: { label: 'Queued', className: 'text-muted-foreground border-border bg-muted/30', Icon: Clock },
};

const ETL_STAGES = [
  { key: 'discovery', label: 'Discovery' },
  { key: 'metrics_ingestion', label: 'Metrics' },
  { key: 'analysis', label: 'Analysis' },
  { key: 'recommendations', label: 'Recommendations' },
] as const;

const STAGE_ORDER = ['discovery', 'metrics_ingestion', 'analysis', 'recommendations', 'complete'];

function getStageIndex(progress: number, status: ScanStatus): number {
  if (status === 'completed') return 4;
  if (status === 'queued') return -1;
  if (progress < 25) return 0;
  if (progress < 50) return 1;
  if (progress < 75) return 2;
  return 3;
}

function duration(start: string, end?: string): string {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const diff = Math.floor((e.getTime() - s.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
}

export function ScanTable() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const scans = [...mockScans].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/30 border-b border-border">
            <th className="w-8 px-3 py-3"></th>
            <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Job ID</th>
            <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Account</th>
            <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Regions</th>
            <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Status</th>
            <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Progress</th>
            <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Duration</th>
            <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Resources</th>
            <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Flagged</th>
            <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Triggered By</th>
          </tr>
        </thead>
        <tbody>
          {scans.map(scan => {
            const cfg = statusConfig[scan.status];
            const isExpanded = expanded === scan.id;
            const stageIndex = getStageIndex(scan.progress, scan.status);

            return (
              <>
                <tr
                  key={scan.id}
                  className="cursor-pointer hover:bg-muted/20 border-b border-border/50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : scan.id)}
                >
                  <td className="px-3 py-3">
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                  </td>
                  <td className="px-3 py-3"><span className="text-xs font-mono text-foreground">{scan.jobId}</span></td>
                  <td className="px-3 py-3">
                    <div>
                      <p className="text-xs font-medium">{scan.accountName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{scan.accountId}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {scan.regions.slice(0, 2).map(r => (
                        <Badge key={r} variant="outline" className="text-[9px] px-1 py-0 font-mono border-border text-muted-foreground">{r}</Badge>
                      ))}
                      {scan.regions.length > 2 && <Badge variant="outline" className="text-[9px] px-1 py-0 border-border text-muted-foreground">+{scan.regions.length - 2}</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant="outline" className={cn('text-[10px] gap-1', cfg.className)}>
                      <cfg.Icon className={cn('h-3 w-3', scan.status === 'running' && 'animate-spin')} />
                      {cfg.label}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    {scan.status === 'running' ? (
                      <div className="flex items-center gap-2 w-24">
                        <Progress value={scan.progress} className="h-1.5 flex-1" />
                        <span className="text-[10px] font-mono text-muted-foreground">{scan.progress}%</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground">{scan.progress}%</span>
                    )}
                  </td>
                  <td className="px-3 py-3"><span className="text-xs font-mono text-muted-foreground">{duration(scan.startTime, scan.endTime)}</span></td>
                  <td className="px-3 py-3"><span className="text-xs font-mono">{scan.instancesScanned.toLocaleString()}</span></td>
                  <td className="px-3 py-3">
                    {scan.idleFound > 0 ? (
                      <span className="text-xs font-mono text-primary font-semibold">{scan.idleFound}</span>
                    ) : (
                      <span className="text-xs font-mono text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3"><span className="text-[10px] text-muted-foreground truncate max-w-[120px] block">{scan.triggeredBy}</span></td>
                </tr>

                {isExpanded && (
                  <tr key={`${scan.id}-detail`} className="bg-muted/10">
                    <td colSpan={10} className="px-6 py-4">
                      {/* ETL Pipeline Stage Stepper */}
                      <div className="mb-4">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">ETL Pipeline Stage</p>
                        <div className="flex items-center gap-0">
                          {ETL_STAGES.map((stage, idx) => {
                            const done = idx < stageIndex;
                            const active = idx === stageIndex;
                            const pending = idx > stageIndex;
                            return (
                              <div key={stage.key} className="flex items-center">
                                <div className={cn(
                                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium transition-all',
                                  done && 'bg-primary/10 text-primary',
                                  active && 'bg-accent/15 text-accent border border-accent/30',
                                  pending && 'bg-muted/30 text-muted-foreground',
                                )}>
                                  {done ? <CheckCheck className="h-3 w-3" /> : active ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
                                  {stage.label}
                                </div>
                                {idx < ETL_STAGES.length - 1 && (
                                  <div className={cn('h-px w-6 mx-1', done ? 'bg-primary/30' : 'bg-border')} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Metadata grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-muted-foreground uppercase text-[10px] tracking-wider mb-1">Start Time</p>
                          <p className="font-mono">{format(parseISO(scan.startTime), 'yyyy-MM-dd HH:mm:ss')}</p>
                        </div>
                        {scan.endTime && (
                          <div>
                            <p className="text-muted-foreground uppercase text-[10px] tracking-wider mb-1">End Time</p>
                            <p className="font-mono">{format(parseISO(scan.endTime), 'yyyy-MM-dd HH:mm:ss')}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground uppercase text-[10px] tracking-wider mb-1">Time Window</p>
                          <p className="font-mono">{scan.timeWindowDays} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground uppercase text-[10px] tracking-wider mb-1">All Regions</p>
                          <p className="font-mono">{scan.regions.join(', ')}</p>
                        </div>
                        {scan.errorMessage && (
                          <div className="col-span-4">
                            <p className="text-muted-foreground uppercase text-[10px] tracking-wider mb-1">Error</p>
                            <p className="font-mono text-destructive bg-destructive/5 px-2 py-1 rounded">{scan.errorMessage}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
