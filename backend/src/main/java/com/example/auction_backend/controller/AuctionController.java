package com.example.auction_backend.controller;

import com.example.auction_backend.dto.request.AuctionRequest;
import com.example.auction_backend.dto.response.AuctionResponse;
import com.example.auction_backend.enums.AuctionStatus;
import com.example.auction_backend.enums.Category;
import com.example.auction_backend.model.Auction;
import com.example.auction_backend.repository.AuctionRepository;
import com.example.auction_backend.service.AuctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {
    private final SimpMessagingTemplate messagingTemplate;
    private final AuctionService auctionService;
    private final AuctionRepository auctionRepository;

    // Tạo phiên đấu giá
    @PostMapping("/create")
    public ResponseEntity<AuctionResponse> createAuction(
            @RequestBody AuctionRequest request,
            Principal principal
    ) {
        Auction newAuction = auctionService.createAuction(request, principal.getName());
        AuctionResponse responsePayload = AuctionResponse.fromEntity(newAuction);
        messagingTemplate.convertAndSend("/topic/auctions/", responsePayload);
        return ResponseEntity.ok(responsePayload);
    }

    // API đấu giá
    @PostMapping("/{id}/bid")
    public ResponseEntity<AuctionResponse> placeBid(
                                                     @PathVariable Long id,
                                                     @RequestParam BigDecimal amount,
                                                     Principal principal
    ) {
        Auction updatedAuction = auctionService.placeBid(id, amount , principal.getName());
        AuctionResponse responsePayload = AuctionResponse.fromEntity(updatedAuction);
        messagingTemplate.convertAndSend("/topic/auction/" + id, responsePayload);
        return ResponseEntity.ok(responsePayload);
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

        List<Auction> auctions = auctionRepository.searchAuctions(keyword, status );
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
    @PostMapping("/{id}/buy-now")
    public ResponseEntity<?> buyNowAuction(
            @PathVariable Long id,
            Principal principal
    ) {
        try {
            Auction updatedAuction = auctionService.buyNow(id, principal.getName());
            AuctionResponse responsePayload = AuctionResponse.fromEntity(updatedAuction);
            messagingTemplate.convertAndSend("/topic/auction/" + id, responsePayload);
            messagingTemplate.convertAndSend("/topic/auctions/", responsePayload);

            return ResponseEntity.ok(responsePayload);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<AuctionResponse>> getRecommendations(@PathVariable Long id) {
        List<AuctionResponse> responses = auctionService.getRecommendations(id)
                .stream()
                .map(AuctionResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(responses);
    }
    @GetMapping("/category/{category}")
    public ResponseEntity<List<AuctionResponse>> getAuctionsByCategory(@PathVariable String category) {
        try {
            Category catEnum = Category.valueOf(category.toUpperCase());
            List<Auction> auctions = auctionRepository.findByCategoryAndStatusOrderByStartTimeDesc(catEnum, AuctionStatus.OPEN);
            List<AuctionResponse> responses = auctions.stream()
                    .map(AuctionResponse::fromEntity)
                    .toList();

            return ResponseEntity.ok(responses);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}