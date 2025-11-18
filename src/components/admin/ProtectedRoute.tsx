import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (import.meta.env.DEV) {
    console.log('🔒 ProtectedRoute check:', { loading, isAuthenticated, hasUser: !!user });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (import.meta.env.DEV) {
      console.log('❌ Not authenticated, redirecting to login');
    }
    return <Navigate to="/admin/login" replace />;
  }

  if (import.meta.env.DEV) {
    console.log('✅ Authenticated, rendering protected content');
  }

  return <>{children}</>;
};

