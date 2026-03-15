import { KpiCard } from '@/components/Dashboard/KpiCard';
import { ScanActivityFeed } from '@/components/Dashboard/ScanActivityFeed';
import { RegionBarChart } from '@/components/Charts/RegionBarChart';
import { ResourceServicePieChart } from '@/components/Charts/InstanceTypePieChart';
import { mockCloudResources, flaggedResources, totalResourceSavings } from '@/data/mockCloudResources';
import { mockScans } from '@/data/mockScans';
import { mockManagedAccounts } from '@/data/mockManagedAccounts';
import { mockServicePlugins } from '@/data/mockServicePlugins';
import { Box, AlertTriangle, DollarSign, Scan, Puzzle, Shield } from 'lucide-react';

export default function Index() {
  const totalResources = mockCloudResources.length;
  const flaggedCount = flaggedResources.length;
  const activeScans = mockScans.filter(s => s.status === 'running').length;
  const totalAccounts = mockManagedAccounts.length;
  const enabledPlugins = mockServicePlugins.filter(p => p.enabled).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Cloud Guardian — multi-service AWS resource governance across {totalAccounts} accounts · {enabledPlugins} active service plugins
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Resources"
          value={totalResources.toLocaleString()}
          subtitle={`${enabledPlugins} service plugins`}
          icon={Box}
          variant="default"
        />
        <KpiCard
          title="Flagged Resources"
          value={flaggedCount}
          subtitle={`${((flaggedCount / totalResources) * 100).toFixed(1)}% of fleet`}
          icon={AlertTriangle}
          variant="danger"
          trend={{ value: 8.3, label: 'vs last week' }}
        />
        <KpiCard
          title="Monthly Waste"
          value={`$${Math.round(totalResourceSavings).toLocaleString()}`}
          subtitle="potential savings"
          icon={DollarSign}
          variant="warning"
          mono
        />
        <KpiCard
          title="Annual Savings"
          value={`$${Math.round(totalResourceSavings * 12).toLocaleString()}`}
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
        <ResourceServicePieChart />
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
            {mockManagedAccounts.sort((a, b) => b.wasteCost - a.wasteCost).map(account => (
              <div key={account.id} className="px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                <div>
                  <p className="text-xs font-medium text-foreground">{account.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{account.accountId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-destructive">${account.wasteCost.toLocaleString()}/mo</p>
                  <p className="text-[10px] text-muted-foreground">{account.flaggedResources} flagged</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
