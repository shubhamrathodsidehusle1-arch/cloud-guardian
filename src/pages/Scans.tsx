import { useState } from 'react';
import { ScanTable } from '@/components/Scans/ScanTable';
import { NewScanDialog } from '@/components/Scans/NewScanDialog';
import { Button } from '@/components/ui/button';
import { mockScans } from '@/data/mockScans';
import { Play, RefreshCw, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { Region } from '@/types';

export default function Scans() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const running = mockScans.filter(s => s.status === 'running').length;
  const completed = mockScans.filter(s => s.status === 'completed').length;
  const failed = mockScans.filter(s => s.status === 'failed').length;
  const queued = mockScans.filter(s => s.status === 'queued').length;

  const handleStart = (config: { accountId: string; regions: Region[]; timeWindowDays: number }) => {
    console.log('Starting scan:', config);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Scan Management</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Schedule and monitor idle instance detection jobs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground">
            <RefreshCw className="h-3 w-3" />Refresh
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground" onClick={() => setDialogOpen(true)}>
            <Play className="h-3 w-3" />New Scan
          </Button>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Running', value: running, icon: Loader2, color: 'text-accent', spin: true },
          { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-primary', spin: false },
          { label: 'Failed', value: failed, icon: XCircle, color: 'text-destructive', spin: false },
          { label: 'Queued', value: queued, icon: Clock, color: 'text-muted-foreground', spin: false },
        ].map(({ label, value, icon: Icon, color, spin }) => (
          <div key={label} className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3">
            <Icon className={`h-5 w-5 ${color} ${spin ? 'animate-spin' : ''}`} />
            <div>
              <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <ScanTable />

      <NewScanDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onStart={handleStart} />
    </div>
  );
}
