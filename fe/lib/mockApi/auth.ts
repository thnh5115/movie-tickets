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

      if (remember && typeof window !== 'undefined') {
        localStorage.setItem('auth_session', JSON.stringify(user));
      }

      return user;
    }

    const data = await fetchClient.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    const user = { id: String(data.userId ?? data.id ?? '1'), email: data.email ?? email, name: data.name ?? 'User' };
    if (remember && typeof window !== 'undefined') localStorage.setItem('auth_session', JSON.stringify(user));
    return user;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_session');
    }
  },

  getSeedAccounts: () => SEED_USERS,
};
