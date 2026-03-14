import { useState } from 'react';
import { mockRecommendations } from '@/data/mockRecommendations';
import { Recommendation, Priority, RecommendationType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, CheckCircle, XCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';

const priorityStyles: Record<Priority, string> = {
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
  high: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  medium: 'bg-accent/10 text-accent border-accent/20',
  low: 'bg-muted text-muted-foreground border-border',
};

const typeStyles: Record<RecommendationType, string> = {
  terminate: 'bg-destructive/10 text-destructive border-destructive/20',
  rightsize: 'bg-accent/10 text-accent border-accent/20',
  schedule: 'bg-primary/10 text-primary border-primary/20',
  snapshot: 'bg-muted text-muted-foreground border-border',
};

const statusStyles: Record<string, string> = {
  pending: 'text-amber-400',
  approved: 'text-primary',
  dismissed: 'text-muted-foreground line-through',
  executed: 'text-accent',
};

export function RecommendationTable() {
  const [recs, setRecs] = useState(mockRecommendations);
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = recs
    .filter(r => typeFilter === 'all' || r.type === typeFilter)
    .filter(r => priorityFilter === 'all' || r.priority === priorityFilter)
    .sort((a, b) => {
      const order: Priority[] = ['critical', 'high', 'medium', 'low'];
      return order.indexOf(a.priority) - order.indexOf(b.priority);
    });

  const updateStatus = (id: string, status: Recommendation['status']) => {
    setRecs(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const exportCSV = () => {
    const headers = ['Instance', 'Account', 'Region', 'Type', 'Action', 'Priority', 'Confidence', 'Monthly Savings', 'Annual Savings', 'Status'];
    const rows = filtered.map(r => [r.instanceName, r.accountName, r.region, r.type, r.type, r.priority, r.confidence + '%', '$' + r.estimatedMonthlySavings, '$' + r.estimatedAnnualSavings, r.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'kiloclaw-recommendations.csv';
    a.click();
  };

  const totalSavings = filtered.filter(r => r.status !== 'dismissed').reduce((s, r) => s + r.estimatedMonthlySavings, 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-36 text-xs bg-card"><SelectValue placeholder="Action type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="terminate">Terminate</SelectItem>
            <SelectItem value="rightsize">Rightsize</SelectItem>
            <SelectItem value="schedule">Schedule</SelectItem>
            <SelectItem value="snapshot">Snapshot</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-8 w-36 text-xs bg-card"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Potential savings: <span className="text-primary font-mono font-semibold">${totalSavings.toLocaleString()}/mo</span></span>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={exportCSV}>
            <Download className="h-3 w-3" />Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-8"></TableHead>
              <TableHead>Instance</TableHead>
              <TableHead>Account / Region</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Monthly Savings</TableHead>
              <TableHead>Annual Savings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(rec => {
              const isExpanded = expanded === rec.id;
              return (
                <>
                  <TableRow key={rec.id} className="cursor-pointer hover:bg-muted/20" onClick={() => setExpanded(isExpanded ? null : rec.id)}>
                    <TableCell className="px-3">
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs font-medium text-foreground">{rec.instanceName}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{rec.instanceType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs">{rec.accountName}</p>
                        <p className="text-[10px] text-muted-foreground">{rec.region}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-[10px] capitalize', typeStyles[rec.type])}>{rec.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-[10px] capitalize', priorityStyles[rec.priority])}>{rec.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${rec.confidence}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{rec.confidence}%</span>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-xs font-mono text-primary">${rec.estimatedMonthlySavings.toLocaleString()}</span></TableCell>
                    <TableCell><span className="text-xs font-mono text-muted-foreground">${rec.estimatedAnnualSavings.toLocaleString()}</span></TableCell>
                    <TableCell><span className={cn('text-xs capitalize', statusStyles[rec.status])}>{rec.status}</span></TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      {rec.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-primary hover:bg-primary/10" onClick={() => updateStatus(rec.id, 'approved')}>
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:bg-muted" onClick={() => updateStatus(rec.id, 'dismissed')}>
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {rec.status === 'approved' && (
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] text-accent hover:bg-accent/10 gap-1" onClick={() => updateStatus(rec.id, 'executed')}>
                          <Zap className="h-3 w-3" />Execute
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={`${rec.id}-detail`} className="bg-muted/10">
                      <TableCell colSpan={10} className="px-6 py-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground uppercase text-[10px] tracking-wider mb-1">Reasoning</p>
                            <p className="text-foreground">{rec.reasoning}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground uppercase text-[10px] tracking-wider mb-1">Suggested Action</p>
                            <p className="text-foreground">{rec.suggestedAction}</p>
                            {rec.targetInstanceType && (
                              <p className="mt-1 text-accent font-mono">→ {rec.targetInstanceType}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-muted-foreground uppercase text-[10px] tracking-wider mb-1">Created</p>
                            <p className="font-mono">{formatDistanceToNow(parseISO(rec.createdAt), { addSuffix: true })}</p>
                          </div>
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
    </div>
  );
}
