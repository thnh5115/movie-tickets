'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Chỉ redirect khi đã hydrate xong và không có user
    if (isInitialized && !user) {
      router.push('/dang-nhap');
    }
  }, [user, isInitialized, router]);

  // Đợi hydrate hoàn thành
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Nếu không có user thì không render (sẽ redirect)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
