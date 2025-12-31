import { Showtime, Cinema } from '@/lib/types';

const cinemas: Cinema[] = [
  { id: '1', name: 'CGV Vincom', address: 'Vincom Center, Quận 1' },
  { id: '2', name: 'Lotte Cinema', address: 'Lotte Mart, Quận 7' },
  { id: '3', name: 'Galaxy Cinema', address: 'Nowzone, Quận 1' },
];

let showtimes: Showtime[] = [
  {
    id: '1',
    movieId: '1',
    cinemaId: '1',
    startTime: '14:00',
    endTime: '16:00',
    date: new Date().toISOString().split('T')[0],
    price: 80000,
    roomNumber: 'Phòng 1',
  },
  {
    id: '2',
    movieId: '1',
    cinemaId: '1',
    startTime: '18:30',
    endTime: '20:30',
    date: new Date().toISOString().split('T')[0],
    price: 100000,
    roomNumber: 'Phòng 2',
  },
  {
    id: '3',
    movieId: '2',
    cinemaId: '2',
    startTime: '16:00',
    endTime: '18:15',
    date: new Date().toISOString().split('T')[0],
    price: 90000,
    roomNumber: 'Phòng 3',
  },
];

import fetchClient from '@/lib/api/fetchClient';

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const showtimesApi = {
  getAll: async (): Promise<Showtime[]> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...showtimes];
    }
    const data = await fetchClient.request('/showtimes');
    return (data as any[]).map((s) => ({
      id: String(s.id),
      movieId: String(s.movieId),
      cinemaId: String(s.cinemaId),
      startTime: s.startTime,
      endTime: s.endTime ?? '',
      date: s.showtimeDate,
      price: s.price ?? 0,
      roomNumber: s.roomNumber,
    }));
  },

  getByMovieId: async (movieId: string): Promise<Showtime[]> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return showtimes.filter((s) => s.movieId === movieId);
    }
    const data = await fetchClient.request(`/showtimes?movieId=${movieId}`);
    return (data as any[]).map((s) => ({
      id: String(s.id),
      movieId: String(s.movieId),
      cinemaId: String(s.cinemaId),
      startTime: s.startTime,
      endTime: s.endTime ?? '',
      date: s.showtimeDate,
      price: s.price ?? 0,
      roomNumber: s.roomNumber,
    }));
  },

  getById: async (id: string): Promise<Showtime | undefined> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return showtimes.find((s) => s.id === id);
    }
    const data = await fetchClient.request(`/showtimes/${id}`);
    if (!data) return undefined;
    return {
      id: String(data.id),
      movieId: String(data.movieId),
      cinemaId: String(data.cinemaId),
      startTime: data.startTime,
      endTime: data.endTime ?? '',
      date: data.showtimeDate,
      price: data.price ?? 0,
      roomNumber: data.roomNumber,
    };
  },

  getCinemas: async (): Promise<Cinema[]> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return [...cinemas];
    }
    const data = await fetchClient.request('/cinemas');
    return (data as any[]).map((c) => ({ id: String(c.id), name: c.name, address: c.address }));
  },
};
