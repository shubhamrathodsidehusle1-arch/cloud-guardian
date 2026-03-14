import { useState } from 'react';
import { mockScans } from '@/data/mockScans';
import { ScanJob, ScanStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle, Clock, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const statusConfig: Record<ScanStatus, { label: string; className: string; Icon: React.ComponentType<{ className?: string }> }> = {
  running: { label: 'Running', className: 'text-accent border-accent/30 bg-accent/10', Icon: Loader2 },
  completed: { label: 'Completed', className: 'text-primary border-primary/30 bg-primary/10', Icon: CheckCircle2 },
  failed: { label: 'Failed', className: 'text-destructive border-destructive/30 bg-destructive/10', Icon: XCircle },
  queued: { label: 'Queued', className: 'text-muted-foreground border-border bg-muted/30', Icon: Clock },
};

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
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-8"></TableHead>
            <TableHead>Job ID</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Regions</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Instances</TableHead>
            <TableHead>Idle Found</TableHead>
            <TableHead>Triggered By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scans.map(scan => {
            const cfg = statusConfig[scan.status];
            const isExpanded = expanded === scan.id;
            return (
              <>
                <TableRow
                  key={scan.id}
                  className="cursor-pointer hover:bg-muted/20"
                  onClick={() => setExpanded(isExpanded ? null : scan.id)}
                >
                  <TableCell className="px-3">
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                  </TableCell>
                  <TableCell><span className="text-xs font-mono text-foreground">{scan.jobId}</span></TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs font-medium">{scan.accountName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{scan.accountId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {scan.regions.slice(0, 2).map(r => (
                        <Badge key={r} variant="outline" className="text-[9px] px-1 py-0 font-mono border-border text-muted-foreground">{r}</Badge>
                      ))}
                      {scan.regions.length > 2 && <Badge variant="outline" className="text-[9px] px-1 py-0 border-border text-muted-foreground">+{scan.regions.length - 2}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-[10px] gap-1', cfg.className)}>
                      <cfg.Icon className={cn('h-3 w-3', scan.status === 'running' && 'animate-spin')} />
                      {cfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {scan.status === 'running' ? (
                      <div className="flex items-center gap-2 w-24">
                        <Progress value={scan.progress} className="h-1.5 flex-1" />
                        <span className="text-[10px] font-mono text-muted-foreground">{scan.progress}%</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground">{scan.progress}%</span>
                    )}
                  </TableCell>
                  <TableCell><span className="text-xs font-mono text-muted-foreground">{duration(scan.startTime, scan.endTime)}</span></TableCell>
                  <TableCell><span className="text-xs font-mono">{scan.instancesScanned.toLocaleString()}</span></TableCell>
                  <TableCell>
                    {scan.idleFound > 0 ? (
                      <span className="text-xs font-mono text-primary font-semibold">{scan.idleFound}</span>
                    ) : (
                      <span className="text-xs font-mono text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell><span className="text-[10px] text-muted-foreground truncate max-w-[120px] block">{scan.triggeredBy}</span></TableCell>
                </TableRow>

                {isExpanded && (
                  <TableRow key={`${scan.id}-detail`} className="bg-muted/10">
                    <TableCell colSpan={10} className="px-6 py-3">
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
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
