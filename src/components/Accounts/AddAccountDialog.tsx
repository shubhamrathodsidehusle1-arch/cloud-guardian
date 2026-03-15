import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, ShieldCheck, Info } from 'lucide-react';
import { Region } from '@/types';

const ALL_REGIONS: Region[] = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-west-1', 'eu-west-2', 'eu-central-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
  'sa-east-1', 'ca-central-1',
];

interface AddAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddAccountDialog({ open, onClose }: AddAccountDialogProps) {
  const [accountId, setAccountId] = useState('');
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState('');
  const [roleArn, setRoleArn] = useState('');
  const [externalId, setExternalId] = useState('');
  const [regions, setRegions] = useState<Region[]>([]);

  const toggleRegion = (r: Region) => setRegions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  const isValid = accountId.length === 12 && name && environment && roleArn.startsWith('arn:aws:iam::') && regions.length > 0;

  const handleAdd = () => {
    if (!isValid) return;
    onClose();
    setAccountId(''); setName(''); setEnvironment(''); setRoleArn(''); setExternalId(''); setRegions([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Add AWS Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Info banner */}
          <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 flex gap-2">
            <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Cloud Guardian uses cross-account IAM roles (STS AssumeRole) — no long-lived credentials are stored. Create a read-only role in the target account and paste the ARN below.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Account ID</Label>
              <Input
                value={accountId}
                onChange={e => setAccountId(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="123456789012"
                className="bg-muted border-border text-sm font-mono h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Display Name</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Prod-Core"
                className="bg-muted border-border text-sm h-8"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Environment</Label>
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger className="bg-muted border-border text-sm h-8">
                <SelectValue placeholder="Select environment…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">IAM Role ARN</Label>
            <Input
              value={roleArn}
              onChange={e => setRoleArn(e.target.value)}
              placeholder="arn:aws:iam::123456789012:role/CloudGuardian-ReadOnly"
              className="bg-muted border-border text-sm font-mono h-8 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              External ID <span className="normal-case text-[10px]">(optional but recommended)</span>
            </Label>
            <Input
              value={externalId}
              onChange={e => setExternalId(e.target.value)}
              placeholder="cg-ext-a1b2c3d4"
              className="bg-muted border-border text-sm font-mono h-8"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Regions to Monitor</Label>
              <div className="flex gap-2">
                <button onClick={() => setRegions([...ALL_REGIONS])} className="text-[10px] text-primary hover:underline">All</button>
                <button onClick={() => setRegions([])} className="text-[10px] text-muted-foreground hover:underline">Clear</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto">
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
          <Button onClick={handleAdd} disabled={!isValid} className="text-sm gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" />Add Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
