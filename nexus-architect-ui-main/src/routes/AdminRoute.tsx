import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { ProtectedRoute } from './ProtectedRoute';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();

  if (!initialized) return null; // Let ProtectedRoute handle loading

  if (user?.role !== 'admin') {
    return <Navigate to="/nexus" replace />;
  }

  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
