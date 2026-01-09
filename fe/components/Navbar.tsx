'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Film, Ticket, LogOut, User } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  // Logout bây giờ là async, gọi API backend
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          <Film className="h-6 w-6" />
          WebPhim
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/suat-chieu" className="hover:text-primary transition-colors">
            Suất chiếu
          </Link>
          
          {user && (
            <Link href="/kho-ve" className="hover:text-primary flex items-center gap-1 transition-colors">
              <Ticket className="h-4 w-4" />
              Kho vé
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {user.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  <div className="text-sm">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-muted-foreground">{user.email}</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/dang-nhap">
              <Button size="sm">Đăng nhập</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
