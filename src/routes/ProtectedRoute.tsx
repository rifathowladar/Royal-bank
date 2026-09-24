import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, useToast } from '../hooks/index.ts';
import { LoadingState } from '../components/ui/LoadingState.tsx';

interface ProtectedRouteProps {
  requiredRole?: 'customer' | 'admin';
  redirectTo?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  redirectTo,
  children,
}) => {
  const { user, isLoading, isCustomer, isAdmin } = useAuth();
  const location = useLocation();
  const { warning } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <LoadingState type="spinner" message="Authenticating credentials with Royal Bank Core..." />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    const fallbackRedirect = requiredRole === 'admin' ? '/admin/login' : '/bank/login';
    return <Navigate to={redirectTo || fallbackRedirect} state={{ from: location }} replace />;
  }

  // Role validation
  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location, roleMismatch: true }} replace />;
  }

  if (requiredRole === 'customer' && !isCustomer) {
    // Admin trying to view customer route is permitted as supervisory view or redirected
    return children ? <>{children}</> : <Outlet />;
  }

  return children ? <>{children}</> : <Outlet />;
};
