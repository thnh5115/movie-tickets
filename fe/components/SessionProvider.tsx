'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';

/**
 * SessionProvider: Khởi tạo và kiểm tra session từ backend khi app load
 * Gọi API /auth/session để xác thực session cookie
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Chỉ gọi initialize 1 lần duy nhất
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initialize();
    }
  }, [initialize]);

  return <>{children}</>;
}
