package com.example.auction_backend.dto.responce;

import com.example.auction_backend.model.Bid;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class BidResponse {
    private String bidderName;
    private BigDecimal amount;
    private LocalDateTime time;

    public static BidResponse fromEntity(Bid bid) {
        return BidResponse.builder()
                .bidderName(bid.getUser().getUsername())
                .amount(bid.getAmount())
                .time(bid.getBidTime())
                .build();
    }
}