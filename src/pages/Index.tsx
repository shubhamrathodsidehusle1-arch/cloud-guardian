import { KpiCard } from '@/components/Dashboard/KpiCard';
import { ScanActivityFeed } from '@/components/Dashboard/ScanActivityFeed';
import { RegionBarChart } from '@/components/Charts/RegionBarChart';
import { InstanceTypePieChart } from '@/components/Charts/InstanceTypePieChart';
import { mockInstances, idleInstances } from '@/data/mockInstances';
import { mockScans } from '@/data/mockScans';
import { totalPotentialSavings } from '@/data/mockCosts';
import { Server, AlertTriangle, DollarSign, Scan, Activity, Shield } from 'lucide-react';
import { mockAccounts } from '@/data/mockAccounts';

export default function Index() {
  const totalInstances = mockInstances.length;
  const idleCount = idleInstances.length;
  const activeScans = mockScans.filter(s => s.status === 'running').length;
  const totalAccounts = mockAccounts.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Real-time AWS idle instance detection across {totalAccounts} accounts</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Instances"
          value={totalInstances.toLocaleString()}
          subtitle={`${totalAccounts} accounts`}
          icon={Server}
          variant="default"
        />
        <KpiCard
          title="Idle Instances"
          value={idleCount}
          subtitle={`${((idleCount / totalInstances) * 100).toFixed(1)}% of fleet`}
          icon={AlertTriangle}
          variant="danger"
          trend={{ value: 8.3, label: 'vs last week' }}
        />
        <KpiCard
          title="Monthly Waste"
          value={`$${(totalPotentialSavings).toLocaleString()}`}
          subtitle="potential savings"
          icon={DollarSign}
          variant="warning"
          mono
        />
        <KpiCard
          title="Annual Savings"
          value={`$${(totalPotentialSavings * 12).toLocaleString()}`}
          subtitle="if actioned now"
          icon={DollarSign}
          variant="success"
          mono
        />
        <KpiCard
          title="Active Scans"
          value={activeScans}
          subtitle={`${mockScans.filter(s => s.status === 'queued').length} queued`}
          icon={Scan}
          variant="default"
        />
        <KpiCard
          title="Accounts"
          value={totalAccounts}
          subtitle="monitored"
          icon={Shield}
          variant="default"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <RegionBarChart />
        </div>
        <InstanceTypePieChart />
      </div>

      {/* Activity feed + account summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ScanActivityFeed />
        </div>
        <div className="rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Top Wasteful Accounts</h3>
          </div>
          <div className="divide-y divide-border">
            {mockAccounts.sort((a, b) => b.wasteCost - a.wasteCost).map(account => (
              <div key={account.id} className="px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                <div>
                  <p className="text-xs font-medium text-foreground">{account.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{account.accountId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-destructive">${account.wasteCost.toLocaleString()}/mo</p>
                  <p className="text-[10px] text-muted-foreground">{account.idleInstances} idle</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
