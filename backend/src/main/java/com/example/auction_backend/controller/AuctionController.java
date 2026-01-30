package com.example.auction_backend.controller;

import com.example.auction_backend.dto.request.AuctionRequest;
import com.example.auction_backend.dto.responce.AuctionResponse;
import com.example.auction_backend.model.Auction;
import com.example.auction_backend.repository.AuctionRepository;
import com.example.auction_backend.service.AuctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;
    private final AuctionRepository auctionRepository;
    // Tạo phiên đấu giá
    @PostMapping("/create")
    public ResponseEntity<AuctionResponse> createAuction(@RequestBody AuctionRequest request) {
        Auction newAuction = auctionService.createAuction(request);
        return ResponseEntity.ok(AuctionResponse.fromEntity(newAuction));
    }
    // API đấu giá
    @PostMapping("/{id}/bid")
    public ResponseEntity<Auction> placeBid(
            @PathVariable Long id,
            @RequestParam BigDecimal amount // Nhận số tiền qua tham số URL
    ) {
        return ResponseEntity.ok(auctionService.placeBid(id, amount));
    }
    // Lấy toàn bộ phiên đấu giá
    @GetMapping
    public ResponseEntity<List<AuctionResponse>> getAllAuctions() {
        return ResponseEntity.ok(
                auctionService.getAllAuctions().stream()
                        .map(AuctionResponse::fromEntity)
                        .toList()
        );
    }
    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponse> getAuctionDetail(@PathVariable Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        return ResponseEntity.ok(AuctionResponse.fromEntity(auction));
    }

}