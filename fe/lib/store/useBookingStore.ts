import { create } from 'zustand';

interface BookingState {
  selectedSeats: string[];
  showtimeId: string | null;
  setShowtimeId: (id: string) => void;
  toggleSeat: (seatId: string) => void;
  clearSeats: () => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedSeats: [],
  showtimeId: null,
  setShowtimeId: (id) => set({ showtimeId: id }),
  toggleSeat: (seatId) =>
    set((state) => ({
      selectedSeats: state.selectedSeats.includes(seatId)
        ? state.selectedSeats.filter((id) => id !== seatId)
        : [...state.selectedSeats, seatId],
    })),
  clearSeats: () => set({ selectedSeats: [] }),
  reset: () => set({ selectedSeats: [], showtimeId: null }),
}));
