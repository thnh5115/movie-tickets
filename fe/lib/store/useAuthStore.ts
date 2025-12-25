import { create } from 'zustand';
import { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_session');
    }
    set({ user: null });
  },
  initialize: () => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('auth_session');
      if (session) {
        try {
          const user = JSON.parse(session);
          set({ user, isLoading: false });
        } catch {
          set({ user: null, isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    }
  },
}));
