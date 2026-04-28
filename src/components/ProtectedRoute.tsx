import { Navigate } from 'react-router-dom';
import { usePinAuth } from '@/hooks/usePinAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading } = usePinAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/biopage/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/biopage/no-access" replace />;
  }

  return <>{children}</>;
}
