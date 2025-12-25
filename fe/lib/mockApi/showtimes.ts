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

export const showtimesApi = {
  getAll: async (): Promise<Showtime[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...showtimes];
  },

  getByMovieId: async (movieId: string): Promise<Showtime[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return showtimes.filter((s) => s.movieId === movieId);
  },

  getById: async (id: string): Promise<Showtime | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return showtimes.find((s) => s.id === id);
  },

  getCinemas: async (): Promise<Cinema[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...cinemas];
  },
};
