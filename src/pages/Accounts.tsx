import { AccountTable } from '@/components/Accounts/AccountTable';
import { mockManagedAccounts } from '@/data/mockManagedAccounts';
import { Shield, CheckCircle2, XCircle, DollarSign, Server } from 'lucide-react';

export default function Accounts() {
  const connected = mockManagedAccounts.filter(a => a.connectionStatus === 'connected').length;
  const errorCount = mockManagedAccounts.filter(a => a.connectionStatus === 'error').length;
  const totalCost = mockManagedAccounts.reduce((s, a) => s + a.monthlyCost, 0);
  const totalWaste = mockManagedAccounts.reduce((s, a) => s + a.wasteCost, 0);
  const totalResources = mockManagedAccounts.reduce((s, a) => s + a.totalResources, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">AWS Account Management</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage cross-account IAM roles and monitor connectivity — credentials are never stored locally
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Accounts', value: mockManagedAccounts.length, icon: Shield, color: 'text-foreground' },
          { label: 'Connected', value: connected, icon: CheckCircle2, color: 'text-primary' },
          { label: 'Errors', value: errorCount, icon: XCircle, color: 'text-destructive' },
          { label: 'Total Resources', value: totalResources.toLocaleString(), icon: Server, color: 'text-accent' },
          { label: 'Monthly Waste', value: `$${totalWaste.toLocaleString()}`, icon: DollarSign, color: 'text-amber-400' },
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

      {/* Security notice */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-start gap-3">
        <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Credential Security: </span>
          Cloud Guardian uses AWS STS AssumeRole with ExternalId validation. No long-lived access keys are stored. All role ARNs use column-level encryption at rest. External IDs are scoped per account and rotated quarterly.
        </div>
      </div>

      <AccountTable />
    </div>
  );
}
