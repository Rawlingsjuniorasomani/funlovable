import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, BookOpen, Layers, Users, FileText, Target, Video,
  Gift, MessageSquare, BarChart3, Settings, LogOut, MessageCircle, PenTool, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { PushNotificationSettings } from "@/components/notifications/PushNotificationManager";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthContext } from "@/contexts/AuthContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const teacherNav: NavItem[] = [
  { label: "Dashboard", href: "/teacher", icon: Home },
  { label: "Subjects", href: "/teacher/subjects", icon: BookOpen },
  { label: "Modules", href: "/teacher/modules", icon: Layers },
  { label: "Lessons", href: "/teacher/lessons", icon: PenTool },
  { label: "Students", href: "/teacher/students", icon: Users },
  { label: "Assignments", href: "/teacher/assignments", icon: FileText, badge: 5 },
  { label: "Quizzes", href: "/teacher/quizzes", icon: Target },
  { label: "Live Classes", href: "/teacher/live", icon: Video },
  { label: "Rewards", href: "/teacher/rewards", icon: Gift },
  { label: "Messages", href: "/teacher/messages", icon: MessageSquare },
  { label: "Chat", href: "/teacher/chat", icon: MessageCircle, badge: 3 },
  { label: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
];

interface ResponsiveTeacherSidebarProps {
  userName?: string;
  onItemClick?: () => void;
}

function SidebarContent({ userName, onItemClick }: ResponsiveTeacherSidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuthContext();

  const displayName = userName || user?.name || "Teacher";

  const isActiveRoute = (href: string) => {
    if (href === "/teacher") {
      return location.pathname === "/teacher";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full">
      { }
      <div className="p-6 bg-gradient-to-r from-tertiary to-quaternary text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-background/20 flex items-center justify-center text-xl font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{displayName}</h3>
            <p className="text-sm opacity-80">Teacher</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <NotificationCenter />
          <PushNotificationSettings />
        </div>
      </div>

      { }
      <nav className="flex-1 p-4 space-y-1 overflow-auto">
        {teacherNav.map((item) => {
          const isActive = isActiveRoute(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="font-medium flex-1">{item.label}</span>
              {item.badge && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-bold",
                  isActive
                    ? "bg-primary-foreground text-primary"
                    : "bg-primary text-primary-foreground"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      { }
      <div className="p-4 border-t border-border space-y-1">
        <Link
          to="/teacher/settings"
          onClick={onItemClick}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            location.pathname === "/teacher/settings"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

export function ResponsiveTeacherSidebar({ userName }: ResponsiveTeacherSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      { }
      <aside className="hidden md:flex w-64 bg-card border-r border-border h-screen sticky top-0 flex-col shrink-0">
        <SidebarContent userName={userName} />
      </aside>

      { }
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50 bg-card shadow-md border border-border"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent userName={userName} onItemClick={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
