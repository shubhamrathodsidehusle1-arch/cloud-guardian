import { useState } from 'react';
import { mockServicePlugins } from '@/data/mockServicePlugins';
import { ServiceCard } from './ServiceCard';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ServiceRegistry() {
  const [plugins, setPlugins] = useState(mockServicePlugins);

  const enabled = plugins.filter(p => p.enabled).length;
  const totalResources = plugins.reduce((s, p) => s + p.resourceCount, 0);
  const totalFlagged = plugins.reduce((s, p) => s + p.flaggedCount, 0);

  return (
    <div className="space-y-4">
      {/* Registry header stats */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-xs">
          <span className="text-muted-foreground">
            <span className="text-primary font-mono font-semibold">{enabled}</span>/{plugins.length} plugins enabled
          </span>
          <span className="text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">{totalResources.toLocaleString()}</span> total resources
          </span>
          <span className="text-muted-foreground">
            <span className="text-destructive font-mono font-semibold">{totalFlagged}</span> flagged
          </span>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-muted-foreground">
          <Plus className="h-3 w-3" />Register Plugin
        </Button>
      </div>

      {/* Active plugins */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Plugins</span>
          <Badge variant="outline" className="text-[10px] text-primary border-primary/30 bg-primary/5">{enabled}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {plugins.filter(p => p.enabled).map(plugin => (
            <ServiceCard key={plugin.id} plugin={plugin} />
          ))}
        </div>
      </div>

      {/* Inactive plugins */}
      {plugins.some(p => !p.enabled) && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available Plugins</span>
            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">{plugins.filter(p => !p.enabled).length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {plugins.filter(p => !p.enabled).map(plugin => (
              <ServiceCard key={plugin.id} plugin={plugin} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
