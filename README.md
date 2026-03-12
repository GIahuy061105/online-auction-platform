# 🏆 SDKAuction — Sàn Đấu Giá Online

> Nền tảng đấu giá trực tuyến thời gian thực, cho phép người dùng mua bán sản phẩm thông qua hình thức đấu giá minh bạch và công bằng.

🌐 **Live:** [https://sdkauction.vercel.app](https://sdkauction.vercel.app)
📦 **Repo:** [https://github.com/GIahuy061105/online-auction-platform](https://github.com/GIahuy061105/online-auction-platform)

---

## 📸 Giao diện

### 🏠 Sàn đấu giá
![Trang chủ](https://raw.githubusercontent.com/GIahuy061105/online-auction-platform/main/docs/screenshots/trangchu.png)

### 👤 Hồ sơ cá nhân
![Hồ sơ cá nhân](https://raw.githubusercontent.com/GIahuy061105/online-auction-platform/main/docs/screenshots/hosocanhan.png)

### 🏪 Cửa hàng của tôi
![Cửa hàng](https://raw.githubusercontent.com/GIahuy061105/online-auction-platform/main/docs/screenshots/cuahangcanhan.png)

### 📦 Đăng bán sản phẩm
![Đăng bán](https://raw.githubusercontent.com/GIahuy061105/online-auction-platform/main/docs/screenshots/dangban.png)

### 📬 Liên hệ
![Liên hệ](https://raw.githubusercontent.com/GIahuy061105/online-auction-platform/main/docs/screenshots/lienhe.png)

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

| Service | URL |
|---------|-----|
| Frontend | https://sdkauction.vercel.app |
| Backend API | https://sdkauction.up.railway.app/api |
| WebSocket | https://sdkauction.up.railway.app/ws |

---

## ✨ Tính năng

### 👤 Người dùng
- ✅ Đăng ký / Đăng nhập bằng JWT
- ✅ Quên mật khẩu qua email OTP
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
- ✅ Xem thông tin giao hàng sau khi bán

### 📬 Liên hệ
- ✅ Form liên hệ gửi email trực tiếp
- ✅ Rate limiting chống spam

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
| Resend API | - | Email service |

### Infrastructure
| Service | Mục đích |
|---------|----------|
| Vercel | Frontend hosting |
| Railway | Backend hosting |
| Supabase | PostgreSQL database |
| Cloudinary | Lưu trữ ảnh/video |
| VNPay Sandbox | Payment gateway |
| Resend | Email service |
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
mvn spring-boot:run
# Backend chạy tại http://localhost:8080
```

### 3. Chạy Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend chạy tại http://localhost:5173
```

---

## ⚙️ Cấu hình môi trường

### Backend — `application.properties`

```properties
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}

cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api-key=${CLOUDINARY_API_KEY}
cloudinary.api-secret=${CLOUDINARY_API_SECRET}

spring.mail.password=${SPRING_MAIL_PASSWORD}  # Resend API key

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
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SPRING_MAIL_PASSWORD` | Resend API key (`re_xxx`) |
| `VNPAY_TMN_CODE` | Mã merchant VNPay |
| `VNPAY_HASH_SECRET` | Secret key VNPay |
| `VNPAY_URL` | URL cổng thanh toán VNPay |
| `VNPAY_RETURN_URL` | URL callback sau thanh toán |

---

## 📖 Hướng dẫn sử dụng

### 🔐 Đăng ký & Đăng nhập

1. Truy cập [https://sdkauction.vercel.app](https://sdkauction.vercel.app)
2. Click **"Đăng ký"** ở góc trên phải
3. Nhập **username**, **email**, **mật khẩu**
4. Đăng nhập với username/password vừa tạo

> 💡 **Tài khoản test có sẵn:**
> - Buyer: `Buyer` / `Buyer123` (có sẵn tiền trong ví)
> - Seller: `Seller` / `Seller123`

---

### 👤 Cập nhật hồ sơ cá nhân

> ⚠️ **Bắt buộc** trước khi đấu giá hoặc mua sản phẩm

1. Click vào **avatar** → **"Hồ sơ cá nhân"**
2. Cập nhật **Họ tên**, **Số điện thoại**
3. Thêm ít nhất **1 địa chỉ giao hàng**
4. Click **Lưu**

---

### 💳 Nạp tiền vào ví

1. Click **avatar** → **"Nạp tiền vào ví"**
2. Chọn hoặc nhập số tiền (tối thiểu 10,000₫)
3. Click **"Nạp tiền qua VNPay"**

**Thẻ test Sandbox:**

| Thông tin | Giá trị |
|-----------|---------|
| Ngân hàng | NCB |
| Số thẻ | 9704198526191432198 |
| Tên chủ thẻ | NGUYEN VAN A |
| Ngày phát hành | 07/15 |
| OTP | 123456 |

---

### 🔍 Xem & Tìm kiếm sản phẩm

- **Không cần đăng nhập** để xem sản phẩm
- Lọc theo **danh mục** bằng category bar ở trên
- Tìm kiếm theo **tên sản phẩm**
- Lọc theo trạng thái: Đang diễn ra / Sắp diễn ra / Đã kết thúc

**Danh mục:** 📱 Điện thoại · 💻 Laptop · 📟 Tablet · 🎧 Âm thanh · ⌚ Đồng hồ · 🎮 Gaming · 🔧 Linh kiện PC · 🔌 Phụ kiện · 📦 Khác

---

### ⚡ Tham gia đấu giá

> ⚠️ Cần đăng nhập + hồ sơ đầy đủ + đủ số dư

1. Tìm sản phẩm **ĐANG DIỄN RA** (badge xanh)
2. Nhập số tiền ≥ giá tối thiểu → Click **"ĐẶT GIÁ NGAY"**
3. Nếu bị vượt giá → tiền tự động **hoàn về ví**
4. Thắng khi countdown hết và bạn là người trả cao nhất

---

### ⚡ Mua đứt ngay (Buy Now)

1. Vào trang chi tiết sản phẩm có **giá mua đứt**
2. Click **"⚡ MUA ĐỨT NGAY"**
3. Hệ thống trừ tiền và đóng phiên đấu giá ngay lập tức

---

### 📦 Đăng bán sản phẩm

1. Click **"Đăng bán"** ở Navbar
2. Upload ảnh/video, điền thông tin sản phẩm
3. Cài đặt giá khởi điểm, bước giá, giá mua đứt, thời gian
4. Click **"Đăng sản phẩm"**

---

### 🚚 Cửa hàng & Giao hàng

- Vào **"Cửa hàng"** để xem doanh thu, sản phẩm đang/đã đấu giá
- Sau khi bán → Click **"Giao hàng"** để xem thông tin người mua

---

### 📬 Liên hệ

- Vào **"Liên hệ"** trên Navbar
- Điền form → Click **"Gửi tin nhắn"**
- Hệ thống gửi email trực tiếp đến admin

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/forgot-password` | Gửi OTP quên mật khẩu |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu |

### Users
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/users/my-profile` | Thông tin cá nhân | ✅ |
| PUT | `/api/users/update` | Cập nhật hồ sơ | ✅ |
| POST | `/api/users/contact` | Gửi liên hệ | ✅ |

### Auctions
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/auctions` | Danh sách | ❌ |
| GET | `/api/auctions/{id}` | Chi tiết | ❌ |
| GET | `/api/auctions/category/{cat}` | Lọc danh mục | ❌ |
| GET | `/api/auctions/search` | Tìm kiếm | ❌ |
| POST | `/api/auctions` | Tạo đấu giá | ✅ |
| POST | `/api/auctions/{id}/bid` | Đặt giá | ✅ |
| POST | `/api/auctions/{id}/buy-now` | Mua đứt | ✅ |

### Payment
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/payment/create` | Tạo link VNPay | ✅ |
| GET | `/api/payment/vnpay-return` | Callback VNPay | ❌ |

### WebSocket
| Topic | Mô tả |
|-------|-------|
| `/topic/auction/{id}` | Cập nhật giá real-time |
| `/topic/auctions/` | Sản phẩm mới |
| `/topic/notifications/{username}` | Thông báo cá nhân |

---

## 🚀 Deploy

### Frontend (Vercel)
```bash
npm i -g vercel
cd frontend && vercel --prod
```

### Backend (Railway)
1. Connect GitHub → set Root Directory: `backend`
2. Thêm Environment Variables
3. Railway tự build và deploy

### Database (Supabase)
1. Tạo project → Settings → Database
2. Copy Connection String (port 6543) + thêm `?prepareThreshold=0`

---

## 👨‍💻 Tác giả

Dự án được phát triển bởi **Nguyễn Phạm Gia Huy** — Sinh viên CNTT.

📧 nguyengiahu29@gmail.com · 📱 0777 945 590

---

## 📄 License

MIT License — tự do sử dụng cho mục đích học tập và phi thương mại.