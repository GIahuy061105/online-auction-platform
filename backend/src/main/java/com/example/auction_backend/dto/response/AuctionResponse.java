package com.example.auction_backend.dto.response;

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
    private String imageUrl;
    private String status;
    private List<String> imageUrls;
    private BigDecimal buyNowPrice;
    // Thay vì trả về User, ta trả về UserResponse gọn nhẹ
    private UserResponse seller;
    private UserResponse winner;
    private List<BidResponse> bidHistory;
    // Giao hàng
    private String deliveryRecipientName;
    private String deliveryPhone;
    private String deliveryAddress;

    // Hàm chuyển đổi từ Auction Entity sang AuctionResponse
    public static AuctionResponse fromEntity(Auction auction) {
        String thumbnail = "https://via.placeholder.com/400x200?text=No+Image";
        if (auction.getImageUrls() != null && !auction.getImageUrls().isEmpty()) {
            thumbnail = auction.getImageUrls().get(0); // Lấy cái thứ nhất (index 0)
        }
        return AuctionResponse.builder()
                .id(auction.getId())
                .productName(auction.getProductName())
                .description(auction.getDescription())
                .currentPrice(auction.getCurrentPrice())
                .startingPrice(auction.getStartingPrice())
                .stepPrice(auction.getStepPrice())
                .startTime(auction.getStartTime())
                .endTime(auction.getEndTime())
                .imageUrl(thumbnail) // Map ảnh đầu tiên vào đây
                .imageUrls(auction.getImageUrls())
                .status(auction.getStatus().name())
                .buyNowPrice(auction.getBuyNowPrice())
                .seller(UserResponse.fromEntity(auction.getSeller()))
                .winner(auction.getWinner() != null ? UserResponse.fromEntity(auction.getWinner()) : null)
                .bidHistory(auction.getBids() != null ?
                    auction.getBids().stream()
                            .map(BidResponse::fromEntity)
                            .sorted((a,b) -> b.getTime().compareTo(a.getTime()))
                            .toList() : List.of())
                .deliveryRecipientName(auction.getDeliveryRecipientName())
                .deliveryPhone(auction.getDeliveryPhone())
                .deliveryAddress(auction.getDeliveryAddress())
                .build();
    }
}