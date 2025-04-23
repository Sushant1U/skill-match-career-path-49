
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();

  // Show loading or redirect while we're checking authentication
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If role check is required and user doesn't have the allowed role
  if (allowedRole && userRole !== allowedRole) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'student') {
      return <Navigate to="/student-dashboard" />;
    }
    if (userRole === 'employer') {
      return <Navigate to="/employer-dashboard" />;
    }
    // Fallback to login if role is unknown
    return <Navigate to="/login" />;
  }

  // If everything is good, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
