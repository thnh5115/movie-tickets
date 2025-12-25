'use client';

import { Movie, Showtime, Cinema, Seat } from '@/lib/types';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/format';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PaymentConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movie: Movie | null;
  showtime: Showtime | null;
  cinema: Cinema | null;
  selectedSeats: Seat[];
  totalAmount: number;
  onConfirm: () => void;
  onSaveLater: () => void;
  isLoading?: boolean;
}

export function PaymentConfirmDialog({
  open,
  onOpenChange,
  movie,
  showtime,
  cinema,
  selectedSeats,
  totalAmount,
  onConfirm,
  onSaveLater,
  isLoading = false,
}: PaymentConfirmDialogProps) {
  if (!movie || !showtime || !cinema) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận thanh toán</DialogTitle>
          <DialogDescription>
            Vui lòng kiểm tra thông tin đặt vé trước khi xác nhận
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Thông tin phim</h4>
            <p className="text-sm">{movie.title}</p>
            <p className="text-sm text-muted-foreground">{cinema.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(showtime.date)} - {formatTime(showtime.startTime)}
            </p>
            <p className="text-sm text-muted-foreground">{showtime.roomNumber}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Ghế đã chọn</h4>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <span key={seat.id} className="px-2 py-1 bg-primary/10 rounded text-sm">
                  {seat.row}
                  {seat.number}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Tổng tiền:</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onSaveLater} disabled={isLoading}>
            Để sau
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
