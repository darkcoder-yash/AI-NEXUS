import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initialized, checkMFAStatus, user } = useAuthStore();
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
    if (initialized && isAuthenticated) verifyMFA();
  }, [isAuthenticated, initialized, user, checkMFAStatus]);

  // If auth is not yet initialized, show a neutral loading state
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] text-teal-500 font-black uppercase tracking-[0.4em] animate-pulse">Syncing_Neural_Link...</p>
        </div>
      </div>
    );
  }

  // If explicitly not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If MFA is enabled but not verified, redirect to MFA challenge
  if (user?.mfa_enabled && mfaVerified === false) {
    return <Navigate to="/mfa-challenge" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
