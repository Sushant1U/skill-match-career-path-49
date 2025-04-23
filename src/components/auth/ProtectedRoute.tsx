
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole | UserRole[];
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();

  console.log("ProtectedRoute:", { user, userRole, loading, allowedRole });

  // Show loading while we're checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If role check is required and user doesn't have the allowed role
  if (allowedRole) {
    // Handle both single role and array of roles
    const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    
    if (!roles.includes(userRole as string)) {
      console.log(`User role (${userRole}) doesn't match required role (${allowedRole}), redirecting`);
      
      // Redirect to appropriate dashboard based on role
      if (userRole === 'student') {
        return <Navigate to="/student-dashboard" replace />;
      }
      if (userRole === 'employer') {
        return <Navigate to="/employer-dashboard" replace />;
      }
      
      // Fallback to login if role is unknown
      return <Navigate to="/login" replace />;
    }
  }

  console.log("Access granted to protected route");
  // If everything is good, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
