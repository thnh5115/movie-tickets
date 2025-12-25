'use client';

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Film, Ticket, Smartphone, Gift } from "lucide-react"

export default function HomePage() {
	const router = useRouter();
	const { user } = useAuthStore();

	const handleStartBooking = () => {
		if (user) {
			router.push('/suat-chieu');
		} else {
			router.push('/dang-nhap');
		}
	};

	return (
		<div className="container mx-auto px-4 py-12">
			<div className="text-center mb-12">
				<Film className="h-20 w-20 text-primary mx-auto mb-6" />
				<h1 className="text-5xl font-bold mb-4">WebPhim</h1>
				<p className="text-xl text-muted-foreground mb-8">
					Hệ thống đặt vé xem phim trực tuyến
				</p>
				<Button size="lg" className="text-lg px-8 py-6" onClick={handleStartBooking}>
					<Ticket className="mr-2 h-6 w-6" />
					Bắt đầu đặt vé
				</Button>
			</div>

			<div className="grid md:grid-cols-3 gap-6">
				<Card>
					<CardHeader>
						<Ticket className="h-12 w-12 text-primary mb-4" />
						<CardTitle>Đặt vé nhanh chóng</CardTitle>
						<CardDescription>
							Chọn suất chiếu và ghế ngồi chỉ trong vài bước đơn giản
						</CardDescription>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader>
						<Smartphone className="h-12 w-12 text-primary mb-4" />
						<CardTitle>Đặt vé mọi lúc mọi nơi</CardTitle>
						<CardDescription>
							Trải nghiệm đặt vé xem phim trực tuyến tiện lợi và dễ dàng
						</CardDescription>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader>
						<Gift className="h-12 w-12 text-primary mb-4" />
						<CardTitle>Chương trình ưu đãi hấp dẫn</CardTitle>
						<CardDescription>
							Nhận nhiều ưu đãi và điểm thưởng khi đặt vé qua hệ thống
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		</div>
	)
}
