'use client';

import { Seat } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SeatGridProps {
  seats: Seat[];
  selectedSeats: string[];
  onSeatClick: (seatId: string) => void;
  userId: string;
}

export function SeatGrid({ seats, selectedSeats, onSeatClick, userId }: SeatGridProps) {
  const { toast } = useToast();

  // Kiểm tra xem lock đã hết hạn chưa
  const isLockExpired = (seat: Seat): boolean => {
    if (!seat.holdUntil) return true;
    return new Date(seat.holdUntil).getTime() < Date.now();
  };

  // Lấy trạng thái thực tế của ghế (tự động chuyển ĐANG_GIỮ hết hạn về TRỐNG)
  const getEffectiveStatus = (seat: Seat): string => {
    if (seat.status === 'ĐANG_GIỮ' && isLockExpired(seat)) {
      return 'TRỐNG';
    }
    return seat.status;
  };

  const handleSeatClick = (seat: Seat) => {
    const effectiveStatus = getEffectiveStatus(seat);
    
    if (effectiveStatus === 'ĐÃ_ĐẶT') {
      return;
    }

    if (effectiveStatus === 'ĐANG_GIỮ' && seat.heldBy !== userId) {
      return;
    }

    onSeatClick(seat.id);
  };

  const rows = [...new Set(seats.map((s) => s.row))].sort();

  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-3xl h-2 bg-gradient-to-b from-gray-400 to-gray-200 rounded-t-full" />
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row} className="flex items-center justify-center gap-2">
            <div className="w-8 text-center font-medium text-muted-foreground">{row}</div>
            <div className="flex gap-2">
              {seats
                .filter((s) => s.row === row)
                .sort((a, b) => a.number - b.number)
                .map((seat) => {
                  const effectiveStatus = getEffectiveStatus(seat);
                  return (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      disabled={effectiveStatus === 'ĐÃ_ĐẶT' || (effectiveStatus === 'ĐANG_GIỮ' && seat.heldBy !== userId)}
                      className={cn(
                        'w-10 h-10 rounded-t-lg text-sm font-medium transition-all',
                        'hover:scale-110 disabled:cursor-not-allowed disabled:hover:scale-100',
                        effectiveStatus === 'TRỐNG' && 'bg-green-500 hover:bg-green-600 text-white',
                        effectiveStatus === 'ĐANG_GIỮ' && seat.heldBy === userId && 'bg-yellow-500 text-white',
                        effectiveStatus === 'ĐANG_GIỮ' && seat.heldBy !== userId && 'bg-gray-300 text-gray-500',
                        effectiveStatus === 'ĐÃ_ĐẶT' && 'bg-red-500 text-white',
                        selectedSeats.includes(seat.id) && 'ring-2 ring-blue-500 ring-offset-2'
                      )}
                    >
                      {seat.number}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
