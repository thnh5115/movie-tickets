export type SeatStatus = 'TRỐNG' | 'ĐANG_GIỮ' | 'ĐÃ_ĐẶT';

export type OrderStatus = 'CHỜ_THANH_TOÁN' | 'ĐÃ_THANH_TOÁN' | 'HẾT_HẠN' | 'ĐÃ_HỦY';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  duration: number;
  genre: string;
  releaseDate: string;
  rating: number;
  description: string;
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
}

export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  startTime: string;
  endTime: string;
  date: string;
  price: number;
  roomNumber: string;
}

export interface Seat {
  id: string;
  showtimeId: string;
  row: string;
  number: number;
  status: SeatStatus;
  heldBy?: string;
  holdUntil?: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  showtimeId: string;
  seatIds: string[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: number;
  holdUntil?: number;
  confirmedAt?: number;
  expiredAt?: number;
}
