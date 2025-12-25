import { Order, OrderStatus } from '@/lib/types';
import { seatsApi } from './seats';

let orders: Order[] = [];

export const ordersApi = {
  create: async (
    userId: string,
    showtimeId: string,
    seatIds: string[],
    totalAmount: number,
    holdUntil: number
  ): Promise<Order> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

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
  },

  getById: async (orderId: string): Promise<Order | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return orders.find((o) => o.id === orderId);
  },

  getByUserId: async (userId: string, status?: OrderStatus): Promise<Order[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return orders.filter((o) => 
      o.userId === userId && 
      (!status || o.status === status)
    );
  },

  confirm: async (orderId: string): Promise<Order> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Không tìm thấy đơn vé');

    order.status = 'ĐÃ_THANH_TOÁN';
    order.confirmedAt = Date.now();
    order.holdUntil = undefined;

    // Confirm seats
    await seatsApi.confirmSeats(order.showtimeId, order.seatIds, order.userId);

    return order;
  },

  expire: async (orderId: string): Promise<void> => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    order.status = 'HẾT_HẠN';
    order.expiredAt = Date.now();

    // Release seats
    await seatsApi.releaseSeats(order.showtimeId, order.seatIds, order.userId);
  },

  cancel: async (orderId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    order.status = 'ĐÃ_HỦY';
    await seatsApi.releaseSeats(order.showtimeId, order.seatIds, order.userId);
  },

  checkExpirations: async (): Promise<void> => {
    const now = Date.now();
    const expiredOrders = orders.filter(
      (o) => o.status === 'CHỜ_THANH_TOÁN' && o.holdUntil && o.holdUntil < now
    );

    for (const order of expiredOrders) {
      await ordersApi.expire(order.id);
    }
  },
};
