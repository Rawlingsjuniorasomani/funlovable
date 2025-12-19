import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { StudentOverview } from "@/components/student/StudentOverview";
import { StudentSubjects } from "@/components/student/StudentSubjects";
import { StudentQuizzes } from "@/components/student/StudentQuizzes";
import { StudentQuizResults } from "@/components/student/StudentQuizResults";
import { StudentAssignments } from "@/components/student/StudentAssignments";
import { StudentLiveClasses } from "@/components/student/StudentLiveClasses";
import { StudentProgress } from "@/components/student/StudentProgress";
import { StudentAchievements } from "@/components/student/StudentAchievements";
import { StudentLeaderboard } from "@/components/student/StudentLeaderboard";
import { StudentMessages } from "@/components/student/StudentMessages";
import { StudentNotifications } from "@/components/student/StudentNotifications";
import { StudentSettings } from "@/components/student/StudentSettings";
import { StudentAnalytics } from "@/components/student/StudentAnalytics";
import { StudentLessonsPage } from "@/components/student/StudentLessonsPage";
import { useContentNotifications } from "@/hooks/useContentNotifications";
import { useAuthContext } from "@/contexts/AuthContext";
import { subjectsAPI } from "@/config/api";

export default function StudentDashboard() {
  const { user } = useAuthContext();
  const [enrolledSubjectIds, setEnrolledSubjectIds] = useState<string[]>([]);

  useEffect(() => {
    const loadEnrolled = async () => {
      try {
        const data = await subjectsAPI.getEnrolled();
        const subjectIds = Array.isArray(data) ? data.map((s: any) => s.id).filter(Boolean) : [];
        setEnrolledSubjectIds(subjectIds);
      } catch {
        setEnrolledSubjectIds([]);
      }
    };

    if (user?.id) {
      loadEnrolled();
    }
  }, [user?.id]);

  // Connect real-time notifications for teacher content
  useContentNotifications(user?.id || '', enrolledSubjectIds);

  return (
    <SidebarProvider>
      <div
        className="h-screen flex w-full bg-background overflow-hidden"
        style={
          {
            ['--sidebar-background' as any]: '262 83% 34%',
            ['--sidebar-foreground' as any]: '0 0% 100%',
            ['--sidebar-accent' as any]: '262 75% 28%',
            ['--sidebar-accent-foreground' as any]: '0 0% 100%',
            ['--sidebar-border' as any]: '262 60% 24%',
            ['--sidebar-primary' as any]: '0 0% 100%',
            ['--sidebar-primary-foreground' as any]: '262 83% 34%',
          } as React.CSSProperties
        }
      >
        <StudentSidebar />

        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <DashboardTopbar title="Student Dashboard" dashboardType="student" />

          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            <Routes>
              <Route index element={<StudentOverview />} />
              <Route path="subjects" element={<StudentSubjects />} />
              <Route path="lessons" element={<StudentLessonsPage />} />
              <Route path="quizzes" element={<StudentQuizzes />} />
              <Route path="quizzes/results/:attemptId" element={<StudentQuizResults />} />
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
