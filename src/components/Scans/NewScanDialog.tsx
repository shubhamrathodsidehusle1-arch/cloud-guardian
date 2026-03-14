import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Play, X } from 'lucide-react';
import { Region } from '@/types';

const ALL_REGIONS: Region[] = ['us-east-1','us-east-2','us-west-1','us-west-2','eu-west-1','eu-west-2','eu-central-1','ap-southeast-1','ap-southeast-2','ap-northeast-1','sa-east-1','ca-central-1'];
const ACCOUNTS = [
  { id: '123456789012', name: 'Prod-Core' },
  { id: '234567890123', name: 'Staging-Platform' },
  { id: '345678901234', name: 'Dev-Team-Alpha' },
  { id: '456789012345', name: 'Analytics-Cluster' },
  { id: '567890123456', name: 'ML-Training' },
];

interface NewScanDialogProps {
  open: boolean;
  onClose: () => void;
  onStart: (config: { accountId: string; regions: Region[]; timeWindowDays: number }) => void;
}

export function NewScanDialog({ open, onClose, onStart }: NewScanDialogProps) {
  const [accountId, setAccountId] = useState('');
  const [regions, setRegions] = useState<Region[]>([]);
  const [timeWindow, setTimeWindow] = useState('14');

  const toggleRegion = (r: Region) => setRegions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  const selectAll = () => setRegions([...ALL_REGIONS]);
  const clearAll = () => setRegions([]);

  const handleStart = () => {
    if (!accountId || regions.length === 0) return;
    onStart({ accountId, regions, timeWindowDays: parseInt(timeWindow) });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" />
            Start New Scan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">AWS Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className="bg-muted border-border text-sm">
                <SelectValue placeholder="Select account…" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNTS.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    <span className="font-mono text-xs text-muted-foreground mr-2">{a.id}</span>{a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Lookback Window</Label>
            <Select value={timeWindow} onValueChange={setTimeWindow}>
              <SelectTrigger className="bg-muted border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Regions</Label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[10px] text-primary hover:underline">All</button>
                <button onClick={clearAll} className="text-[10px] text-muted-foreground hover:underline">Clear</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto">
              {ALL_REGIONS.map(r => (
                <label key={r} className="flex items-center gap-1.5 cursor-pointer rounded px-2 py-1 hover:bg-muted/50">
                  <Checkbox checked={regions.includes(r)} onCheckedChange={() => toggleRegion(r)} className="h-3 w-3" />
                  <span className="text-[10px] font-mono text-foreground">{r}</span>
                </label>
              ))}
            </div>
            {regions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {regions.map(r => (
                  <Badge key={r} variant="outline" className="text-[10px] px-1.5 text-primary border-primary/30 bg-primary/5 gap-1">
                    {r}
                    <button onClick={() => toggleRegion(r)}><X className="h-2 w-2" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="text-sm">Cancel</Button>
          <Button onClick={handleStart} disabled={!accountId || regions.length === 0} className="text-sm gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Play className="h-3.5 w-3.5" />
            Start Scan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
