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
      <div className="min-h-screen flex w-full bg-background">
        <TeacherSidebar />

        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <DashboardTopbar title="Teacher Dashboard" dashboardType="teacher" />

          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
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
