import { Seat, SeatStatus } from '@/lib/types';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const SEATS_PER_ROW = 10;
const HOLD_DURATION_MS = 90 * 1000; // 90 seconds for demo

// In-memory seat storage
const seatsByShowtime = new Map<string, Seat[]>();

const initializeSeats = (showtimeId: string, basePrice: number): Seat[] => {
  const seats: Seat[] = [];
  for (const row of ROWS) {
    for (let num = 1; num <= SEATS_PER_ROW; num++) {
      const price = ['A', 'B'].includes(row) ? basePrice + 20000 : basePrice;
      seats.push({
        id: `${showtimeId}-${row}${num}`,
        showtimeId,
        row,
        number: num,
        status: 'TRỐNG',
        price,
      });
    }
  }
  return seats;
};

import fetchClient from '@/lib/api/fetchClient';

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const seatsApi = {
  getSeats: async (showtimeId: string): Promise<Seat[]> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!seatsByShowtime.has(showtimeId)) {
        seatsByShowtime.set(showtimeId, initializeSeats(showtimeId, 80000));
      }

      const seats = seatsByShowtime.get(showtimeId)!;

      // Auto-expire holds
      const now = Date.now();
      seats.forEach((seat) => {
        if (seat.status === 'ĐANG_GIỮ' && seat.holdUntil && seat.holdUntil < now) {
          seat.status = 'TRỐNG';
          seat.heldBy = undefined;
          seat.holdUntil = undefined;
        }
      });

      return [...seats];
    }

    const data = await fetchClient.request(`/showtimes/${showtimeId}/seats`);
    const seats = (data as any[]).map((s) => ({
      id: String(s.seatId),
      showtimeId: String(showtimeId),
      row: s.seatRow,
      number: s.seatNumber,
      status: s.status === 'AVAILABLE' ? 'TRỐNG' : s.status === 'LOCKED' ? 'ĐANG_GIỮ' : 'ĐÃ_ĐẶT',
      heldBy: s.lockedByUserId ? String(s.lockedByUserId) : undefined,
      holdUntil: s.lockExpiresAt ? new Date(s.lockExpiresAt).getTime() : undefined,
      price: Number(s.price ?? 0),
    }));
    return seats;
  },

  holdSeats: async (
    showtimeId: string,
    seatIds: string[],
    userId: string
  ): Promise<{ success: boolean; message: string; seats?: Seat[] }> => {
    if (useMock) return (await (seatsApi as any).holdSeats(showtimeId, seatIds, userId));

    try {
      const body = { seatIds: seatIds.map((id) => Number(id)), sessionId: null };
      const resp = await fetchClient.request('/seats/lock', { method: 'POST', body: JSON.stringify(body) }, userId);
      // return the seats info after lock
      const seats = await seatsApi.getSeats(showtimeId);
      return { success: true, message: 'Giữ ghế thành công', seats };
    } catch (e: any) {
      return { success: false, message: e.message ?? 'Lỗi khi giữ ghế' };
    }
  },

  confirmSeats: async (showtimeId: string, seatIds: string[], userId: string): Promise<boolean> => {
    if (useMock) return (await (seatsApi as any).confirmSeats(showtimeId, seatIds, userId));
    try {
      // booking confirm will mark seats as booked in backend; here we just call release/confirm via bookings flow
      return true;
    } catch (e) {
      return false;
    }
  },

  releaseSeats: async (showtimeId: string, seatIds: string[], userId: string): Promise<void> => {
    if (useMock) return (await (seatsApi as any).releaseSeats(showtimeId, seatIds, userId));

    const body = { seatIds: seatIds.map((id) => Number(id)) };
    await fetchClient.request('/seats/release', { method: 'POST', body: JSON.stringify(body) }, userId);
  },

  expireHolds: async (): Promise<void> => {
    if (useMock) {
      const now = Date.now();
      seatsByShowtime.forEach((seats) => {
        seats.forEach((seat) => {
          if (seat.status === 'ĐANG_GIỮ' && seat.holdUntil && seat.holdUntil < now) {
            seat.status = 'TRỐNG';
            seat.heldBy = undefined;
            seat.holdUntil = undefined;
          }
        });
      });
      return;
    }

    // no-op for server mode
  },
};
