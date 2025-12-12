import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, BookOpen, Layers, FileText, Target, Video,
  Trophy, CreditCard, BarChart3, Bell, Settings, ChevronLeft, ChevronRight,
  GraduationCap, UserCheck, Users2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BRANDING } from "@/config/branding";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Parents", href: "/admin/parents", icon: Users },
  { label: "Students", href: "/admin/students", icon: GraduationCap },
  { label: "Teachers", href: "/admin/teachers", icon: UserCheck },
  { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
  { label: "Modules", href: "/admin/modules", icon: Layers },
  { label: "Lessons", href: "/admin/lessons", icon: FileText },
  { label: "Assignments", href: "/admin/assignments", icon: FileText },
  { label: "Quizzes", href: "/admin/quizzes", icon: Target },
  { label: "Live Classes", href: "/admin/live-classes", icon: Video },
  { label: "Rewards", href: "/admin/rewards", icon: Trophy },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { notifications, getUnreadByType } = useAdminNotifications();

  const getNotificationBadge = (href: string) => {
    if (href === "/admin/parents") return getUnreadByType("new_parent") + getUnreadByType("new_subscription");
    if (href === "/admin/teachers") return getUnreadByType("teacher_approval");
    if (href === "/admin/students") return getUnreadByType("new_student");
    if (href === "/admin/payments") return getUnreadByType("new_payment");
    if (href === "/admin/notifications") return notifications.filter(n => !n.read).length;
    return 0;
  };

  return (
    <aside className={cn(
      "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 sticky top-0",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-sm">{BRANDING.schoolShortName} Admin</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="shrink-0">
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== "/admin" && location.pathname.startsWith(item.href));
          const badgeCount = getNotificationBadge(item.href);

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="relative">
                <item.icon className="w-5 h-5 shrink-0" />
                {badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <span className="text-sm font-medium flex-1">{item.label}</span>
              )}
              {!isCollapsed && badgeCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
                  {badgeCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
