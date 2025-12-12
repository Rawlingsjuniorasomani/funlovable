import { Routes, Route } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminParents } from "@/components/admin/AdminParents";
import { AdminStudents } from "@/components/admin/AdminStudents";
import { AdminTeachers } from "@/components/admin/AdminTeachers";
import { AdminSubjects } from "@/components/admin/AdminSubjects";
import { AdminModules } from "@/components/admin/AdminModules";
import { AdminLessons } from "@/components/admin/AdminLessons";
import { AdminAssignments } from "@/components/admin/AdminAssignments";
import { AdminQuizzes } from "@/components/admin/AdminQuizzes";
import { AdminLiveClasses } from "@/components/admin/AdminLiveClasses";
import { AdminRewards } from "@/components/admin/AdminRewards";
import { AdminPayments } from "@/components/admin/AdminPayments";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { AdminSettings } from "@/components/admin/AdminSettings";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardTopbar title="Admin Panel" dashboardType="admin" />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="parents" element={<AdminParents />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="modules" element={<AdminModules />} />
            <Route path="lessons" element={<AdminLessons />} />
            <Route path="assignments" element={<AdminAssignments />} />
            <Route path="quizzes" element={<AdminQuizzes />} />
            <Route path="live-classes" element={<AdminLiveClasses />} />
            <Route path="rewards" element={<AdminRewards />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
