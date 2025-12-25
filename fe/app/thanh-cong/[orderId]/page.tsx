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
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/format';
import { CheckCircle, Ticket, Home } from 'lucide-react';
import Link from 'next/link';

interface OrderWithDetails extends Order {
  movie?: Movie;
  showtime?: Showtime;
  cinema?: Cinema;
  seats?: Seat[];
}

export default function SuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Unwrap params Promise
  useEffect(() => {
    params.then((p) => setOrderId(p.orderId));
  }, [params]);

  useEffect(() => {
    if (!user) {
      router.push('/dang-nhap');
      return;
    }

    if (!orderId) return;

    const loadOrder = async () => {
      try {
        const orderData = await ordersApi.getById(orderId);
        if (!orderData) {
          router.push('/');
          return;
        }

        if (orderData.userId !== user.id) {
          router.push('/');
          return;
        }

        const showtime = await showtimesApi.getById(orderData.showtimeId);
        if (!showtime) {
          setOrder(orderData);
          setIsLoading(false);
          return;
        }

        const [movie, cinemas, seats] = await Promise.all([
          moviesApi.getById(showtime.movieId),
          showtimesApi.getCinemas(),
          seatsApi.getSeats(orderData.showtimeId, showtime.price),
        ]);

        const cinema = cinemas.find((c) => c.id === showtime.cinemaId);
        const orderSeats = seats.filter((s) => orderData.seatIds.includes(s.id));

        setOrder({
          ...orderData,
          movie,
          showtime,
          cinema,
          seats: orderSeats,
        });
      } catch (error) {
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId, user, router]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Không tìm thấy đơn vé</p>
        <Link href="/">
          <Button className="mt-4">Về trang chủ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Đặt vé thành công!</h1>
          <p className="text-xl text-muted-foreground">
            Cảm ơn bạn đã đặt vé tại WebPhim
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Thông tin đặt vé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mã đơn</p>
              <p className="font-mono text-lg font-bold">{order.id}</p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">Phim</p>
              <p className="text-xl font-bold">{order.movie?.title || 'Đang tải...'}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Rạp</p>
              <p className="font-semibold">{order.cinema?.name || 'Đang tải...'}</p>
              {order.showtime && (
                <p className="text-sm text-muted-foreground">
                  {order.showtime.roomNumber}
                </p>
              )}
            </div>

            {order.showtime && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Thời gian</p>
                <p className="font-semibold">
                  {formatDate(order.showtime.date)} - {formatTime(order.showtime.startTime)}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-2">Ghế đã đặt</p>
              <div className="flex flex-wrap gap-2">
                {order.seats?.map((seat) => (
                  <span
                    key={seat.id}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold"
                  >
                    {seat.row}
                    {seat.number}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Tổng tiền:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                ✅ Trạng thái: <span className="font-semibold text-green-600">Đã thanh toán</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
          </Link>
          <Link href="/suat-chieu" className="flex-1">
            <Button className="w-full">
              <Ticket className="mr-2 h-4 w-4" />
              Đặt vé tiếp
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
