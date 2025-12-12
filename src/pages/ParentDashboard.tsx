import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ParentSidebar } from "@/components/parent/ParentSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { ParentOverview } from "@/components/parent/ParentOverview";
import { ChildrenManagement } from "@/components/parent/ChildrenManagement";
import { ParentSubjects } from "@/components/parent/ParentSubjects";
import { ParentAssignments } from "@/components/parent/ParentAssignments";
import { ParentQuizzes } from "@/components/parent/ParentQuizzes";
import { ParentLiveClasses } from "@/components/parent/ParentLiveClasses";
import { ParentPerformance } from "@/components/parent/ParentPerformance";
import { ParentRewards } from "@/components/parent/ParentRewards";
import { ParentMessages } from "@/components/parent/ParentMessages";
import { ParentNotifications } from "@/components/parent/ParentNotifications";
import { ParentSettings } from "@/components/parent/ParentSettings";
import { ParentChatPage } from "@/components/parent/ParentChatPage";
import { EnhancedParentChildProgress } from "@/components/parent/EnhancedParentChildProgress";
import { EnhancedParentPayments } from "@/components/parent/EnhancedParentPayments";
import { ParentAnalytics } from "@/components/parent/ParentAnalytics";

export default function ParentDashboard() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ParentSidebar />

        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <DashboardTopbar title="Parent Dashboard" dashboardType="parent" />

          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <Routes>
              <Route index element={<ParentOverview />} />
              <Route path="children" element={<ChildrenManagement />} />
              <Route path="child/:childId" element={<EnhancedParentChildProgress />} />
              <Route path="subjects" element={<ParentSubjects />} />
              <Route path="assignments" element={<ParentAssignments />} />
              <Route path="quizzes" element={<ParentQuizzes />} />
              <Route path="live-classes" element={<ParentLiveClasses />} />
              <Route path="performance" element={<ParentPerformance />} />
              <Route path="progress" element={<ParentPerformance />} />
              <Route path="rewards" element={<ParentRewards />} />
              <Route path="messages" element={<ParentMessages />} />
              <Route path="chat" element={<ParentChatPage />} />
              <Route path="notifications" element={<ParentNotifications />} />
              <Route path="payments" element={<EnhancedParentPayments />} />
              <Route path="analytics" element={<ParentAnalytics />} />
              <Route path="settings" element={<ParentSettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
