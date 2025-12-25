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

export const seatsApi = {
  getSeats: async (showtimeId: string, basePrice: number = 80000): Promise<Seat[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!seatsByShowtime.has(showtimeId)) {
      seatsByShowtime.set(showtimeId, initializeSeats(showtimeId, basePrice));
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
  },

  holdSeats: async (
    showtimeId: string,
    seatIds: string[],
    userId: string
  ): Promise<{ success: boolean; message: string; seats?: Seat[] }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const seats = seatsByShowtime.get(showtimeId);
    if (!seats) {
      return { success: false, message: 'Không tìm thấy suất chiếu' };
    }

    const holdUntil = Date.now() + HOLD_DURATION_MS;

    // Check availability (concurrency control)
    const now = Date.now();
    for (const seatId of seatIds) {
      const seat = seats.find((s) => s.id === seatId);
      if (!seat) {
        return { success: false, message: 'Ghế không tồn tại' };
      }

      // Auto-expire if needed
      if (seat.status === 'ĐANG_GIỮ' && seat.holdUntil && seat.holdUntil < now) {
        seat.status = 'TRỐNG';
        seat.heldBy = undefined;
        seat.holdUntil = undefined;
      }

      if (seat.status === 'ĐÃ_ĐẶT') {
        return { success: false, message: 'Ghế đã được đặt' };
      }

      if (seat.status === 'ĐANG_GIỮ' && seat.heldBy !== userId) {
        return { success: false, message: 'Ghế đang được giữ bởi người dùng khác' };
      }
    }

    // Hold the seats
    const heldSeats: Seat[] = [];
    for (const seatId of seatIds) {
      const seat = seats.find((s) => s.id === seatId)!;
      seat.status = 'ĐANG_GIỮ';
      seat.heldBy = userId;
      seat.holdUntil = holdUntil;
      heldSeats.push({ ...seat });
    }

    return { success: true, message: 'Giữ ghế thành công', seats: heldSeats };
  },

  confirmSeats: async (showtimeId: string, seatIds: string[], userId: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const seats = seatsByShowtime.get(showtimeId);
    if (!seats) return false;

    for (const seatId of seatIds) {
      const seat = seats.find((s) => s.id === seatId);
      if (seat && seat.heldBy === userId) {
        seat.status = 'ĐÃ_ĐẶT';
        seat.heldBy = undefined;
        seat.holdUntil = undefined;
      }
    }

    return true;
  },

  releaseSeats: async (showtimeId: string, seatIds: string[], userId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const seats = seatsByShowtime.get(showtimeId);
    if (!seats) return;

    for (const seatId of seatIds) {
      const seat = seats.find((s) => s.id === seatId);
      if (seat && seat.heldBy === userId && seat.status === 'ĐANG_GIỮ') {
        seat.status = 'TRỐNG';
        seat.heldBy = undefined;
        seat.holdUntil = undefined;
      }
    }
  },

  expireHolds: async (): Promise<void> => {
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
  },
};
