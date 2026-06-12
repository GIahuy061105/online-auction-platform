package com.example.auction_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "auction_deposits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionDeposit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    private Auction auction;

    @Column(nullable = false)
    private BigDecimal amount;

    // Trạng thái cọc: LOCKED (Đang giữ), REFUNDED (Đã hoàn lại), CAPTURED (Đã tịch thu do thắng nhưng bom hàng / hoặc trừ thẳng vào giá mua)
    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}