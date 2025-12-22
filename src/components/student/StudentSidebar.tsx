import {
  Home, BookOpen, Brain, Trophy, Video, TrendingUp,
  Award, MessageSquare, Bell, Settings, LogOut, Flame, Target, BarChart3, CreditCard
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const learningItems = [
  { title: "Overview", url: "/student", icon: Home },
  { title: "Subjects", url: "/student/subjects", icon: BookOpen },
  { title: "Quizzes", url: "/student/quizzes", icon: Brain },
  { title: "Assignments", url: "/student/assignments", icon: Target },
  { title: "Live Classes", url: "/student/live-classes", icon: Video },
];

const progressItems = [
  { title: "My Progress", url: "/student/progress", icon: TrendingUp },
  { title: "Analytics", url: "/student/analytics", icon: BarChart3 },
  { title: "Achievements", url: "/student/achievements", icon: Award },
  { title: "Leaderboard", url: "/student/leaderboard", icon: Trophy },
];

const communicationItems = [
  { title: "Messages", url: "/student/messages", icon: MessageSquare },
  { title: "Notifications", url: "/student/notifications", icon: Bell, hasBadge: true },
];

export function StudentSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, logout } = useAuthContext();
  const { unreadCount } = useNotifications();

  const isActive = (path: string) => {
    if (path === "/student") return location.pathname === "/student";
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold shadow-sm">
            {user?.avatar || (user?.name?.[0] || 'S').toUpperCase()}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-semibold text-sidebar-foreground truncate">{user?.name || 'Student'}</p>
              <div className="flex items-center gap-1 text-xs text-sidebar-foreground/80">
                <Flame className="w-3 h-3 text-orange-500" />
                <span>0 day streak</span>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Learning</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {learningItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end={item.url === "/student"}>
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
          <SidebarGroupLabel>Progress</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {progressItems.map((item) => (
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
                    <NavLink to={item.url} className="relative">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      {item.hasBadge && unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/student/subscription")}>
                  <NavLink to="/student/subscription">
                    <CreditCard className="w-4 h-4" />
                    <span>Subscription</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/student/settings")}>
                  <NavLink to="/student/settings">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
            collapsed && "justify-center"
          )}
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
