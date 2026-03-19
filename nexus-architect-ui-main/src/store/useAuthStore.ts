import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  loginDemo: () => void;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  loginDemo: () => {
    set({ 
      isAuthenticated: true, 
      user: { 
        id: 'demo-id',
        name: 'Demo User', 
        email: 'demo@nexus.ai', 
        role: 'Viewer', 
        plan: 'Demo Plan' 
      } 
    });
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, user: null });
  },
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    useAuthStore.getState().setUser({
      id: session.user.id,
      name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
      email: session.user.email || '',
      role: 'User',
      plan: 'Standard'
    });
  } else {
    useAuthStore.getState().setUser(null);
  }
});
