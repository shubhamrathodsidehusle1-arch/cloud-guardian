import { useState } from 'react';
import { mockInstances } from '@/data/mockInstances';
import { EC2Instance, Region } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UtilizationSparkline, generateSparkline } from './UtilizationSparkline';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, EyeOff, ExternalLink, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const idleColor = (score: number) =>
  score >= 90 ? 'text-destructive' : score >= 75 ? 'text-amber-400' : 'text-primary';

const statusBadge = (score: number) => {
  if (score >= 90) return { label: 'Critical', className: 'bg-destructive/10 text-destructive border-destructive/20' };
  if (score >= 75) return { label: 'High', className: 'bg-amber-400/10 text-amber-400 border-amber-400/20' };
  if (score >= 65) return { label: 'Medium', className: 'bg-primary/10 text-primary border-primary/20' };
  return { label: 'Low', className: 'bg-muted text-muted-foreground border-border' };
};

type SortKey = 'idleScore' | 'monthlyCost' | 'cpuAvg' | 'name';

export function InstanceTable() {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('idleScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [instances, setInstances] = useState<EC2Instance[]>(mockInstances.filter(i => i.idleScore > 65));

  const regions = [...new Set(instances.map(i => i.region))];
  const accounts = [...new Set(instances.map(i => i.accountName))];

  const filtered = instances
    .filter(i => !i.ignored)
    .filter(i => regionFilter === 'all' || i.region === regionFilter)
    .filter(i => accountFilter === 'all' || i.accountName === accountFilter)
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.instanceId.includes(search) || i.instanceType.includes(search))
    .sort((a, b) => {
      const val = sortDir === 'asc' ? a[sortKey] < b[sortKey] ? -1 : 1 : a[sortKey] > b[sortKey] ? -1 : 1;
      return typeof a[sortKey] === 'string' ? (a[sortKey] as string).localeCompare(b[sortKey] as string) * (sortDir === 'asc' ? 1 : -1) : val;
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
    setInstances(prev => prev.map(i => selected.has(i.id) ? { ...i, ignored: true } : i));
    setSelected(new Set());
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null;

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search instances…" className="pl-8 h-8 text-sm w-56 bg-card" />
        </div>
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
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-destructive border-destructive/30" onClick={() => {}}>
              <Trash2 className="h-3 w-3" />Flag for termination
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
              <TableHead className="w-8 px-3"><Checkbox onCheckedChange={(v) => setSelected(v ? new Set(filtered.map(i => i.id)) : new Set())} /></TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('name')}>
                <span className="flex items-center gap-1">Name <SortIcon k="name" /></span>
              </TableHead>
              <TableHead>Account / Region</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('idleScore')}>
                <span className="flex items-center gap-1">Idle Score <SortIcon k="idleScore" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('cpuAvg')}>
                <span className="flex items-center gap-1">CPU% <SortIcon k="cpuAvg" /></span>
              </TableHead>
              <TableHead>CPU Trend</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('monthlyCost')}>
                <span className="flex items-center gap-1">Monthly Cost <SortIcon k="monthlyCost" /></span>
              </TableHead>
              <TableHead>Savings</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 50).map((inst) => {
              const badge = statusBadge(inst.idleScore);
              const sparkData = generateSparkline(inst.cpuAvg, 14);
              const sparkColor = inst.idleScore >= 75 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';
              return (
                <TableRow key={inst.id} className={cn('hover:bg-muted/20', selected.has(inst.id) && 'bg-primary/5')}>
                  <TableCell className="px-3">
                    <Checkbox checked={selected.has(inst.id)} onCheckedChange={() => toggleSelect(inst.id)} />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs font-medium text-foreground">{inst.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{inst.instanceId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs text-foreground">{inst.accountName}</p>
                      <p className="text-[10px] text-muted-foreground">{inst.region}</p>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-xs font-mono text-muted-foreground">{inst.instanceType}</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className={cn('text-sm font-bold font-mono', idleColor(inst.idleScore))}>{inst.idleScore}</span>
                      <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', badge.className)}>{badge.label}</Badge>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-xs font-mono text-muted-foreground">{inst.cpuAvg.toFixed(1)}%</span></TableCell>
                  <TableCell><UtilizationSparkline data={sparkData} color={sparkColor} /></TableCell>
                  <TableCell><span className="text-xs font-mono">${inst.monthlyCost.toLocaleString()}</span></TableCell>
                  <TableCell><span className="text-xs font-mono text-primary">${inst.potentialSavings.toLocaleString()}</span></TableCell>
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
          Showing {Math.min(filtered.length, 50)} of {filtered.length} idle instances
        </div>
      </div>
    </div>
  );
}
