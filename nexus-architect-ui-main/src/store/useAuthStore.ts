import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';

type UserRole = 'user' | 'admin';

type UserProfile = {
  id: string;
  email: string;
  role: UserRole;
  mfa_enabled: boolean;
};

type AuthState = {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  setSession: (session: any) => Promise<void>;
  logout: () => Promise<void>;
  checkMFAStatus: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,
  initialized: false,

  setSession: async (session) => {
    if (!session?.user) {
      set({ isAuthenticated: false, user: null, loading: false, initialized: true });
      return;
    }

    // Set basic auth state immediately to unblock UI
    set({ isAuthenticated: true, loading: false });

    try {
      // Fetch profile in the background
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, mfa_enabled')
        .eq('id', session.user.id)
        .single();

      set({
        initialized: true,
        user: {
          id: session.user.id,
          email: session.user.email!,
          role: (profile?.role as UserRole) || 'user',
          mfa_enabled: profile?.mfa_enabled || false,
        },
      });
    } catch (err) {
      // Fallback to basic user info if profile fetch fails
      set({
        initialized: true,
        user: {
          id: session.user.id,
          email: session.user.email!,
          role: 'user',
          mfa_enabled: false,
        }
      });
    }
  },

  checkMFAStatus: async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) return false;
    return data.currentLevel === 'aal2';
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, user: null, loading: false, initialized: true });
    window.location.href = '/login';
  },
}));

// Faster initialization check
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  useAuthStore.getState().setSession(session);
})();

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});
