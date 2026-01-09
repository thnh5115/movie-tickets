'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Chỉ redirect khi đã check session xong (isInitialized = true) và không có user
    if (isInitialized && !user) {
      router.push('/dang-nhap');
    }
  }, [user, isInitialized, router]);

  // Đợi initialize hoàn thành trước khi hiển thị nội dung
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Nếu đã initialize xong mà không có user thì không render gì (sẽ redirect ở useEffect)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
