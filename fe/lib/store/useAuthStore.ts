import { create } from 'zustand';
import { User } from '@/lib/types';
import fetchClient from '@/lib/api/fetchClient';

// Flag để tránh gọi initialize nhiều lần
let isInitializing = false;
let hasInitialized = false;

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean; // Đánh dấu đã check session xong chưa
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isInitialized: false, // Ban đầu chưa initialize
  setUser: (user) => {
    hasInitialized = true; // Đánh dấu đã initialize khi set user
    set({ user, isLoading: false, isInitialized: true });
  },
  
  // Logout gọi API backend để xóa session
  logout: async () => {
    try {
      await fetchClient.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    hasInitialized = false; // Reset để có thể initialize lại
    set({ user: null, isInitialized: false });
  },
  
  // Initialize kiểm tra session từ backend
  initialize: async () => {
    // Tránh gọi initialize nhiều lần
    if (isInitializing || hasInitialized) {
      return;
    }
    
    isInitializing = true;
    
    try {
      const data = await fetchClient.request('/auth/session', { method: 'GET' });
      if (data?.authenticated) {
        const user: User = {
          id: String(data.userId),
          email: data.email,
          name: data.name,
        };
        set({ user, isLoading: false, isInitialized: true });
      } else {
        set({ user: null, isLoading: false, isInitialized: true });
      }
    } catch (error) {
      console.error('Session check error:', error);
      set({ user: null, isLoading: false, isInitialized: true });
    } finally {
      isInitializing = false;
      hasInitialized = true;
    }
  },
}));
