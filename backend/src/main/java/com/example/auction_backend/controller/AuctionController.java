package com.example.auction_backend.controller;

import com.example.auction_backend.dto.request.AuctionRequest;
import com.example.auction_backend.model.Auction;
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

    @PostMapping("/create")
    public ResponseEntity<Auction> createAuction(@RequestBody AuctionRequest request) {
        return ResponseEntity.ok(auctionService.createAuction(request));
    }
    @GetMapping
    public ResponseEntity<List<Auction>> getAllAuctions() {
        return ResponseEntity.ok(auctionService.getAllAuctions());
    }

    // 3. API Đấu giá (Mới)
    // POST: http://localhost:8080/api/auctions/{id}/bid?amount=500000
    @PostMapping("/{id}/bid")
    public ResponseEntity<Auction> placeBid(
            @PathVariable Long id,
            @RequestParam BigDecimal amount // Nhận số tiền qua tham số URL
    ) {
        return ResponseEntity.ok(auctionService.placeBid(id, amount));
    }
}