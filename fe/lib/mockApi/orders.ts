import { Order, OrderStatus } from '@/lib/types';
import { seatsApi } from './seats';
import fetchClient from '@/lib/api/fetchClient';

let orders: Order[] = [];

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

const mapStatus = (s: string): OrderStatus => {
  if (s === 'PENDING') return 'CHỜ_THANH_TOÁN';
  if (s === 'CONFIRMED') return 'ĐÃ_THANH_TOÁN';
  if (s === 'EXPIRED') return 'HẾT_HẠN';
  if (s === 'CANCELLED') return 'ĐÃ_HỦY';
  return 'CHỜ_THANH_TOÁN';
};

const pickId = (data: any) => String(data?.bookingId ?? data?.id ?? '');

export const ordersApi = {
  create: async (
    userId: string,
    showtimeId: string,
    seatIds: string[],
    totalAmount: number,
    holdUntil: number
  ): Promise<Order> => {
    if (useMock) {
      await new Promise((r) => setTimeout(r, 200));

      const order: Order = {
        id: `ORD${Date.now()}`,
        userId,
        showtimeId,
        seatIds,
        totalAmount,
        status: 'CHỜ_THANH_TOÁN',
        createdAt: Date.now(),
        holdUntil,
      };

      orders.push(order);
      return order;
    }

    const body = {
      showtimeId: Number(showtimeId),
      seatIds: seatIds.map((s) => Number(s)),
      notes: null,
    };

    const data = await fetchClient.request(
      '/bookings',
      { method: 'POST', body: JSON.stringify(body) },
      userId
    );

    return {
      id: pickId(data),
      userId,
      showtimeId: String(data.showtimeId ?? showtimeId),
      seatIds: (data.seatIds ?? []).map((id: any) => String(id)),
      totalAmount: Number(data.totalAmount ?? totalAmount),
      status: mapStatus(String(data.status)),
      createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
      holdUntil: data.holdUntil ? new Date(data.holdUntil).getTime() : holdUntil,
      confirmedAt: data.confirmedAt ? new Date(data.confirmedAt).getTime() : undefined,
    };
  },

  getById: async (orderId: string, userId: string): Promise<Order | undefined> => {
    if (useMock) {
      await new Promise((r) => setTimeout(r, 100));
      return orders.find((o) => o.id === orderId);
    }

    const data = await fetchClient.request(`/bookings/${orderId}`, {}, userId);

    return {
      id: pickId(data),
      userId: String(data.userId ?? userId),
      showtimeId: String(data.showtimeId),
      seatIds: (data.seats ?? []).map((s: any) => String(s.seatId)),
      totalAmount: Number(data.totalAmount),
      status: mapStatus(String(data.status)),
      createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
      holdUntil: data.holdUntil ? new Date(data.holdUntil).getTime() : undefined,
      confirmedAt: data.confirmedAt ? new Date(data.confirmedAt).getTime() : undefined,
    };
  },

  getByUserId: async (userId: string, status?: OrderStatus): Promise<Order[]> => {
    if (useMock) {
      await new Promise((r) => setTimeout(r, 200));
      return orders.filter((o) => o.userId === userId && (!status || o.status === status));
    }

    const data = await fetchClient.request(`/bookings/user/${userId}`, {}, userId);

    return (data as any[]).map((b) => ({
      id: pickId(b),
      userId: String(b.userId ?? userId),
      showtimeId: String(b.showtimeId),
      seatIds: (b.seatIds ?? []).map((id: any) => String(id)),
      totalAmount: Number(b.totalAmount),
      status: mapStatus(String(b.status)),
      createdAt: b.createdAt ? new Date(b.createdAt).getTime() : Date.now(),
      holdUntil: b.holdUntil ? new Date(b.holdUntil).getTime() : undefined,
      confirmedAt: b.confirmedAt ? new Date(b.confirmedAt).getTime() : undefined,
    }));
  },

  confirm: async (orderId: string, userId: string): Promise<Order> => {
    if (useMock) {
      await new Promise((r) => setTimeout(r, 300));

      const order = orders.find((o) => o.id === orderId);
      if (!order) throw new Error('Không tìm thấy đơn vé');

      order.status = 'ĐÃ_THANH_TOÁN';
      order.confirmedAt = Date.now();
      order.holdUntil = undefined;

      await seatsApi.confirmSeats(order.showtimeId, order.seatIds, order.userId);

      return order;
    }

    const body = { paymentMethod: 'CASH', paymentTransactionId: `DEMO-${Date.now()}` };

    const data = await fetchClient.request(
      `/bookings/${orderId}/confirm`,
      { method: 'POST', body: JSON.stringify(body) },
      userId
    );

    return {
      id: pickId(data),
      userId,
      showtimeId: String(data.showtimeId),
      seatIds: (data.seatIds ?? []).map((id: any) => String(id)),
      totalAmount: Number(data.totalAmount),
      status: mapStatus(String(data.status)),
      createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
      holdUntil: data.holdUntil ? new Date(data.holdUntil).getTime() : undefined,
      confirmedAt: data.confirmedAt ? new Date(data.confirmedAt).getTime() : Date.now(),
    };
  },

  expire: async (orderId: string): Promise<void> => {
    if (useMock) {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      order.status = 'HẾT_HẠN';
      order.expiredAt = Date.now();

      await seatsApi.releaseSeats(order.showtimeId, order.seatIds, order.userId);
      return;
    }
  },

  cancel: async (orderId: string): Promise<void> => {
    if (useMock) {
      await new Promise((r) => setTimeout(r, 200));

      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      order.status = 'ĐÃ_HỦY';
      await seatsApi.releaseSeats(order.showtimeId, order.seatIds, order.userId);
      return;
    }
  },

  checkExpirations: async (): Promise<void> => {
    if (useMock) {
      const now = Date.now();
      const expired = orders.filter((o) => o.status === 'CHỜ_THANH_TOÁN' && o.holdUntil && o.holdUntil < now);
      for (const o of expired) await ordersApi.expire(o.id);
      return;
    }
  },
};
