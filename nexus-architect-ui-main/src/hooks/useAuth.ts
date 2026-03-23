import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabaseClient';

export function useAuth() {
  const { user, isAuthenticated, loading, initialized, logout, checkMFAStatus } = useAuthStore();

  const enrollMFA = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp'
    });
    return { data, error };
  };

  const verifyMFA = async (factorId: string, code: string) => {
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      code
    });
    return { data, error };
  };

  const challengeMFA = async (factorId: string) => {
    const { data, error } = await supabase.auth.mfa.challenge({ factorId });
    return { data, error };
  };

  return {
    user,
    isAuthenticated,
    loading,
    initialized,
    logout,
    enrollMFA,
    verifyMFA,
    challengeMFA,
    checkMFAStatus
  };
}
