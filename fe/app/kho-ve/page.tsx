'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { ordersApi } from '@/lib/mockApi/orders';
import { showtimesApi } from '@/lib/mockApi/showtimes';
import { moviesApi } from '@/lib/mockApi/movies';
import { seatsApi } from '@/lib/mockApi/seats';
import { Order, Showtime, Movie, Cinema, Seat } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatCountdown, getTimeRemaining, isExpired } from '@/lib/utils/time';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/format';
import { Ticket, Clock, AlertCircle } from 'lucide-react';
import { PaymentConfirmDialog } from '@/components/PaymentConfirmDialog';

interface OrderWithDetails extends Order {
  movie?: Movie;
  showtime?: Showtime;
  cinema?: Cinema;
  seats?: Seat[];
}

export default function TicketVaultPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'CHỜ_THANH_TOÁN' | 'ĐÃ_THANH_TOÁN' | 'ĐÃ_HỦY'>('ALL');

  const loadOrders = async () => {
    if (!user) return;

    try {
      // Check and expire old orders
      await ordersApi.checkExpirations();

      // Load all orders (pending, confirmed, and cancelled)
      const allOrders = await ordersApi.getByUserId(user.id);

      // Load details for each order
      const ordersWithDetails = await Promise.all(
        allOrders.map(async (order) => {
          try {
            const showtime = await showtimesApi.getById(order.showtimeId);
            if (!showtime) return order;

            const [movie, cinemas, seats] = await Promise.all([
              moviesApi.getById(showtime.movieId),
              showtimesApi.getCinemas(),
              seatsApi.getSeats(order.showtimeId, showtime.price),
            ]);

            const cinema = cinemas.find((c) => c.id === showtime.cinemaId);
            const orderSeats = seats.filter((s) => order.seatIds.includes(s.id));

            return {
              ...order,
              movie,
              showtime,
              cinema,
              seats: orderSeats,
            };
          } catch (error) {
            return order;
          }
        })
      );

      setOrders(ordersWithDetails);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách vé',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/dang-nhap');
      return;
    }

    loadOrders();
  }, [user, router]);

  // Update countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns: Record<string, string> = {};
      let hasExpired = false;

      orders.forEach((order) => {
        if (order.holdUntil) {
          if (isExpired(order.holdUntil)) {
            hasExpired = true;
          } else {
            newCountdowns[order.id] = formatCountdown(getTimeRemaining(order.holdUntil));
          }
        }
      });

      setCountdowns(newCountdowns);

      if (hasExpired) {
        loadOrders();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  const handlePayNow = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;

    setIsConfirming(true);
    try {
      await ordersApi.confirm(selectedOrder.id);
      setShowPaymentDialog(false);
      router.push(`/thanh-cong/${selectedOrder.id}`);
    } catch (error) {
      toast({
        title: 'Lỗi thanh toán',
        description: 'Không thể xác nhận thanh toán',
        variant: 'destructive',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      await ordersApi.cancel(orderId);
      await loadOrders();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể hủy vé',
        variant: 'destructive',
      });
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === filter);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <Ticket className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4">Kho vé của tôi</h1>
        <p className="text-xl text-muted-foreground">
          Quản lý tất cả các vé của bạn
        </p>
      </div>

      {/* Filter buttons */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        <Button 
          variant={filter === 'ALL' ? 'default' : 'outline'}
          onClick={() => setFilter('ALL')}
        >
          Tất cả ({orders.length})
        </Button>
        <Button 
          variant={filter === 'CHỜ_THANH_TOÁN' ? 'default' : 'outline'}
          onClick={() => setFilter('CHỜ_THANH_TOÁN')}
        >
          Chờ thanh toán ({orders.filter(o => o.status === 'CHỜ_THANH_TOÁN').length})
        </Button>
        <Button 
          variant={filter === 'ĐÃ_THANH_TOÁN' ? 'default' : 'outline'}
          onClick={() => setFilter('ĐÃ_THANH_TOÁN')}
        >
          Đã thanh toán ({orders.filter(o => o.status === 'ĐÃ_THANH_TOÁN').length})
        </Button>
        <Button 
          variant={filter === 'ĐÃ_HỦY' ? 'default' : 'outline'}
          onClick={() => setFilter('ĐÃ_HỦY')}
        >
          Đã hủy ({orders.filter(o => o.status === 'ĐÃ_HỦY').length})
        </Button>
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">Chưa có vé nào</p>
            <p className="text-muted-foreground mb-6">
              {filter === 'ALL' 
                ? 'Bạn chưa có vé nào'
                : filter === 'CHỜ_THANH_TOÁN'
                ? 'Không có vé đang chờ thanh toán'
                : filter === 'ĐÃ_THANH_TOÁN'
                ? 'Chưa có vé đã thanh toán'
                : 'Không có vé đã hủy'}
            </p>
            <Button onClick={() => router.push('/suat-chieu')}>
              Đặt vé ngay
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const countdown = countdowns[order.id];
            const expired = order.holdUntil && isExpired(order.holdUntil);
            
            // Status badge
            const getStatusBadge = () => {
              switch (order.status) {
                case 'ĐÃ_THANH_TOÁN':
                  return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Đã thanh toán</span>;
                case 'ĐÃ_HỦY':
                  return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">Đã hủy</span>;
                case 'HẾT_HẠN':
                  return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">Hết hạn</span>;
                case 'CHỜ_THANH_TOÁN':
                  return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">Chờ thanh toán</span>;
                default:
                  return null;
              }
            };

            return (
              <Card key={order.id} className={order.status === 'ĐÃ_HỦY' || order.status === 'HẾT_HẠN' ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle>
                          {order.movie?.title || 'Đang tải...'}
                        </CardTitle>
                        {getStatusBadge()}
                      </div>
                      {order.cinema && (
                        <p className="text-sm text-muted-foreground">{order.cinema.name}</p>
                      )}
                      {order.showtime && (
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.showtime.date)} - {formatTime(order.showtime.startTime)}
                        </p>
                      )}
                    </div>
                    {order.status === 'CHỜ_THANH_TOÁN' && countdown && !expired && (
                      <div className="flex items-center gap-2 text-destructive">
                        <Clock className="h-5 w-5" />
                        <span className="text-lg font-bold">{countdown}</span>
                      </div>
                    )}
                    {order.status === 'CHỜ_THANH_TOÁN' && expired && (
                      <div className="text-sm text-destructive font-semibold">
                        Đã hết hạn
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Ghế đã chọn:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.seats?.map((seat) => (
                          <span
                            key={seat.id}
                            className="px-3 py-1 bg-primary/10 rounded-lg text-sm font-semibold"
                          >
                            {seat.row}
                            {seat.number}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Tổng tiền:</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        {order.status === 'CHỜ_THANH_TOÁN' && !expired && (
                          <>
                            <Button variant="outline" onClick={() => handleCancel(order.id)}>
                              Hủy
                            </Button>
                            <Button onClick={() => handlePayNow(order)}>
                              Thanh toán ngay
                            </Button>
                          </>
                        )}
                        {(order.status === 'ĐÃ_HỦY' || order.status === 'HẾT_HẠN' || (order.status === 'CHỜ_THANH_TOÁN' && expired)) && (
                          <Button variant="outline" onClick={() => handleCancel(order.id)}>
                            Xóa
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <PaymentConfirmDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          movie={selectedOrder.movie || null}
          showtime={selectedOrder.showtime || null}
          cinema={selectedOrder.cinema || null}
          selectedSeats={selectedOrder.seats || []}
          totalAmount={selectedOrder.totalAmount}
          onConfirm={handleConfirmPayment}
          onSaveLater={() => setShowPaymentDialog(false)}
          isLoading={isConfirming}
        />
      )}
    </div>
  );
}
