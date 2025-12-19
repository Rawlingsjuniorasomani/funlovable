import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { UserRole } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, allowedRoles, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect admins to admin login
    if (allowedRoles?.includes('admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoutes: Record<string, string> = {
      student: '/student',
      teacher: '/teacher',
      parent: '/parent',
      admin: user.is_super_admin ? '/super-admin' : '/admin',
    };
    return <Navigate to={dashboardRoutes[user.role] || '/'} replace />;
  }

  // Check if teacher needs approval before accessing dashboard
  if (allowedRoles?.includes('teacher') && user.role === 'teacher') {
    if (!user.is_approved) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md text-center">
            <div className="mb-4 text-4xl">⏳</div>
            <h1 className="text-2xl font-bold mb-2">Pending Approval</h1>
            <p className="text-muted-foreground mb-4">
              Your teacher account is awaiting admin approval. We'll notify you once your account has been approved.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
  }

  // Check if parent needs to complete onboarding
  if (requireOnboarding && user.role === 'parent') {
    const isOnboarded = user.is_onboarded ?? user.onboardingComplete ?? false;
    if (!isOnboarded) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <>{children}</>;
}
