# 🚀 BACKEND DEPLOYMENT - RENDER

## ✅ CHECKLIST TRƯỚC KHI DEPLOY

- [x] Java 17
- [x] Spring Boot 3.5.4
- [x] Maven build tool
- [x] File `application.properties` đã chuẩn (dùng env variables)
- [x] CORS config cho phép mọi origin
- [x] Health endpoint: `/api/health`
- [x] Build thành công: `./mvnw clean package -DskipTests`
- [x] Maven wrapper files (mvnw, mvnw.cmd, .mvn/)

---

## 📋 ENVIRONMENT VARIABLES CẦN THIẾT

Khi deploy lên Render, thêm các biến sau trong **Environment Variables**:

### 1️⃣ Database (từ Railway)
```
SPRING_DATASOURCE_URL=jdbc:mysql://containers-us-west-xxx.railway.app:xxxx/railway?useSSL=true&serverTimezone=Asia/Ho_Chi_Minh
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_password_from_railway
```

### 2️⃣ CORS (Frontend URL)
```
CORS_ALLOWED_ORIGINS=*
```
**Hoặc** restrict cụ thể:
```
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### 3️⃣ Port (Render tự inject, không cần set)
Render tự động inject biến `PORT`, Spring Boot sẽ đọc từ `server.port=${PORT:8080}`

---

## 🛠️ RENDER CONFIGURATION

### Build Command:
```bash
./mvnw clean install -DskipTests
```

### Start Command:
```bash
java -jar target/movieticket-0.0.1-SNAPSHOT.jar
```

### Instance Type:
- **Free** (để demo)

### Region:
- **Singapore** (gần VN nhất)

---

## 🧪 TEST SAU KHI DEPLOY

1. **Health Check:**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```
   Kết quả mong đợi:
   ```json
   {
     "status": "OK",
     "message": "Backend is running!",
     "timestamp": "2026-01-09T...",
     "service": "Movie Tickets Booking API"
   }
   ```

2. **Test API:**
   ```bash
   curl https://your-backend.onrender.com/api/movies
   ```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### Cold Start Issue (Render Free Tier)
- Backend **ngủ sau 15 phút** không dùng
- Lần đầu truy cập sau khi ngủ: **30-60 giây** wake up
- **Giải pháp cho demo:** Truy cập backend trước 5 phút

### Database Connection
- Đảm bảo Railway database đang chạy
- JDBC URL format đúng (có `?useSSL=true&serverTimezone=Asia/Ho_Chi_Minh`)
- Username/password chính xác

### CORS
- Nếu dùng `*`: Frontend bất kỳ đều gọi được (dễ demo)
- Nếu restrict: Phải match chính xác Vercel URL (không trailing slash)

---

## 🐛 TROUBLESHOOTING

### Build Fail: "mvnw not found"
```bash
# Local: Generate wrapper
cd be
mvn wrapper:wrapper
git add .mvn/ mvnw mvnw.cmd
git commit -m "Add Maven wrapper"
git push
```

### Application Crash: Database Connection
- Check Railway database status
- Verify SPRING_DATASOURCE_URL format
- Test connection locally với Railway credentials

### CORS Error từ Frontend
- Kiểm tra CORS_ALLOWED_ORIGINS
- Nếu dùng wildcard: Đảm bảo CorsConfig dùng `allowedOriginPatterns("*")`
- Check browser console cho error details

---

## ✅ SUCCESS INDICATORS

Deployment thành công khi:
- ✅ Render build không error
- ✅ Application started log xuất hiện
- ✅ `/api/health` trả về 200 OK
- ✅ `/api/movies` trả về JSON data
- ✅ Không có error log liên tục

---

**Ready to deploy! 🎉**
