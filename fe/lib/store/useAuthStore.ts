import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      
      setUser: (user) => {
        set({ user, isLoading: false, isInitialized: true });
      },
      
      // Logout đơn giản: xóa user khỏi state (persist sẽ tự xóa localStorage)
      logout: () => {
        set({ user: null, isInitialized: true });
      },
      
      // Initialize: đọc từ localStorage thông qua persist middleware
      // Zustand persist tự động hydrate state từ localStorage khi app load
      initialize: () => {
        const currentUser = get().user;
        set({ isLoading: false, isInitialized: true, user: currentUser });
      },
    }),
    {
      name: 'auth-storage', // key trong localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }), // chỉ persist user, không persist loading states
      onRehydrateStorage: () => (state) => {
        // Callback khi hydrate xong từ localStorage
        if (state) {
          state.isInitialized = true;
          state.isLoading = false;
        }
      },
    }
  )
);
