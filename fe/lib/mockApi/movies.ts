import { Movie } from '@/lib/types';

let movies: Movie[] = [
  {
    id: '1',
    title: 'Đào, Phở và Piano',
    posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400',
    duration: 115,
    genre: 'Chính kịch, Lịch sử',
    releaseDate: '2024-02-23',
    rating: 8.5,
    description: 'Một câu chuyện cảm động về tình yêu và hy vọng trong thời kỳ chiến tranh.',
  },
  {
    id: '2',
    title: 'Mai',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
    duration: 131,
    genre: 'Tâm lý, Tình cảm',
    releaseDate: '2024-02-10',
    rating: 9.0,
    description: 'Hành trình tìm lại chính mình của một người phụ nữ.',
  },
  {
    id: '3',
    title: 'Godzilla x Kong: Đế Chế Mới',
    posterUrl: 'https://images.unsplash.com/photo-1574267432644-f610dd4b2a90?w=400',
    duration: 115,
    genre: 'Hành động, Phiêu lưu',
    releaseDate: '2024-03-29',
    rating: 7.8,
    description: 'Hai quái vật huyền thoại cùng đối đầu với mối đe dọa lớn nhất từ trước đến nay.',
  },
];

import fetchClient from '@/lib/api/fetchClient';

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const moviesApi = {
  getAll: async (): Promise<Movie[]> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...movies];
    }
    const data = await fetchClient.request('/movies');
    return (data as any[]).map((m) => ({
      id: String(m.id),
      title: m.title,
      posterUrl: m.posterUrl,
      duration: m.duration,
      genre: m.genre ?? '',
      releaseDate: m.releaseDate ?? '',
      rating: m.rating ?? 0,
      description: m.description ?? '',
    }));
  },

  getById: async (id: string): Promise<Movie | undefined> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return movies.find((m) => m.id === id);
    }
    const data = await fetchClient.request(`/movies/${id}`);
    if (!data) return undefined;
    return {
      id: String(data.id),
      title: data.title,
      posterUrl: data.posterUrl,
      duration: data.duration,
      genre: data.genre ?? '',
      releaseDate: data.releaseDate ?? '',
      rating: data.rating ?? 0,
      description: data.description ?? '',
    };
  },
};
