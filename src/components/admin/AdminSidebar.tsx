import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, BookOpen, Layers, FileText, Target, Video,
  Trophy, CreditCard, BarChart3, Bell, Settings, ChevronLeft, ChevronRight,
  GraduationCap, UserCheck, Shield, Gift, LineChart, FileBarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { BRANDING } from "@/config/branding";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { useAuthContext } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/sys-admin", icon: LayoutDashboard },
  { label: "Admins", href: "/sys-admin/admins", icon: Shield },
  { label: "Parents", href: "/sys-admin/parents", icon: Users },
  { label: "Students", href: "/sys-admin/students", icon: GraduationCap },
  { label: "Teachers", href: "/sys-admin/teachers", icon: UserCheck },
  { label: "Subjects", href: "/sys-admin/subjects", icon: BookOpen },
  { label: "Modules", href: "/sys-admin/modules", icon: Layers },
  { label: "Lessons", href: "/sys-admin/lessons", icon: FileText },
  { label: "Assignments", href: "/sys-admin/assignments", icon: FileText },
  { label: "Quizzes", href: "/sys-admin/quizzes", icon: Target },
  { label: "Live Classes", href: "/sys-admin/live-classes", icon: Video },
  { label: "Rewards", href: "/sys-admin/rewards", icon: Trophy },
  { label: "Payments", href: "/sys-admin/payments", icon: CreditCard },
  { label: "Analytics", href: "/sys-admin/analytics", icon: BarChart3 },
  { label: "Notifications", href: "/sys-admin/notifications", icon: Bell },
  { label: "Settings", href: "/sys-admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { notifications, getUnreadByType, loadNotifications } = useAdminNotifications();
  const { user } = useAuthContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user?.role !== 'admin') return;
    loadNotifications();

    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const getNotificationBadge = (href: string) => {

    if (href === "/sys-admin/parents") return getUnreadByType("new_parent") + getUnreadByType("new_subscription");
    if (href === "/sys-admin/teachers") return getUnreadByType("teacher_approval");
    if (href === "/sys-admin/students") return getUnreadByType("new_student");
    if (href === "/sys-admin/payments") return getUnreadByType("new_payment");
    if (href === "/sys-admin/notifications") return notifications.filter(n => !n.read).length;
    return 0;
  };

  const visibleNavItems = navItems.filter(item => {

    const isSuperOnly = ["Settings"].includes(item.label);
    if (isSuperOnly) return user?.is_super_admin;


    if (item.label === "Admins") return !user?.is_super_admin;


    if (item.label === "Payments") return true;


    return true;
  });

  return (
    <aside className={cn(
      "h-screen bg-orange-600 text-white flex flex-col transition-all duration-300 sticky top-0 border-r-0",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-white text-sm">{BRANDING.schoolShortName} Admin</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="shrink-0 text-white hover:bg-white/10 hover:text-white">
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== "/sys-admin" && location.pathname.startsWith(item.href));
          const badgeCount = getNotificationBadge(item.href);

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative",
                isActive
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-white/90 hover:bg-white/10 hover:text-white",
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
