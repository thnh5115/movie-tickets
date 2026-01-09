'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';

/**
 * SessionProvider: Đợi Zustand hydrate từ localStorage trước khi render children
 * Giải quyết vấn đề hydration mismatch giữa server và client
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Đợi Zustand persist hydrate xong từ localStorage
    // Sau đó đánh dấu isInitialized = true
    initialize();
    setIsHydrated(true);
  }, [initialize]);

  // Tránh hydration mismatch: đợi client hydrate xong mới render
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
