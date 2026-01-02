import fetchClient from './fetchClient';
import { Order } from '../types';

// Transform backend response to frontend Order format
const transformBookingResponse = (booking: any): Order => {
  return {
    id: String(booking.bookingId),
    userId: String(booking.userId || ''),
    showtimeId: String(booking.showtimeId),
    seatIds: booking.seatIds.map((id: number) => String(id)),
    totalAmount: Number(booking.totalAmount),
    status: booking.status,
    createdAt: new Date(booking.createdAt).getTime(),
    holdUntil: booking.holdUntil ? new Date(booking.holdUntil).getTime() : undefined,
    confirmedAt: booking.confirmedAt ? new Date(booking.confirmedAt).getTime() : undefined,
    expiredAt: booking.expiredAt ? new Date(booking.expiredAt).getTime() : undefined,
  };
};

export const ordersApi = {
  getByUserId: async (userId: string): Promise<Order[]> => {
    const response = await fetchClient.request(`/bookings/user/${userId}`, {}, userId);
    return Array.isArray(response) ? response.map(transformBookingResponse) : [];
  },

  getById: async (orderId: string, userId: string): Promise<Order> => {
    const response = await fetchClient.request(`/bookings/${orderId}`, {}, userId);
    return transformBookingResponse(response);
  },

  confirm: async (orderId: string, userId: string): Promise<Order> => {
    const response = await fetchClient.request(`/bookings/${orderId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod: 'CREDIT_CARD' }), // Default payment method
    }, userId);
    return transformBookingResponse(response);
  },

  cancel: async (orderId: string, userId: string): Promise<void> => {
    await fetchClient.request(`/bookings/${orderId}/cancel`, {
      method: 'POST',
    }, userId);
  },
};
