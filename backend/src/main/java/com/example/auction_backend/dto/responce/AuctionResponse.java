package com.example.auction_backend.dto.responce;

import com.example.auction_backend.model.Auction;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
    private String ImageUrl;
    private String status;

    // Thay vì trả về User, ta trả về UserResponse gọn nhẹ
    private UserResponse seller;
    private UserResponse winner;
    private List<BidResponse> bidHistory;

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
                .ImageUrl(auction.getImageUrl())
                .status(auction.getStatus().name())
                .seller(UserResponse.fromEntity(auction.getSeller()))
                .winner(UserResponse.fromEntity(auction.getWinner()))
                .bidHistory(auction.getBids() != null ?
                    auction.getBids().stream()
                            .map(BidResponse::fromEntity)
                            .sorted((a,b) -> b.getTime().compareTo(a.getTime()))
                            .toList() : List.of())
                .build();
    }
}