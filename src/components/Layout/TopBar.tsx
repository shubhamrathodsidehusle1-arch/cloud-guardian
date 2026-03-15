import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Bell, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pageTitles: Record<string, { title: string; description: string }> = {
  '/': { title: 'Overview', description: 'Cloud Guardian multi-service resource dashboard' },
  '/scans': { title: 'Scan Management', description: 'Schedule and monitor resource detection scans' },
  '/resources': { title: 'Resource Explorer', description: 'Filterable cloud resource inventory across all services' },
  '/metrics': { title: 'Metrics & Time-Series', description: 'CloudWatch telemetry for any AWS resource' },
  '/cost-analysis': { title: 'Cost Analysis', description: 'FinOps waste identification across all services' },
  '/recommendations': { title: 'Recommendations', description: 'AI-powered optimisation engine' },
  '/services': { title: 'Service Registry', description: 'Plugin-based AWS service detector management' },
  '/accounts': { title: 'AWS Accounts', description: 'Cross-account IAM role and credential management' },
};

export function TopBar() {
  const location = useLocation();
  const page = pageTitles[location.pathname] ?? { title: 'Cloud Guardian', description: '' };

  return (
    <header className="h-14 flex items-center gap-4 border-b border-border bg-card/50 backdrop-blur-sm px-4 shrink-0">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-foreground">{page.title}</h1>
          <span className="hidden sm:block text-xs text-muted-foreground">·</span>
          <span className="hidden sm:block text-xs text-muted-foreground">{page.description}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="hidden sm:flex text-[10px] font-mono text-primary border-primary/30 bg-primary/5">
          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-primary animate-pulse inline-block" />
          1 scan running
        </Badge>

        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground relative">
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>
      </div>
    </header>
  );
}
