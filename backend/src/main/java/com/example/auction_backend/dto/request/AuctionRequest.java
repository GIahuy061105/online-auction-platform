package com.example.auction_backend.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AuctionRequest {
    private String productName;
    private String description;
    private BigDecimal startingPrice;
    private BigDecimal stepPrice;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<String> imageUrls;
}