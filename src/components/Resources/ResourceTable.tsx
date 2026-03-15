import { useState } from 'react';
import { mockCloudResources } from '@/data/mockCloudResources';
import { CloudResource, AWSServiceName, ResourceState } from '@/types/cloud-resource';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { UtilizationSparkline, generateSparkline } from '@/components/Instances/UtilizationSparkline';
import { Flag, EyeOff, ExternalLink, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const SERVICE_COLORS: Record<AWSServiceName, string> = {
  ec2: 'bg-primary/10 text-primary border-primary/20',
  rds: 'bg-accent/10 text-accent border-accent/20',
  s3: 'bg-[hsl(38_92%_50%)]/10 text-[hsl(38_92%_50%)] border-[hsl(38_92%_50%)]/20',
  lambda: 'bg-[hsl(270_60%_60%)]/10 text-[hsl(270_60%_60%)] border-[hsl(270_60%_60%)]/20',
  dynamodb: 'bg-[hsl(188_78%_50%)]/10 text-[hsl(188_78%_50%)] border-[hsl(188_78%_50%)]/20',
  eks: 'bg-[hsl(158_64%_40%)]/10 text-[hsl(158_64%_40%)] border-[hsl(158_64%_40%)]/20',
  iam: 'bg-muted text-muted-foreground border-border',
  elasticache: 'bg-destructive/10 text-destructive border-destructive/20',
};

const STATE_STYLES: Record<ResourceState, string> = {
  active: 'bg-primary/10 text-primary border-primary/20',
  idle: 'bg-destructive/10 text-destructive border-destructive/20',
  stopped: 'bg-muted text-muted-foreground border-border',
  terminated: 'bg-muted text-muted-foreground border-border',
  unknown: 'bg-muted text-muted-foreground border-border',
};

const idleColor = (score: number) =>
  score >= 90 ? 'text-destructive' : score >= 75 ? 'text-amber-400' : 'text-primary';

type SortKey = 'idleScore' | 'monthlyCost' | 'displayName';

export function ResourceTable() {
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('idleScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [resources, setResources] = useState<CloudResource[]>(mockCloudResources.filter(r => r.idleScore > 40));

  const services = [...new Set(resources.map(r => r.serviceName))];
  const regions = [...new Set(resources.map(r => r.region))];
  const accounts = [...new Set(resources.map(r => r.accountName))];

  const filtered = resources
    .filter(r => !r.ignored)
    .filter(r => serviceFilter === 'all' || r.serviceName === serviceFilter)
    .filter(r => regionFilter === 'all' || r.region === regionFilter)
    .filter(r => accountFilter === 'all' || r.accountName === accountFilter)
    .filter(r => !search || r.displayName.toLowerCase().includes(search.toLowerCase()) || r.resourceId.includes(search) || r.resourceType.includes(search))
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * (sortDir === 'asc' ? 1 : -1);
      }
      return (sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number));
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };
  const toggleSelect = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const handleIgnore = () => {
    setResources(prev => prev.map(r => selected.has(r.id) ? { ...r, ignored: true } : r));
    setSelected(new Set());
  };
  const handleFlag = () => {
    setResources(prev => prev.map(r => selected.has(r.id) ? { ...r, flagged: true } : r));
    setSelected(new Set());
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null;

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources…" className="pl-8 h-8 text-sm w-56 bg-card" />
        </div>
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="h-8 w-36 text-xs bg-card"><SelectValue placeholder="All services" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {services.map(s => <SelectItem key={s} value={s} className="capitalize">{s.toUpperCase()}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="h-8 w-36 text-xs bg-card"><SelectValue placeholder="All regions" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All regions</SelectItem>
            {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="h-8 w-44 text-xs bg-card"><SelectValue placeholder="All accounts" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {accounts.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">{selected.size} selected</span>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-destructive border-destructive/30" onClick={handleFlag}>
              <Flag className="h-3 w-3" />Flag for Review
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={handleIgnore}>
              <EyeOff className="h-3 w-3" />Ignore
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-8 px-3">
                <Checkbox onCheckedChange={(v) => setSelected(v ? new Set(filtered.map(r => r.id)) : new Set())} />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('displayName')}>
                <span className="flex items-center gap-1">Resource <SortIcon k="displayName" /></span>
              </TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Account / Region</TableHead>
              <TableHead>Resource Type</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('idleScore')}>
                <span className="flex items-center gap-1">Idle Score <SortIcon k="idleScore" /></span>
              </TableHead>
              <TableHead>State</TableHead>
              <TableHead>Trend</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('monthlyCost')}>
                <span className="flex items-center gap-1">Monthly Cost <SortIcon k="monthlyCost" /></span>
              </TableHead>
              <TableHead>Savings</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 50).map(resource => {
              const cpuAvg = typeof resource.metadata.cpuAvg === 'number' ? resource.metadata.cpuAvg : resource.idleScore > 65 ? 3 : 40;
              const sparkData = generateSparkline(cpuAvg, 14);
              const sparkColor = resource.idleScore >= 75 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';
              return (
                <TableRow key={resource.id} className={cn('hover:bg-muted/20', selected.has(resource.id) && 'bg-primary/5')}>
                  <TableCell className="px-3">
                    <Checkbox checked={selected.has(resource.id)} onCheckedChange={() => toggleSelect(resource.id)} />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs font-medium text-foreground">{resource.displayName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[160px]">{resource.resourceId.split('/').pop() || resource.resourceId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-[10px] uppercase font-mono', SERVICE_COLORS[resource.serviceName])}>
                      {resource.serviceName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs text-foreground">{resource.accountName}</p>
                      <p className="text-[10px] text-muted-foreground">{resource.region}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-mono text-muted-foreground">{resource.resourceType}</span>
                  </TableCell>
                  <TableCell>
                    <span className={cn('text-sm font-bold font-mono', idleColor(resource.idleScore))}>
                      {resource.idleScore}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-[10px] capitalize', STATE_STYLES[resource.state])}>
                      {resource.state}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <UtilizationSparkline data={sparkData} color={sparkColor} />
                  </TableCell>
                  <TableCell><span className="text-xs font-mono">${resource.monthlyCost.toLocaleString()}</span></TableCell>
                  <TableCell><span className="text-xs font-mono text-primary">${resource.potentialSavings.toLocaleString()}</span></TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
          Showing {Math.min(filtered.length, 50)} of {filtered.length} flagged resources
        </div>
      </div>
    </div>
  );
}
