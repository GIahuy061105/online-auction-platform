package com.example.auction_backend.dto.responce;

import com.example.auction_backend.model.Auction;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AuctionResponse {
    private Long id;
    private String productName;
    private String description;
    private BigDecimal currentPrice;
    private BigDecimal startingPrice;
    private BigDecimal stepPrice;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;

    // Thay vì trả về User, ta trả về UserResponse gọn nhẹ
    private UserResponse seller;
    private UserResponse winner;

    // Hàm chuyển đổi từ Auction Entity sang AuctionResponse
    public static AuctionResponse fromEntity(Auction auction) {
        return AuctionResponse.builder()
                .id(auction.getId())
                .productName(auction.getProductName())
                .description(auction.getDescription())
                .currentPrice(auction.getCurrentPrice())
                .startingPrice(auction.getStartingPrice())
                .stepPrice(auction.getStepPrice())
                .startTime(auction.getStartTime())
                .endTime(auction.getEndTime())
                .status(auction.getStatus().name())
                .seller(UserResponse.fromEntity(auction.getSeller()))
                .winner(UserResponse.fromEntity(auction.getWinner()))
                .build();
    }
}