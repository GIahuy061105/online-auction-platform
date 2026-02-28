"# Online Auction Platform" 
# 🔨 Real-time Online Auction Platform 

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Ant Design](https://img.shields.io/badge/Ant_Design-0170FE?style=for-the-badge&logo=ant-design&logoColor=white)

A full-stack, real-time online auction system built with **Spring Boot** and **React**. This platform allows users to bid on items concurrently, featuring live updates, automated auction closures, and robust concurrency control to ensure data integrity during peak bidding moments.

## ✨ Key Features (Highlights)

This project tackles several complex backend and real-time synchronization challenges:

* **⚡ Real-time Bidding (WebSockets):** Live updates of current prices, highest bidders, and countdown timers across all connected clients without page reloads.
* **🛡️ Concurrency Control (Pessimistic Locking):** Utilizes JPA `@Lock(LockModeType.PESSIMISTIC_WRITE)` to prevent Race Conditions (Double-spending or overwriting bids) when multiple users bid at the exact same millisecond.
* **⏰ Anti-sniping Mechanism:** Automatically extends the auction end time by 60 seconds if a bid is placed in the final minute, ensuring fair play.
* **⚙️ Background Schedulers:** Uses `@Scheduled` to automatically scan, close expired auctions, transfer funds to sellers, and take a "snapshot" of the winner's delivery address exactly at the closing moment.
* **💳 Wallet & Payment Flow:** Users must maintain a wallet balance. The system automatically handles deducting bids and refunding previous outbid users in real-time.
* **📦 Store Management:** Sellers can track their active/closed auctions and view fixed delivery information for winners.

## 📸 Screenshots
*(TIPS: Bạn hãy chụp 3-4 tấm ảnh thật đẹp của hệ thống và thay thế các link ảnh dưới đây)*

| Home Page & Active Auctions | Real-time Bidding Room |
| :---: | :---: |
| <img src="https://via.placeholder.com/600x400?text=Chụp+ảnh+trang+chủ+dán+vào+đây" width="100%"> | <img src="https://via.placeholder.com/600x400?text=Chụp+ảnh+Modal+trả+giá+dán+vào+đây" width="100%"> |

| Store Management (Seller View) | Delivery Address Snapshot |
| :---: | :---: |
| <img src="https://via.placeholder.com/600x400?text=Chụp+ảnh+trang+My+Store" width="100%"> | <img src="https://via.placeholder.com/600x400?text=Chụp+ảnh+Modal+Giao+hàng" width="100%"> |

## 🛠️ Tech Stack

### Backend
* **Language:** Java 17
* **Framework:** Spring Boot 3.x
* **Database:** MySQL
* **ORM:** Spring Data JPA / Hibernate
* **Real-time Communication:** Spring WebSocket (STOMP)
* **Security:** Spring Security & JWT Token Authentication

### Frontend
* **Library:** React.js (Vite)
* **UI Framework:** Ant Design (AntD 5.x)
* **State Management / API:** Axios, React Hooks
* **Real-time Client:** SockJS & STOMP.js

## 🗄️ Database Architecture (Key Entities)

* `User`: Manages authentication, profile, and wallet balance.
* `Address`: One-to-Many relationship with User, supporting a designated `isDefault` delivery address.
* `Auction`: Stores product details, pricing (Step price, Buy Now), timeframes, and snapshot delivery data (`delivery_address`, `delivery_phone`) to lock information at the time of closure.
* `Bid`: Keeps track of the bidding history for transparency.

## 🚀 How to Run Locally

### 1. Backend Setup
1. Clone the repository: `git clone https://github.com/GIahuy061105/your-repo-name.git`
2. Create a MySQL database named `auction_db`.
3. Update `src/main/resources/application.properties` with your MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/auction_db
   spring.datasource.username=root
   spring.datasource.password=yourpassword
