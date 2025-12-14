import {
  Home, Users, BookOpen, FileText, Brain, Video, TrendingUp,
  Trophy, MessageSquare, CreditCard, Settings, LogOut, Bell, BarChart3
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { title: "Overview", url: "/parent", icon: Home },
  { title: "Children", url: "/parent/children", icon: Users },
  { title: "Subjects", url: "/parent/subjects", icon: BookOpen },
  { title: "Assignments", url: "/parent/assignments", icon: FileText },
  { title: "Quizzes", url: "/parent/quizzes", icon: Brain },
  { title: "Live Classes", url: "/parent/live-classes", icon: Video },
];

const trackingItems = [
  { title: "Performance", url: "/parent/performance", icon: TrendingUp },
  { title: "Analytics", url: "/parent/analytics", icon: BarChart3 },
  { title: "Rewards", url: "/parent/rewards", icon: Trophy },
];

const communicationItems = [
  { title: "Messages", url: "/parent/messages", icon: MessageSquare },
  { title: "Notifications", url: "/parent/notifications", icon: Bell },
];

const accountItems = [
  { title: "Subscription", url: "/parent/subscription", icon: CreditCard },
  { title: "Settings", url: "/parent/settings", icon: Settings },
];

export function ParentSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, logout } = useAuthContext();

  const isActive = (path: string) => {
    if (path === "/parent") return location.pathname === "/parent";
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-tertiary to-secondary flex items-center justify-center text-primary-foreground font-bold">
            {user?.avatar || 'P'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-semibold text-foreground truncate">{user?.name || 'Parent'}</p>
              <p className="text-xs text-muted-foreground">Parent Account</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end={item.url === "/parent"}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tracking</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {trackingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Communication</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communicationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="ghost"
          className={cn("w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10", collapsed && "justify-center")}
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
