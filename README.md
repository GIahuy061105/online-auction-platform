# 🏆 SDKAuction — Sàn Đấu Giá Online

> Nền tảng đấu giá trực tuyến thời gian thực, cho phép người dùng mua bán sản phẩm thông qua hình thức đấu giá minh bạch và công bằng.

🌐 **Live:** [https://sdkauction.vercel.app](https://sdkauction.vercel.app)

📦 **Repo:** [https://github.com/GIahuy061105/online-auction-platform](https://github.com/GIahuy061105/online-auction-platform)

---

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt & Chạy local](#cài-đặt--chạy-local)
- [Cấu hình môi trường](#cấu-hình-môi-trường)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [API Reference](#api-reference)
- [Deploy](#deploy)

---

## 🎯 Tổng quan

SDKAuction là nền tảng đấu giá trực tuyến được xây dựng với mục tiêu:

- **Minh bạch:** Lịch sử đấu giá công khai, cập nhật thời gian thực
- **Công bằng:** Hệ thống tự động hoàn tiền khi bị vượt giá
- **An toàn:** Tích hợp thanh toán VNPay, xác thực JWT
- **Tiện lợi:** Thông báo real-time qua WebSocket, hỗ trợ mua đứt ngay

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────┐     HTTPS      ┌─────────────────────┐
│   Frontend (Vercel) │ ─────────────► │  Backend (Railway)  │
│   React + Vite      │                │  Spring Boot 4.0    │
│   Ant Design        │ ◄───────────── │  Java 21            │
└─────────────────────┘   REST + WS    └──────────┬──────────┘
                                                   │
                                                   │ JDBC
                                                   ▼
                                       ┌─────────────────────┐
                                       │  Database (Supabase)│
                                       │  PostgreSQL 17.6    │
                                       └─────────────────────┘
```

**URLs:**
| Service | URL |
|---------|-----|
| Frontend | https://sdkauction.vercel.app |
| Backend API | https://sdkauction.up.railway.app/api |
| WebSocket | https://sdkauction.up.railway.app/ws |

---

## ✨ Tính năng

### 👤 Người dùng
- ✅ Đăng ký / Đăng nhập bằng JWT
- ✅ Hồ sơ cá nhân (họ tên, số điện thoại, địa chỉ giao hàng)
- ✅ Ví điện tử — nạp tiền qua VNPay
- ✅ Danh sách yêu thích
- ✅ Lịch sử hoạt động (đấu giá, mua bán)

### 🛍️ Đấu giá
- ✅ Xem sản phẩm không cần đăng nhập
- ✅ Lọc theo danh mục, trạng thái, từ khóa
- ✅ Đặt giá theo bước giá (step price)
- ✅ Mua đứt ngay (Buy Now)
- ✅ Countdown timer thời gian thực
- ✅ Lịch sử đấu giá công khai
- ✅ Gợi ý sản phẩm tương tự

### 📡 Real-time
- ✅ Cập nhật giá tức thì qua WebSocket/STOMP
- ✅ Thông báo khi bị vượt giá
- ✅ Thông báo khi thắng đấu giá
- ✅ Thông báo sản phẩm mới

### 💰 Thanh toán
- ✅ Tích hợp cổng thanh toán VNPay
- ✅ Hỗ trợ ATM/Internet Banking
- ✅ Tự động cộng số dư sau khi thanh toán thành công
- ✅ Lịch sử giao dịch nạp tiền

### 🏪 Người bán
- ✅ Đăng sản phẩm đấu giá (upload nhiều ảnh/video)
- ✅ Cài đặt giá khởi điểm, bước giá, giá mua đứt
- ✅ Cài đặt thời gian bắt đầu/kết thúc
- ✅ Quản lý cửa hàng cá nhân
- ✅ Cập nhật thông tin giao hàng sau khi bán

---

## 🛠️ Công nghệ sử dụng

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| React | 18+ | UI Framework |
| Vite | 5+ | Build tool |
| Ant Design | 5+ | UI Components |
| @stomp/stompjs | 7+ | WebSocket client |
| SockJS-client | 1.6+ | WebSocket fallback |
| Axios | 1+ | HTTP client |
| React Router | 6+ | Routing |

### Backend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| Spring Boot | 4.0.2 | Web framework |
| Java | 21 | Runtime |
| Spring Security | 6+ | Authentication/Authorization |
| Hibernate ORM | 7.2.1 | ORM |
| Spring WebSocket | - | Real-time communication |
| PostgreSQL Driver | 42.7.9 | Database driver |
| Lombok | - | Code generation |
| JWT (jjwt) | - | Token authentication |

### Infrastructure
| Service | Mục đích |
|---------|----------|
| Vercel | Frontend hosting |
| Railway | Backend hosting |
| Supabase | PostgreSQL database |
| VNPay Sandbox | Payment gateway |
| UptimeRobot | Server monitoring |

---

## 💻 Cài đặt & Chạy local

### Yêu cầu hệ thống
- Node.js >= 18
- Java 21
- Maven 3.8+
- PostgreSQL (hoặc dùng Supabase)

### 1. Clone repository

```bash
git clone https://github.com/GIahuy061105/online-auction-platform.git
cd online-auction-platform
```

### 2. Chạy Backend

```bash
cd backend

# Cấu hình database trong application.properties
# (xem phần Cấu hình môi trường bên dưới)

mvn spring-boot:run
# Backend chạy tại http://localhost:8080
```

### 3. Chạy Frontend

```bash
cd frontend

# Cài dependencies
npm install

# Tạo file .env.local
cp .env.example .env.local
# Sửa VITE_API_URL=http://localhost:8080/api

npm run dev
# Frontend chạy tại http://localhost:5173
```

---

## ⚙️ Cấu hình môi trường

### Backend — `application.properties`

```properties
# Database
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

# VNPay
VNPAY_TMN_CODE=${VNPAY_TMN_CODE}
VNPAY_HASH_SECRET=${VNPAY_HASH_SECRET}
VNPAY_URL=${VNPAY_URL}
VNPAY_RETURN_URL=${VNPAY_RETURN_URL}
```

### Frontend — `.env.production`

```env
VITE_API_URL=https://sdkauction.up.railway.app/api
VITE_WS_URL=https://sdkauction.up.railway.app
```

### Railway Environment Variables

| Biến | Mô tả |
|------|-------|
| `SPRING_DATASOURCE_URL` | JDBC URL của Supabase |
| `SPRING_DATASOURCE_USERNAME` | Username database |
| `SPRING_DATASOURCE_PASSWORD` | Password database |
| `JWT_SECRET` | Secret key cho JWT |
| `VNPAY_TMN_CODE` | Mã merchant VNPay |
| `VNPAY_HASH_SECRET` | Secret key VNPay |
| `VNPAY_URL` | URL cổng thanh toán VNPay |
| `VNPAY_RETURN_URL` | URL callback sau thanh toán |

---

## 📖 Hướng dẫn sử dụng

### 🔐 Đăng ký & Đăng nhập

1. Truy cập [https://sdkauction.vercel.app](https://sdkauction.vercel.app)
2. Click **"Đăng ký"** ở góc trên phải
3. Nhập **username**, **email**, **mật khẩu** (tối thiểu 8 ký tự)
4. Click **"Tạo tài khoản ngay"**
5. Đăng nhập với username/password vừa tạo
   
6. Username: Buyer , password: Buyer123 ( Có sẵn tiền )

7. Username Seller , password : Seller123
8. Hoặc bạn có thể sử dụng 2 tài khoản có sẵn để test.
---

### 👤 Cập nhật hồ sơ cá nhân

> ⚠️ **Bắt buộc** trước khi đấu giá hoặc mua sản phẩm

1. Click vào **avatar** góc trên phải → **"Hồ sơ cá nhân"**
2. Cập nhật **Họ tên đầy đủ**
3. Cập nhật **Số điện thoại**
4. Thêm ít nhất **1 địa chỉ giao hàng**
5. Click **Lưu**

---

### 💳 Nạp tiền vào ví

1. Click **avatar** → **"Nạp tiền vào ví"** hoặc click **"+ Nạp tiền"** trong dropdown
2. Chọn số tiền preset hoặc nhập số tiền tùy ý (tối thiểu 10,000₫)
3. Click **"Nạp tiền qua VNPay"**
4. Hệ thống chuyển sang trang thanh toán VNPay
5. Chọn ngân hàng và hoàn tất thanh toán

**Thẻ test (Sandbox):**

    | Ngân hàng :  NCB |
    | Số thẻ : 9704198526191432198 |
    | Tên chủ thẻ : NGUYEN VAN A |
    | Ngày phát hành : 07/15 |
    | OTP : 123456 |

---

### 🔍 Xem & Tìm kiếm sản phẩm

- **Không cần đăng nhập** để xem danh sách và chi tiết sản phẩm
- Lọc theo **danh mục** bằng thanh category bar ở trên
- Tìm kiếm theo **tên sản phẩm** bằng ô search
- Lọc theo **trạng thái**: Đang diễn ra / Sắp diễn ra / Đã kết thúc

**Danh mục sản phẩm:**
- 📱 Điện thoại (SMARTPHONES)
- 💻 Laptop (LAPTOPS)
- 📟 Tablet (TABLETS)
- 🎧 Âm thanh (AUDIO)
- ⌚ Đồng hồ (WEARABLES)
- 🎮 Gaming (GAMING)
- 🔧 Linh kiện PC (PC_COMPONENTS)
- 🔌 Phụ kiện (ACCESSORIES)
- 📦 Khác (OTHER_ELECTRONICS)

---

### ⚡ Tham gia đấu giá

> ⚠️ Cần đăng nhập + hồ sơ đầy đủ + đủ số dư

1. Tìm sản phẩm đang **ĐANG MỞ ĐẤU GIÁ** (badge xanh)
2. Click vào sản phẩm để xem chi tiết
3. Trong khung **"Đặt giá của bạn"**, nhập số tiền ≥ giá tối thiểu
4. Click **"ĐẶT GIÁ NGAY"**
5. Nếu bị người khác vượt giá → số tiền tự động **hoàn về ví**
6. Thắng đấu giá khi countdown hết giờ và bạn là người trả cao nhất

---

### ⚡ Mua đứt ngay (Buy Now)

1. Vào trang chi tiết sản phẩm có **giá mua đứt**
2. Xem giá ở khung vàng **"Mua ngay không cần đấu giá"**
3. Click **"⚡ MUA ĐỨT NGAY"**
4. Hệ thống trừ tiền và đóng phiên đấu giá ngay lập tức

---

### 📦 Đăng bán sản phẩm

1. Click **"Đăng bán"** ở Navbar (cần đăng nhập)
2. Điền thông tin sản phẩm:
    - **Tên sản phẩm** và **mô tả chi tiết**
    - **Danh mục** phù hợp
    - **Hình ảnh/Video** sản phẩm (upload nhiều file)
3. Cài đặt đấu giá:
    - **Giá khởi điểm** — giá bắt đầu
    - **Bước giá** — mức tăng tối thiểu mỗi lần đặt
    - **Giá mua đứt** (tùy chọn) — cho phép mua ngay
    - **Thời gian bắt đầu & kết thúc**
4. Click **"Đăng sản phẩm"**

---

### 🚚 Cập nhật giao hàng (Người bán)

Sau khi sản phẩm được bán thành công:

1. Vào **"Cửa hàng của tôi"**
2. Tìm sản phẩm đã bán với trạng thái **CLOSED**
3. Click **"Giao hàng"**
4. Nhận thông tin: tên người nhận, SĐT, địa chỉ giao hàng

---

### ❤️ Danh sách yêu thích

- Click icon **tim** trên card sản phẩm hoặc trang chi tiết để thêm vào yêu thích
- Xem danh sách tại **Avatar → "Danh sách yêu thích"**

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |

### Users
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/users/my-profile` | Lấy thông tin cá nhân | ✅ |
| PUT | `/api/users/update` | Cập nhật hồ sơ | ✅ |

### Auctions
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/auctions` | Danh sách tất cả | ❌ |
| GET | `/api/auctions/{id}` | Chi tiết sản phẩm | ❌ |
| GET | `/api/auctions/category/{cat}` | Lọc theo danh mục | ❌ |
| GET | `/api/auctions/search` | Tìm kiếm | ❌ |
| POST | `/api/auctions` | Tạo đấu giá mới | ✅ |
| POST | `/api/auctions/{id}/bid` | Đặt giá | ✅ |
| POST | `/api/auctions/{id}/buy-now` | Mua đứt | ✅ |

### Payment
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/payment/create` | Tạo link thanh toán VNPay | ✅ |
| GET | `/api/payment/vnpay-return` | Callback từ VNPay | ❌ |

### WebSocket
| Topic | Mô tả |
|-------|-------|
| `/topic/auction/{id}` | Cập nhật giá đấu giá |
| `/topic/auctions/` | Sản phẩm mới/cập nhật |
| `/topic/notifications/{username}` | Thông báo cá nhân |

---

## 🚀 Deploy

### Frontend (Vercel)

```bash
# Cài Vercel CLI
npm i -g vercel

cd frontend
vercel --prod
```

**Vercel Settings:**
- Root Directory: `frontend`
- Output Directory: `dist`
- Build Command: `npm run build`

### Backend (Railway)

1. Connect GitHub repo tại [railway.app](https://railway.app)
2. Set Root Directory: `backend`
3. Railway tự detect Dockerfile và build
4. Thêm Environment Variables (xem phần cấu hình)

**Dockerfile** (multi-stage build):
```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Database (Supabase)

1. Tạo project tại [supabase.com](https://supabase.com)
2. Vào **Settings → Database**
3. Copy **Connection String** (Transaction mode, port 6543)
4. Thêm `?prepareThreshold=0` vào cuối URL
5. Set IP allowlist: `0.0.0.0/0`

---

## 👥 Tác giả

Dự án được phát triển bởi Sinh viên Nguyễn Phạm Gia Huy.

---

## 📄 License

MIT License — tự do sử dụng cho mục đích học tập.