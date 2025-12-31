import java.util.*;
public class datvexemphim {


        // ====== ENTITY ======
        static class User {
            long id;
            String email, name, password, role, status;

            User(long id, String email, String name, String password, String role, String status) {
                this.id = id;
                this.email = email;
                this.name = name;
                this.password = password;
                this.role = role;
                this.status = status;
            }
        }

        static class Movie {
            long id;
            String title;
            int duration;

            Movie(long id, String title, int duration) {
                this.id = id;
                this.title = title;
                this.duration = duration;
            }
        }

        static class Cinema {
            long id;
            String name, city;

            Cinema(long id, String name, String city) {
                this.id = id;
                this.name = name;
                this.city = city;
            }
        }

        static class Showtime {
            long id, movieId, cinemaId;
            String startTime;
            int availableSeats;

            Showtime(long id, long movieId, long cinemaId, String startTime, int availableSeats) {
                this.id = id;
                this.movieId = movieId;
                this.cinemaId = cinemaId;
                this.startTime = startTime;
                this.availableSeats = availableSeats;
            }
        }

        static class Seat {
            long id, showtimeId;
            String seat, status;

            Seat(long id, long showtimeId, String seat, String status) {
                this.id = id;
                this.showtimeId = showtimeId;
                this.seat = seat;
                this.status = status;
            }
        }

        // ====== MOCK DATABASE ======
        static List<User> users = new ArrayList<>();
        static List<Movie> movies = new ArrayList<>();
        static List<Cinema> cinemas = new ArrayList<>();
        static List<Showtime> showtimes = new ArrayList<>();
        static List<Seat> seats = new ArrayList<>();

        public static void main(String[] args) {

            seedData();

            // ====== OUTPUT THEO THỨ TỰ YÊU CẦU ======
            login("user1@demo.com", "password123");
            getMovie(1);
            getCinema(1);
            getSeats(1);
            getShowtime(1);
        }

        // ====== API 1: LOGIN ======
        static void login(String email, String password) {
            System.out.println("=== LOGIN ===");
            for (User u : users) {
                if (u.email.equals(email) && u.password.equals(password) && u.status.equals("ACTIVE")) {
                    System.out.println("User: " + u.name + " | Role: " + u.role);
                    return;
                }
            }
            System.out.println("Login failed");
        }

        // ====== API 2: MOVIE ======
        static void getMovie(long id) {
            System.out.println("\n=== MOVIE ===");
            for (Movie m : movies) {
                if (m.id == id) {
                    System.out.println("Title: " + m.title);
                    System.out.println("Duration: " + m.duration + " minutes");
                    return;
                }
            }
        }

        // ====== API 3: CINEMA ======
        static void getCinema(long id) {
            System.out.println("\n=== CINEMA ===");
            for (Cinema c : cinemas) {
                if (c.id == id) {
                    System.out.println("Name: " + c.name);
                    System.out.println("City: " + c.city);
                    return;
                }
            }
        }

        // ====== API 4: SEATS ======
        static void getSeats(long showtimeId) {
            System.out.println("\n=== SEATS ===");
            for (Seat s : seats) {
                if (s.showtimeId == showtimeId) {
                    System.out.println("Seat: " + s.seat + " | Status: " + s.status);
                }
            }
        }

        // ====== API 5: SHOWTIME ======
        static void getShowtime(long id) {
            System.out.println("\n=== SHOWTIME ===");
            for (Showtime s : showtimes) {
                if (s.id == id) {
                    System.out.println("Showtime ID: " + s.id);
                    System.out.println("Start Time: " + s.startTime);
                    System.out.println("Available Seats: " + s.availableSeats);
                    return;
                }
            }
        }

        // ====== SEED DATA ======
        static void seedData() {
            users.add(new User(1, "user1@demo.com", "Nguyen Van A", "password123", "USER", "ACTIVE"));

            movies.add(new Movie(1, "Avatar: The Way of Water", 192));

            cinemas.add(new Cinema(1, "CGV Vincom Ha Noi", "Ha Noi"));

            showtimes.add(new Showtime(1, 1, 1, "09:00", 120));

            seats.add(new Seat(1, 1, "A1", "BOOKED"));
            seats.add(new Seat(2, 1, "A2", "BOOKED"));
            seats.add(new Seat(3, 1, "A3", "AVAILABLE"));
        }
    }

}
