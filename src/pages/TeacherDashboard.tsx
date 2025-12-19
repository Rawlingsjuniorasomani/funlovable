import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { TeacherOverview } from "@/components/teacher/TeacherOverview";
import { TeacherSubjects } from "@/components/teacher/TeacherSubjects";
import { TeacherModules } from "@/components/teacher/TeacherModules";
import { TeacherStudents } from "@/components/teacher/TeacherStudents";
import { TeacherAssignments } from "@/components/teacher/TeacherAssignments";
import { TeacherQuizzes } from "@/components/teacher/TeacherQuizzes";
import { TeacherLiveClasses } from "@/components/teacher/TeacherLiveClasses";
import { TeacherRewards } from "@/components/teacher/TeacherRewards";
import { TeacherMessages } from "@/components/teacher/TeacherMessages";
import { TeacherAnalytics } from "@/components/teacher/TeacherAnalytics";
import { TeacherSettings } from "@/components/teacher/TeacherSettings";
import { TeacherChatPage } from "@/components/teacher/TeacherChatPage";
import { TeacherLessonsPage } from "@/components/teacher/TeacherLessonsPage";

export default function TeacherDashboard() {
  return (
    <SidebarProvider>
      <div
        className="h-screen flex w-full bg-background overflow-hidden"
        style={
          {
            ['--sidebar-background' as any]: '24 95% 53%',
            ['--sidebar-foreground' as any]: '0 0% 100%',
            ['--sidebar-accent' as any]: '24 90% 45%',
            ['--sidebar-accent-foreground' as any]: '0 0% 100%',
            ['--sidebar-border' as any]: '24 80% 40%',
            ['--sidebar-primary' as any]: '0 0% 100%',
            ['--sidebar-primary-foreground' as any]: '24 95% 53%',
          } as React.CSSProperties
        }
      >
        <TeacherSidebar />

        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <DashboardTopbar title="Teacher Dashboard" dashboardType="teacher" />

          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            <Routes>
              <Route index element={<TeacherOverview />} />
              <Route path="subjects" element={<TeacherSubjects />} />
              <Route path="modules" element={<TeacherModules />} />
              <Route path="lessons" element={<TeacherLessonsPage />} />
              <Route path="students" element={<TeacherStudents />} />
              <Route path="assignments" element={<TeacherAssignments />} />
              <Route path="quizzes" element={<TeacherQuizzes />} />
              <Route path="live" element={<TeacherLiveClasses />} />
              <Route path="rewards" element={<TeacherRewards />} />
              <Route path="messages" element={<TeacherMessages />} />
              <Route path="chat" element={<TeacherChatPage />} />
              <Route path="analytics" element={<TeacherAnalytics />} />
              <Route path="settings" element={<TeacherSettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
