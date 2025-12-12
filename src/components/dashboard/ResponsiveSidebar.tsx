import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, BookOpen, Trophy, Calendar, Settings, 
  LogOut, Users, BarChart3, MessageSquare, CreditCard, Menu, X, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { PushNotificationSettings } from "@/components/notifications/PushNotificationManager";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface ResponsiveSidebarProps {
  userType: "student" | "parent";
  userName: string;
  userAvatar?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
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

function SidebarContent({ userType, userName, userAvatar, onItemClick }: ResponsiveSidebarProps & { onItemClick?: () => void }) {
  const location = useLocation();
  const navItems = navMap[userType];

  return (
    <div className="flex flex-col h-full">
      {/* Profile Section */}
      <div className={cn("p-6 bg-gradient-to-r text-primary-foreground", roleColors[userType])}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-background/20 flex items-center justify-center text-xl font-bold">
            {userAvatar || userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{userName}</h3>
            <p className="text-sm opacity-80 capitalize">{userType}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <NotificationCenter />
          <PushNotificationSettings />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Link
          to="/login"
          onClick={onItemClick}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </Link>
      </div>
    </div>
  );
}

export function ResponsiveSidebar({ userType, userName, userAvatar }: ResponsiveSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border h-screen sticky top-0 flex-col shrink-0">
        <SidebarContent userType={userType} userName={userName} userAvatar={userAvatar} />
      </aside>

      {/* Mobile Menu Button */}
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
          <SidebarContent 
            userType={userType} 
            userName={userName} 
            userAvatar={userAvatar} 
            onItemClick={() => setIsOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

// Topbar for mobile
export function MobileTopbar({ title, userName, userType }: { title?: string; userName?: string; userType?: "student" | "parent" | "teacher" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="md:hidden sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 ml-12">
          <h1 className="font-semibold text-foreground truncate">{title || "Dashboard"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}
