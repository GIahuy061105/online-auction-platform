package com.example.auction_backend.model;

import com.example.auction_backend.enums.AuctionStatus;
import com.example.auction_backend.enums.Category;
import com.example.auction_backend.enums.DeliveryStatus;
import com.example.auction_backend.enums.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private BigDecimal startingPrice;

    private BigDecimal currentPrice;

    @Column(nullable = false)
    private BigDecimal stepPrice;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @ElementCollection
    @Column(name= "image_url")
    private List<String> imageUrls = new ArrayList<>();

    @Column(name = "deposit_amount", nullable = false)
    private BigDecimal depositAmount;

    @Enumerated(EnumType.STRING)
    private AuctionStatus status;
    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private Category category;
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

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
    // Giá mua đứt
    @Column(name ="buy_now_price")
    private BigDecimal buyNowPrice;

    // Giao hàng
    @Column(name = "delivery_recipient_name")
    private String deliveryRecipientName;

    @Column(name = "delivery_phone")
    private String deliveryPhone;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status")
    private DeliveryStatus deliveryStatus;
}