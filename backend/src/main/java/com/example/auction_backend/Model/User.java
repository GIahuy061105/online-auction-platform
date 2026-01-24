package com.example.auction_backend.Model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "users") // Đặt tên bảng là 'users' vì 'user' hay trùng từ khóa SQL
@Data // Lombok tự sinh Getter/Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password; // Sẽ mã hóa sau

    @Column(nullable = false, unique = true)
    private String email;

    // Số dư ví (Dùng BigDecimal để tính tiền chính xác, KHÔNG dùng Double)
    @Column(nullable = false)
    private BigDecimal balance;

    // Quan hệ 1-nhiều: Một người có thể có nhiều lượt bid
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Bid> bids;

    // Quan hệ 1-nhiều: Một người có thể tạo nhiều phiên đấu giá (bán nhiều món)
    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL)
    private List<Auction> auctions;
}