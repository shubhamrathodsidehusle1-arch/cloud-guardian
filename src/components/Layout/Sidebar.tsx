import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard, Scan, Box, BarChart2, DollarSign, Lightbulb, Zap,
  ChevronRight, Puzzle, Shield,
} from 'lucide-react';

const navItems = [
  { title: 'Overview', url: '/', icon: LayoutDashboard },
  { title: 'Scans', url: '/scans', icon: Scan },
  { title: 'Resources', url: '/resources', icon: Box },
  { title: 'Metrics', url: '/metrics', icon: BarChart2 },
  { title: 'Cost Analysis', url: '/cost-analysis', icon: DollarSign },
  { title: 'Recommendations', url: '/recommendations', icon: Lightbulb },
];

const configItems = [
  { title: 'Services', url: '/services', icon: Puzzle },
  { title: 'Accounts', url: '/accounts', icon: Shield },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
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
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary shrink-0">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-wider text-primary font-mono">CLOUD GUARDIAN</span>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase">AWS Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-widest text-muted-foreground uppercase">
            {!collapsed ? 'Monitor' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => <NavItem key={item.title} item={item} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-widest text-muted-foreground uppercase">
            {!collapsed ? 'Configure' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map(item => <NavItem key={item.title} item={item} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="text-[10px] text-muted-foreground font-mono">
            <span className="text-primary">●</span> LIVE · v3.0.0
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
