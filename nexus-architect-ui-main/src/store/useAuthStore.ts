import { create } from 'zustand';

type User = {
  name: string;
  email: string;
  role: string;
  plan: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => boolean;
  loginDemo: () => void;
  logout: () => void;
  setUser: (user: User) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (email, password) => {
    if (email === 'admin@nexus.ai' && password === 'admin123') {
      set({ isAuthenticated: true, user: { name: 'Admin User', email, role: 'Admin', plan: 'Pro Plan' } });
      return true;
    }
    if (email === 'demo@nexus.ai' && password === 'demo123') {
      set({ isAuthenticated: true, user: { name: 'Demo User', email, role: 'Viewer', plan: 'Demo Plan' } });
      return true;
    }
    return false;
  },
  loginDemo: () => {
    set({ isAuthenticated: true, user: { name: 'Demo User', email: 'demo@nexus.ai', role: 'Viewer', plan: 'Demo Plan' } });
  },
  logout: () => set({ isAuthenticated: false, user: null }),
  setUser: (user) => set({ user, isAuthenticated: true }),
}));

