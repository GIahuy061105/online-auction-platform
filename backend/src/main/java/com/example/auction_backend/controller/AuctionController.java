package com.example.auction_backend.controller;

import com.example.auction_backend.dto.request.AuctionRequest;
import com.example.auction_backend.dto.response.AuctionResponse;
import com.example.auction_backend.enums.AuctionStatus;
import com.example.auction_backend.model.Auction;
import com.example.auction_backend.repository.AuctionRepository;
import com.example.auction_backend.service.AuctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
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
    public ResponseEntity<AuctionResponse> placeBid( // ✅ Sửa thành AuctionResponse cho đồng bộ
                                                     @PathVariable Long id,
                                                     @RequestParam BigDecimal amount
    ) {
        Auction updatedAuction = auctionService.placeBid(id, amount);
        return ResponseEntity.ok(AuctionResponse.fromEntity(updatedAuction));
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

    @GetMapping("/search")
    public ResponseEntity<List<AuctionResponse>> searchAuctions(
                                                                 @RequestParam(required = false) String keyword,
                                                                 @RequestParam(required = false) AuctionStatus status) {

        List<Auction> auctions = auctionRepository.searchAuctions(keyword, status);
        List<AuctionResponse> response = auctions.stream()
                .map(AuctionResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(response);
    }
    @GetMapping("/owner")
    public List<AuctionResponse> getMyAuctions() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return auctionRepository.findBySellerUsername(username)
                .stream()
                .map(AuctionResponse::fromEntity)
                .toList();
    }

    @GetMapping("/won")
    public List<AuctionResponse> getAuctionsIWon() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return auctionRepository.findByStatusAndWinnerUsername(AuctionStatus.CLOSED, username)
                .stream()
                .map(AuctionResponse::fromEntity)
                .toList();
    }

    @GetMapping("/participated")
    public List<AuctionResponse> getAuctionsIParticipated() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return auctionRepository.findParticipatedAuctions(username)
                .stream()
                .map(AuctionResponse::fromEntity)
                .toList();
    }
}