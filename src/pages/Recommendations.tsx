import { RecommendationTable } from '@/components/Recommendations/RecommendationTable';
import { mockRecommendations } from '@/data/mockRecommendations';
import { Lightbulb, Trash2, ArrowDownCircle, Clock, Camera } from 'lucide-react';

export default function Recommendations() {
  const total = mockRecommendations.length;
  const pending = mockRecommendations.filter(r => r.status === 'pending').length;
  const totalAnnualSavings = mockRecommendations.filter(r => r.status !== 'dismissed').reduce((s, r) => s + r.estimatedAnnualSavings, 0);

  const byType = ['terminate', 'rightsize', 'schedule', 'snapshot'].map(type => ({
    type, count: mockRecommendations.filter(r => r.type === type).length,
  }));

  const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    terminate: Trash2, rightsize: ArrowDownCircle, schedule: Clock, snapshot: Camera,
  };
  const typeColors: Record<string, string> = {
    terminate: 'text-destructive', rightsize: 'text-accent', schedule: 'text-primary', snapshot: 'text-muted-foreground',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Recommendations Engine</h2>
          <p className="text-sm text-muted-foreground mt-0.5">AI-powered cost optimization actions for your AWS fleet</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Potential annual savings</p>
          <p className="text-2xl font-bold font-mono text-primary">${totalAnnualSavings.toLocaleString()}</p>
        </div>
      </div>

      {/* Type summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {byType.map(({ type, count }) => {
          const Icon = typeIcons[type];
          return (
            <div key={type} className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3">
              <Icon className={`h-4 w-4 ${typeColors[type]}`} />
              <div>
                <p className={`text-xl font-bold font-mono ${typeColors[type]}`}>{count}</p>
                <p className="text-xs text-muted-foreground capitalize">{type}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="rounded-lg border border-border bg-card px-4 py-3">
        <div className="flex flex-wrap gap-6 text-xs">
          <div><span className="text-muted-foreground">Total: </span><span className="font-mono font-semibold">{total}</span></div>
          <div><span className="text-muted-foreground">Pending: </span><span className="font-mono text-amber-400">{pending}</span></div>
          <div><span className="text-muted-foreground">Approved: </span><span className="font-mono text-primary">{mockRecommendations.filter(r => r.status === 'approved').length}</span></div>
          <div><span className="text-muted-foreground">Executed: </span><span className="font-mono text-accent">{mockRecommendations.filter(r => r.status === 'executed').length}</span></div>
          <div><span className="text-muted-foreground">Dismissed: </span><span className="font-mono text-muted-foreground">{mockRecommendations.filter(r => r.status === 'dismissed').length}</span></div>
        </div>
      </div>

      <RecommendationTable />
    </div>
  );
}
