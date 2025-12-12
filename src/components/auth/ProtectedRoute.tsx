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
      admin: '/admin',
    };
    return <Navigate to={dashboardRoutes[user.role] || '/'} replace />;
  }

  // Check if parent needs to complete onboarding
  if (requireOnboarding && user.role === 'parent' && !user.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
