import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Subjects from "./pages/Subjects";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import ParentRegistrationFlow from "./pages/ParentRegistrationFlow";
import NotFound from "./pages/NotFound";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Checkout from "./pages/Checkout";
import QuizPage from "./pages/QuizPage";
import LessonPage from "./pages/LessonPage";
import QuizSelectionPage from "./pages/QuizSelectionPage";
import QuizPlayPage from "./pages/QuizPlayPage";
import AchievementsPage from "./pages/AchievementsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import TeacherAuth from "./pages/TeacherAuth";
import ParentAuth from "./pages/ParentAuth";
import StudentAuth from "./pages/StudentAuth";
import { PaymentVerify } from "./pages/PaymentVerify";
import AuthSelector from "./pages/AuthSelector";
import LiveClassSession from "./pages/LiveClassSession";
import LearningPage from "./pages/student/LearningPage";
import SubjectDetailPage from "./pages/SubjectDetailPage";
import ScrollToTop from "./components/layout/ScrollToTop";
import HelpCenter from "./pages/HelpCenter";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subjects/:subjectId" element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'parent']}>
                <SubjectDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/login" element={<AuthSelector />} />
            <Route path="/register" element={<AuthSelector />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/student/auth" element={<StudentAuth />} />
            <Route path="/teacher/auth" element={<TeacherAuth />} />
            <Route path="/parent/auth" element={<ParentAuth />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/parent/register-flow" element={<ParentRegistrationFlow />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/verify" element={<PaymentVerify />} />
            <Route path="/student/*" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/learning/:subjectId" element={
              <ProtectedRoute allowedRoles={['student']}>
                <LearningPage />
              </ProtectedRoute>
            } />
            <Route path="/parent/*" element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/teacher/*" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']} requireOnboarding={false}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/super-admin/*" element={
              <ProtectedRoute allowedRoles={['admin']} requireOnboarding={false}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/quizzes" element={<QuizSelectionPage />} />
            <Route path="/quiz/:quizId" element={<QuizPlayPage />} />
            <Route path="/lesson" element={<LessonPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/live/:classId" element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'parent']}>
                <LiveClassSession />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
