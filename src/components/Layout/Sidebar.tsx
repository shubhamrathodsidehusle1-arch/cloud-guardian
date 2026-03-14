import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard, Scan, Server, BarChart2, DollarSign, Lightbulb, Zap, ChevronRight,
} from 'lucide-react';

const navItems = [
  { title: 'Overview', url: '/', icon: LayoutDashboard },
  { title: 'Scans', url: '/scans', icon: Scan },
  { title: 'Instances', url: '/instances', icon: Server },
  { title: 'Metrics', url: '/metrics', icon: BarChart2 },
  { title: 'Cost Analysis', url: '/cost-analysis', icon: DollarSign },
  { title: 'Recommendations', url: '/recommendations', icon: Lightbulb },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary shrink-0">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-wider text-primary font-mono">KILOCLAW</span>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase">AWS Inspector</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-widest text-muted-foreground uppercase">
            {!collapsed ? 'Navigation' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-primary/15 text-primary font-medium border-l-2 border-primary'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                        {!collapsed && <span>{item.title}</span>}
                        {!collapsed && isActive && <ChevronRight className="ml-auto h-3 w-3 text-primary" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="text-[10px] text-muted-foreground font-mono">
            <span className="text-primary">●</span> LIVE · v2.4.1
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
