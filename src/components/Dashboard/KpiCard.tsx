import { LucideIcon, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: 'default' | 'danger' | 'success' | 'warning';
  mono?: boolean;
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, variant = 'default', mono = false }: KpiCardProps) {
  const variantStyles = {
    default: 'text-accent',
    danger: 'text-destructive',
    success: 'text-primary',
    warning: 'text-amber-400',
  };

  const iconBg = {
    default: 'bg-accent/10',
    danger: 'bg-destructive/10',
    success: 'bg-primary/10',
    warning: 'bg-amber-400/10',
  };

  const TrendIcon = trend?.value === 0 ? Minus : trend?.value && trend.value > 0 ? TrendingUp : TrendingDown;
  const trendColor = trend?.value === 0 ? 'text-muted-foreground' : trend?.value && trend.value > 0 ? 'text-destructive' : 'text-primary';

  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3 hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between">
        <p className="text-xs text-muted-foreground tracking-wide uppercase font-medium">{title}</p>
        <div className={cn('h-8 w-8 rounded-md flex items-center justify-center shrink-0', iconBg[variant])}>
          <Icon className={cn('h-4 w-4', variantStyles[variant])} />
        </div>
      </div>

      <div>
        <p className={cn('text-2xl font-bold tracking-tight', mono && 'font-mono', variantStyles[variant])}>
          {value}
        </p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      {trend && (
        <div className={cn('flex items-center gap-1 text-xs', trendColor)}>
          <TrendIcon className="h-3 w-3" />
          <span className="font-mono">{Math.abs(trend.value)}%</span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
