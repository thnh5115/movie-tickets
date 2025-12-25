export function SeatLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-green-500 rounded-t-lg" />
        <span>Trống</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-yellow-500 rounded-t-lg" />
        <span>Đang giữ</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-red-500 rounded-t-lg" />
        <span>Đã đặt</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-300 rounded-t-lg" />
        <span>Không khả dụng</span>
      </div>
    </div>
  );
}
