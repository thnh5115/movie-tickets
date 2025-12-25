'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { moviesApi } from '@/lib/mockApi/movies';
import { showtimesApi } from '@/lib/mockApi/showtimes';
import { Movie, Showtime, Cinema } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils/format';

export default function ShowtimePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [moviesData, showtimesData, cinemasData] = await Promise.all([
          moviesApi.getAll(),
          showtimesApi.getAll(),
          showtimesApi.getCinemas(),
        ]);
        setMovies(moviesData);
        setShowtimes(showtimesData);
        setCinemas(cinemasData);
      } catch (error) {
        // Silent error
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Đang tải suất chiếu...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Chọn suất chiếu</h1>
        <p className="text-xl text-muted-foreground">
          Chọn phim và suất chiếu để đặt vé
        </p>
      </div>

      <div className="space-y-8">
        {movies.map((movie) => {
          const movieShowtimes = showtimes.filter((s) => s.movieId === movie.id);

          if (movieShowtimes.length === 0) return null;

          return (
            <Card key={movie.id}>
              <CardHeader>
                <div className="flex gap-6">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-32 h-48 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <CardTitle className="mb-2">{movie.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-2">{movie.genre}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Thời lượng: {movie.duration} phút
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>⭐ {movie.rating}/10</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {cinemas.map((cinema) => {
                    const cinemaShowtimes = movieShowtimes.filter(
                      (s) => s.cinemaId === cinema.id
                    );

                    if (cinemaShowtimes.length === 0) return null;

                    return (
                      <div key={cinema.id}>
                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-semibold">{cinema.name}</h3>
                            <p className="text-sm text-muted-foreground">{cinema.address}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {cinemaShowtimes.map((showtime) => (
                            <Link
                              key={showtime.id}
                              href={`/chon-ghe?showtimeId=${showtime.id}`}
                            >
                              <Button variant="outline" className="flex flex-col h-auto py-3 px-6">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-bold text-lg">
                                    {formatTime(showtime.startTime)}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(showtime.date)}
                                </span>
                                <span className="text-xs text-primary font-semibold mt-1">
                                  {showtime.price.toLocaleString()}đ
                                </span>
                              </Button>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
