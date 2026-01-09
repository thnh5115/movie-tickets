'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useBookingStore } from '@/lib/store/useBookingStore';
import { seatsApi } from '@/lib/mockApi/seats';
import { ordersApi } from '@/lib/mockApi/orders';
import { showtimesApi } from '@/lib/mockApi/showtimes';
import { moviesApi } from '@/lib/mockApi/movies';
import { Seat, Showtime, Movie, Cinema } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SeatGrid } from '@/components/SeatGrid';
import { SeatLegend } from '@/components/SeatLegend';
import { PaymentConfirmDialog } from '@/components/PaymentConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { formatCountdown, getTimeRemaining } from '@/lib/utils/time';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/format';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function SeatSelectionContent() {
  const searchParams = useSearchParams();
  const showtimeId = searchParams.get('showtimeId');
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const { selectedSeats, toggleSeat, clearSeats, setSelectedSeats } = useBookingStore();
  const { toast } = useToast();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [holdUntil, setHoldUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Load seats và đồng bộ selectedSeats (dùng cho first load và manual refresh)
  const loadSeats = useCallback(async () => {
    if (!showtimeId || !showtime || !user) return;

    try {
      const seatsData = await seatsApi.getSeats(showtimeId);
      setSeats(seatsData);
      
      // Chỉ đồng bộ selectedSeats khi first load
      if (isFirstLoad) {
        const myHeldSeats = seatsData
          .filter(seat => seat.heldBy === user.id && seat.status === 'ĐANG_GIỮ')
          .map(seat => seat.id);
        
        setSelectedSeats(myHeldSeats);
        
        if (myHeldSeats.length > 0) {
          const heldSeatsWithTime = seatsData.filter(s => myHeldSeats.includes(s.id));
          if (heldSeatsWithTime.length > 0) {
            const maxHoldUntil = Math.max(...heldSeatsWithTime.map(s => s.holdUntil || 0));
            setHoldUntil(maxHoldUntil);
          }
        }
        setIsFirstLoad(false);
      }
      // Sau first load, KHÔNG tự động clear selectedSeats
      // Let user control thông qua toggleSeat và handleSeatClick
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách ghế',
        variant: 'destructive',
      });
    }
  }, [showtimeId, showtime, user, toast, setSelectedSeats, isFirstLoad]);

  const refreshSeats = async () => {
    setIsRefreshing(true);
    await loadSeats();
    setIsRefreshing(false);
  };

  // Chỉ update danh sách ghế mà không đồng bộ selectedSeats (dùng khi user đang tương tác)
  const updateSeatsOnly = useCallback(async () => {
    if (!showtimeId || !showtime) return;

    try {
      const seatsData = await seatsApi.getSeats(showtimeId);
      setSeats(seatsData);
    } catch (error) {
      // Silent error
    }
  }, [showtimeId, showtime]);

  // Reset isFirstLoad khi showtimeId hoặc user thay đổi (để đồng bộ lại selectedSeats)
  useEffect(() => {
    setIsFirstLoad(true);
  }, [showtimeId, user]);

  useEffect(() => {
    // Chỉ redirect khi đã initialize xong và không có user
    if (isInitialized && !user) {
      router.push('/dang-nhap');
      return;
    }

    if (!showtimeId) {
      router.push('/suat-chieu');
      return;
    }

    // Chỉ load data khi đã có user
    if (!user) {
      return;
    }

    const loadData = async () => {
      try {
        const showtimeData = await showtimesApi.getById(showtimeId);
        if (!showtimeData) {
          toast({
            title: 'Lỗi',
            description: 'Không tìm thấy suất chiếu',
            variant: 'destructive',
          });
          router.push('/suat-chieu');
          return;
        }

        const [movieData, cinemas] = await Promise.all([
          moviesApi.getById(showtimeData.movieId),
          showtimesApi.getCinemas(),
        ]);

        const cinemaData = cinemas.find((c) => c.id === showtimeData.cinemaId);

        setShowtime(showtimeData);
        setMovie(movieData || null);
        setCinema(cinemaData || null);
      } catch (error) {
        // Silent error
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [showtimeId, user, isInitialized, router, toast]);

  useEffect(() => {
    if (showtime) {
      loadSeats();
    }
  }, [showtime, loadSeats]);

  // Auto-refresh every 3 seconds - chỉ update seats list, không đồng bộ selectedSeats
  useEffect(() => {
    const interval = setInterval(() => {
      updateSeatsOnly();
    }, 3000);

    return () => clearInterval(interval);
  }, [updateSeatsOnly]);

  // Countdown timer
  useEffect(() => {
    if (!holdUntil) return;

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(holdUntil);
      if (remaining <= 0) {
        setHoldUntil(null);
        setCountdown('');
        clearSeats();
        // Không gọi updateSeatsOnly ở đây để tránh dependency issues
        // Auto-refresh sẽ tự động cập nhật sau 3 giây
      } else {
        setCountdown(formatCountdown(remaining));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdUntil, clearSeats]);

  const handleSeatClick = async (seatId: string) => {
    if (!user || !showtimeId) return;

    const seat = seats.find((s) => s.id === seatId);
    if (!seat) return;

    // If deselecting
    if (selectedSeats.includes(seatId)) {
      toggleSeat(seatId);
      
      // Release the seat
      try {
        const remainingSeats = selectedSeats.filter(id => id !== seatId);
        if (remainingSeats.length > 0) {
          await seatsApi.holdSeats(showtimeId, remainingSeats, user.id);
        }
        // Chỉ update seats list, không đồng bộ selectedSeats
        await updateSeatsOnly();
      } catch (error) {
        // Silent error
      }
      return;
    }

    // If selecting, try to hold
    const newSelection = [...selectedSeats, seatId];

    try {
      const result = await seatsApi.holdSeats(showtimeId, newSelection, user.id);

      if (result.success && result.seats) {
        toggleSeat(seatId);
        const maxHoldUntil = Math.max(...result.seats.map((s) => s.holdUntil || 0));
        setHoldUntil(maxHoldUntil);
        
        // Chỉ update seats list, không đồng bộ selectedSeats
        await updateSeatsOnly();
      } else {
        toast({
          title: 'Không thể chọn ghế',
          description: result.message || 'Ghế này không khả dụng',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể giữ ghế. Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };

  const handleContinue = () => {
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = async () => {
    if (!user || !showtimeId) return;

    setIsConfirming(true);
    try {
      const selectedSeatObjects = seats.filter((s) => selectedSeats.includes(s.id));
      const totalAmount = selectedSeatObjects.reduce((sum, seat) => sum + seat.price, 0);

      // Create order
      const order = await ordersApi.create(
        user.id,
        showtimeId,
        selectedSeats,
        totalAmount,
        holdUntil || Date.now() + 90000
      );

      // Confirm order
      await ordersApi.confirm(order.id, user.id);

      clearSeats();
      setHoldUntil(null);
      router.push(`/thanh-cong/${order.id}`);
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

  const handleSaveLater = async () => {
    if (!user || !showtimeId) return;

    setIsConfirming(true);
    try {
      const selectedSeatObjects = seats.filter((s) => selectedSeats.includes(s.id));
      const totalAmount = selectedSeatObjects.reduce((sum, seat) => sum + seat.price, 0);

      // Create order but don't confirm
      await ordersApi.create(
        user.id,
        showtimeId,
        selectedSeats,
        totalAmount,
        holdUntil || Date.now() + 90000
      );

      clearSeats();
      setHoldUntil(null);
      setShowPaymentDialog(false);
      router.push('/kho-ve');
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu vé',
        variant: 'destructive',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  // Hiển thị loading khi chưa initialize xong
  if (!isInitialized || !user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Đang kiểm tra phiên đăng nhập...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!showtime || !movie || !cinema) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Không tìm thấy thông tin suất chiếu</p>
        <Link href="/suat-chieu">
          <Button className="mt-4">Quay lại chọn suất</Button>
        </Link>
      </div>
    );
  }

  const selectedSeatObjects = seats.filter((s) => selectedSeats.includes(s.id));
  const totalAmount = selectedSeatObjects.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      <div className="mb-6">
        <Link href="/suat-chieu">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </div>

      <Card className="p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{movie.title}</h1>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>{cinema.name}</p>
          <p>
            {formatDate(showtime.date)} - {formatTime(showtime.startTime)}
          </p>
          <p>{showtime.roomNumber}</p>
        </div>
      </Card>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Chọn ghế</h2>
        <div className="flex items-center gap-4">
          {holdUntil && countdown && (
            <div className="text-sm font-semibold text-destructive">
              Thời gian giữ: {countdown}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={refreshSeats} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-center text-sm text-muted-foreground mb-6">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent mb-2" />
          MÀN HÌNH
        </div>
        <SeatGrid
          seats={seats}
          selectedSeats={selectedSeats}
          onSeatClick={handleSeatClick}
          userId={user.id}
        />
      </div>

      <div className="mb-6">
        <SeatLegend />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              {selectedSeats.length > 0
                ? `Đã chọn ${selectedSeats.length} ghế: ${selectedSeatObjects.map((s) => `${s.row}${s.number}`).join(', ')}`
                : 'Chưa chọn ghế nào'}
            </p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
          </div>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={selectedSeats.length === 0}
          >
            Tiếp tục
          </Button>
        </div>
      </div>

      <PaymentConfirmDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        movie={movie}
        showtime={showtime}
        cinema={cinema}
        selectedSeats={selectedSeatObjects}
        totalAmount={totalAmount}
        onConfirm={handleConfirmPayment}
        onSaveLater={handleSaveLater}
        isLoading={isConfirming}
      />
    </div>
  );
}

export default function SeatSelectionPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    }>
      <SeatSelectionContent />
    </Suspense>
  );
}
