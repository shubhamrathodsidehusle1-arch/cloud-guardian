import { useState } from 'react';
import { mockManagedAccounts } from '@/data/mockManagedAccounts';
import { ManagedAWSAccount } from '@/types/cloud-resource';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle, Clock, Loader2, Wifi, WifiOff, TestTubeDiagonal, Plus } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { AddAccountDialog } from './AddAccountDialog';

const ENV_STYLES: Record<string, string> = {
  production: 'bg-destructive/10 text-destructive border-destructive/20',
  staging: 'bg-accent/10 text-accent border-accent/20',
  development: 'bg-primary/10 text-primary border-primary/20',
};

const STATUS_CONFIG: Record<ManagedAWSAccount['connectionStatus'], {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = {
  connected: { label: 'Connected', Icon: CheckCircle2, color: 'text-primary' },
  error: { label: 'Error', Icon: XCircle, color: 'text-destructive' },
  pending: { label: 'Pending', Icon: Loader2, color: 'text-muted-foreground' },
  unconfigured: { label: 'Unconfigured', Icon: WifiOff, color: 'text-muted-foreground' },
};

function maskArn(arn: string): string {
  const parts = arn.split(':');
  if (parts.length < 6) return arn;
  parts[4] = parts[4].replace(/\d(?=\d{4})/g, '*');
  return parts.join(':');
}

export function AccountTable() {
  const [accounts, setAccounts] = useState(mockManagedAccounts);
  const [addOpen, setAddOpen] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  const testConnection = (id: string) => {
    setTesting(id);
    setTimeout(() => {
      setAccounts(prev => prev.map(a => a.id === id
        ? { ...a, connectionStatus: 'connected', lastValidatedAt: new Date().toISOString() }
        : a,
      ));
      setTesting(null);
    }, 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-xs">
          {(['connected', 'error', 'pending'] as const).map(status => {
            const count = accounts.filter(a => a.connectionStatus === status).length;
            const cfg = STATUS_CONFIG[status];
            return (
              <div key={status} className={cn('flex items-center gap-1.5', cfg.color)}>
                <cfg.Icon className="h-3 w-3" />
                <span>{count} {cfg.label}</span>
              </div>
            );
          })}
        </div>
        <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground" onClick={() => setAddOpen(true)}>
          <Plus className="h-3 w-3" />Add Account
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Account</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Role ARN</TableHead>
              <TableHead>Regions</TableHead>
              <TableHead>Resources</TableHead>
              <TableHead>Monthly Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Validated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map(account => {
              const cfg = STATUS_CONFIG[account.connectionStatus];
              const isTestingThis = testing === account.id;
              return (
                <TableRow key={account.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div>
                      <p className="text-xs font-medium text-foreground">{account.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{account.accountId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-[10px] capitalize', ENV_STYLES[account.environment])}>
                      {account.environment}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px]" title={account.roleArn}>
                      {maskArn(account.roleArn)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {account.regions.slice(0, 2).map(r => (
                        <Badge key={r} variant="outline" className="text-[9px] px-1 py-0 font-mono border-border text-muted-foreground">{r}</Badge>
                      ))}
                      {account.regions.length > 2 && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-border text-muted-foreground">+{account.regions.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs font-mono">{account.totalResources.toLocaleString()}</p>
                      {account.flaggedResources > 0 && (
                        <p className="text-[10px] font-mono text-destructive">{account.flaggedResources} flagged</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs font-mono">${account.monthlyCost.toLocaleString()}</p>
                      <p className="text-[10px] font-mono text-destructive">${account.wasteCost.toLocaleString()} waste</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={cn('flex items-center gap-1.5', cfg.color)}>
                      <cfg.Icon className={cn('h-3.5 w-3.5', account.connectionStatus === 'pending' && 'animate-spin')} />
                      <span className="text-xs">{cfg.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] text-muted-foreground">
                      {account.lastValidatedAt
                        ? formatDistanceToNow(parseISO(account.lastValidatedAt), { addSuffix: true })
                        : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] gap-1 px-2"
                      disabled={isTestingThis}
                      onClick={() => testConnection(account.id)}
                    >
                      {isTestingThis
                        ? <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        : <Wifi className="h-2.5 w-2.5" />}
                      {isTestingThis ? 'Testing…' : 'Test'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AddAccountDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
