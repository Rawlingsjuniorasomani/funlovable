import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileText,
  Users,
  ClipboardList,
  Brain,
  Video,
  Award,
  MessageSquare,
  BarChart3,
  Settings,
  GraduationCap,
  LogOut,
  PenTool,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BRANDING } from "@/config/branding";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { title: "Overview", icon: LayoutDashboard, path: "/teacher" },
  { title: "Subjects", icon: BookOpen, path: "/teacher/subjects" },
  { title: "Modules", icon: Layers, path: "/teacher/modules" },
  { title: "Lessons", icon: PenTool, path: "/teacher/lessons" },
  { title: "Students", icon: Users, path: "/teacher/students" },
  { title: "Assignments", icon: ClipboardList, path: "/teacher/assignments" },
  { title: "Quizzes", icon: Brain, path: "/teacher/quizzes" },
  { title: "Live Classes", icon: Video, path: "/teacher/live" },
  { title: "Rewards", icon: Award, path: "/teacher/rewards" },
  { title: "Messages", icon: MessageSquare, path: "/teacher/messages" },
  { title: "Analytics", icon: BarChart3, path: "/teacher/analytics" },
  { title: "Settings", icon: Settings, path: "/teacher/settings" },
];

export function TeacherSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6 text-sidebar-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-sidebar-foreground">{BRANDING.schoolShortName}</span>
              <span className="text-xs text-sidebar-foreground/80">Teacher Portal</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== "/teacher" && location.pathname.startsWith(item.path));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.path}
                      >
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-sidebar-foreground font-bold">
              {user?.name?.charAt(0) || 'T'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-sidebar-foreground">{user?.name || 'Teacher'}</p>
              <p className="text-xs text-sidebar-foreground/80 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/90 hover:bg-white/15 hover:text-sidebar-foreground transition-colors w-full mt-2",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
