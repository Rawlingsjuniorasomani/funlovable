import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { StudentOverview } from "@/components/student/StudentOverview";
import { StudentSubjects } from "@/components/student/StudentSubjects";
import { StudentQuizzes } from "@/components/student/StudentQuizzes";
import { StudentAssignments } from "@/components/student/StudentAssignments";
import { StudentLiveClasses } from "@/components/student/StudentLiveClasses";
import { StudentProgress } from "@/components/student/StudentProgress";
import { StudentAchievements } from "@/components/student/StudentAchievements";
import { StudentLeaderboard } from "@/components/student/StudentLeaderboard";
import { StudentMessages } from "@/components/student/StudentMessages";
import { StudentNotifications } from "@/components/student/StudentNotifications";
import { StudentSettings } from "@/components/student/StudentSettings";
import { StudentAnalytics } from "@/components/student/StudentAnalytics";
import { useContentNotifications } from "@/hooks/useContentNotifications";

export default function StudentDashboard() {
  // Get student ID and enrolled subjects (in real app, from auth context)
  const studentId = localStorage.getItem('current_user_id') || 'student_1';
  const enrolledSubjects = JSON.parse(localStorage.getItem(`student_subjects_${studentId}`) || '["math", "science", "english"]');

  // Connect real-time notifications for teacher content
  useContentNotifications(studentId, enrolledSubjects);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <StudentSidebar />

        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <DashboardTopbar title="Student Dashboard" dashboardType="student" />

          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <Routes>
              <Route index element={<StudentOverview />} />
              <Route path="subjects" element={<StudentSubjects />} />
              <Route path="quizzes" element={<StudentQuizzes />} />
              <Route path="assignments" element={<StudentAssignments />} />
              <Route path="live-classes" element={<StudentLiveClasses />} />
              <Route path="progress" element={<StudentProgress />} />
              <Route path="achievements" element={<StudentAchievements />} />
              <Route path="leaderboard" element={<StudentLeaderboard />} />
              <Route path="messages" element={<StudentMessages />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="analytics" element={<StudentAnalytics />} />
              <Route path="settings" element={<StudentSettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
