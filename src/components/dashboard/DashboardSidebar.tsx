import { Link, useLocation } from "react-router-dom";
import { 
  Home, BookOpen, Trophy, Calendar, Settings, User, 
  LogOut, GraduationCap, Users, BarChart3, MessageSquare, CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { PushNotificationSettings } from "@/components/notifications/PushNotificationManager";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface DashboardSidebarProps {
  userType: "student" | "parent";
  userName: string;
  userAvatar?: string;
}

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: Home },
  { label: "My Lessons", href: "/student/lessons", icon: BookOpen },
  { label: "Quizzes", href: "/quizzes", icon: Trophy },
  { label: "Achievements", href: "/achievements", icon: Trophy },
  { label: "Leaderboard", href: "/leaderboard", icon: BarChart3 },
  { label: "Schedule", href: "/student/schedule", icon: Calendar },
  { label: "Settings", href: "/student/settings", icon: Settings },
];

const parentNav: NavItem[] = [
  { label: "Dashboard", href: "/parent", icon: Home },
  { label: "Children", href: "/parent/children", icon: Users },
  { label: "Progress Reports", href: "/parent/reports", icon: BarChart3 },
  { label: "Messages", href: "/parent/messages", icon: MessageSquare },
  { label: "Payments", href: "/parent/payments", icon: CreditCard },
  { label: "Settings", href: "/parent/settings", icon: Settings },
];

const navMap = {
  student: studentNav,
  parent: parentNav,
};

const roleColors = {
  student: "from-primary to-tertiary",
  parent: "from-secondary to-primary",
};

export function DashboardSidebar({ userType, userName, userAvatar }: DashboardSidebarProps) {
  const location = useLocation();
  const navItems = navMap[userType];

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      {/* Profile Section */}
      <div className={cn("p-6 bg-gradient-to-r text-primary-foreground", roleColors[userType])}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-background/20 flex items-center justify-center text-xl font-bold">
            {userAvatar || userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{userName}</h3>
            <p className="text-sm opacity-80 capitalize">{userType}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <NotificationCenter />
          <PushNotificationSettings />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Link
          to="/login"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </Link>
      </div>
    </aside>
  );
}
