import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, checkMFAStatus } = useAuthStore();
  const [mfaVerified, setMfaVerified] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const verifyMFA = async () => {
      if (user?.mfa_enabled) {
        const isVerified = await checkMFAStatus();
        setMfaVerified(isVerified);
      } else {
        setMfaVerified(true);
      }
    };
    if (user) verifyMFA();
  }, [user, checkMFAStatus]);

  if (loading || (user && mfaVerified === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/nexus" replace />;
  }

  if (user.mfa_enabled && !mfaVerified) {
    // Redirect to a dedicated MFA challenge page if implemented, or logout
    return <Navigate to="/mfa-challenge" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
