import { User } from '@/lib/types';

const SEED_USERS: User[] = [
  {
    id: '1',
    email: 'user1@demo.com',
    name: 'Nguyễn Văn A',
  },
  {
    id: '2',
    email: 'user2@demo.com',
    name: 'Trần Thị B',
  },
  {
    id: '3',
    email: 'user3@demo.com',
    name: 'Lê Văn C',
  },
];

import fetchClient from '@/lib/api/fetchClient';

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const authApi = {
  // Login không còn dùng localStorage, session được quản lý bởi backend cookie
  login: async (email: string, password: string, remember: boolean): Promise<User> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (password !== '123456') {
        throw new Error('Mật khẩu không đúng');
      }

      const user = SEED_USERS.find((u) => u.email === email);
      if (!user) {
        throw new Error('Email không tồn tại');
      }

      return user;
    }

    // Gọi API login, backend sẽ tự động set session cookie
    const data = await fetchClient.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    const user = { id: String(data.userId ?? data.id ?? '1'), email: data.email ?? email, name: data.name ?? 'User' };
    return user;
  },

  logout: () => {
    // Không cần xử lý gì ở đây, useAuthStore.logout sẽ gọi API
  },

  getSeedAccounts: () => SEED_USERS,
};
