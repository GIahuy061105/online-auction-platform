package com.example.auction_backend.model;

import com.example.auction_backend.enums.AuctionStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "auctions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Auction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String productName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal startingPrice; // Giá khởi điểm

    private BigDecimal currentPrice;  // Giá cao nhất hiện tại

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private AuctionStatus status; // Enum: OPEN, CLOSED, CANCELLED

    // Người bán (Ai tạo phiên đấu giá này?)
    @ManyToOne
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    // Người thắng cuộc (Được set khi hết giờ)
    @ManyToOne
    @JoinColumn(name = "winner_id")
    private User winner;

    // Danh sách các lượt bid của phiên này
    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL)
    private List<Bid> bids;
}