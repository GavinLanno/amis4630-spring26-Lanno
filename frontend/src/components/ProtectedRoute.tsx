import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import type { AuthSession } from '../types/auth';

interface ProtectedRouteProps {
  children: ReactElement;
  requiredRole?: AuthSession['role'];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { state } = useAuthContext();

  if (!state.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && state.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
