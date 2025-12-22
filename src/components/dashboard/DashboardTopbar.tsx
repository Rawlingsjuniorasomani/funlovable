import { useState } from "react";
import { Search, Menu, Sun, Moon, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardTopbarProps {
  title?: string;
  dashboardType?: 'student' | 'teacher' | 'parent' | 'admin';
  showSearch?: boolean;
}

export function DashboardTopbar({ title = "Dashboard", dashboardType = "student", showSearch = true }: DashboardTopbarProps) {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const settingsPath = `/${dashboardType}/settings`;

  const gradientColors: Record<string, string> = {
    student: 'from-primary to-tertiary',
    teacher: 'from-tertiary to-quaternary',
    parent: 'from-secondary to-primary',
    admin: 'from-destructive to-primary',
  };

  return (
    <header className="bg-white dark:bg-zinc-950/95 border-b border-border h-16 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 h-full">
        { }
        <div className="flex items-center gap-3">
          {dashboardType !== 'admin' && (
            <SidebarTrigger>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SidebarTrigger>
          )}
          <div className="flex flex-col sm:block">
            <h1 className="font-display font-semibold text-lg">{title}</h1>

            { }
            {(user as any)?.parent_id && (
              <div className="flex items-center gap-2 mt-1 sm:ml-4 sm:mt-0 sm:inline-flex bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded text-xs border border-yellow-500/20">
                <span className="font-semibold">Viewing as Student</span>
                <Button
                  size="sm"
                  variant="link"
                  className="h-auto p-0 text-yellow-700 underline"
                  onClick={() => {
                    sessionStorage.removeItem('viewAsChildId');
                    window.location.href = '/parent';
                  }}
                >
                  Exit View
                </Button>
              </div>
            )}
          </div>
        </div>

        { }
        {showSearch && (
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        { }
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <NotificationDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 hidden sm:flex">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${gradientColors[dashboardType]} flex items-center justify-center text-primary-foreground font-bold text-sm`}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium max-w-24 truncate">{user?.name || 'User'}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={settingsPath} className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={settingsPath} className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
