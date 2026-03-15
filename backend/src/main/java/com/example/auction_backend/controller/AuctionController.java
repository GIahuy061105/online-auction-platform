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
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {
    private final SimpMessagingTemplate messagingTemplate;
    private final AuctionService auctionService;
    private final AuctionRepository auctionRepository;

    // Rate limiting: mỗi user chỉ được bid 1 lần / 2 giây / auction
    private final ConcurrentHashMap<String, LocalDateTime> lastBidTime = new ConcurrentHashMap<>();

    // Tạo phiên đấu giá
    @PostMapping("/create")
    public ResponseEntity<?> createAuction(
            @RequestBody AuctionRequest request,
            Principal principal
    ) {
        try {
            Auction newAuction = auctionService.createAuction(request, principal.getName());
            AuctionResponse responsePayload = AuctionResponse.fromEntity(newAuction);
            messagingTemplate.convertAndSend("/topic/auctions/", responsePayload);
            return ResponseEntity.ok(responsePayload);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // API đấu giá — có rate limiting
    @PostMapping("/{id}/bid")
    public ResponseEntity<?> placeBid(
            @PathVariable Long id,
            @RequestParam BigDecimal amount,
            Principal principal
    ) {
        // Rate limiting: chặn bid quá nhanh (< 2 giây)
        String key = principal.getName() + ":" + id;
        LocalDateTime last = lastBidTime.get(key);
        if (last != null && ChronoUnit.MILLIS.between(last, LocalDateTime.now()) < 2000) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Bạn đặt giá quá nhanh! Vui lòng đợi 2 giây."));
        }
        lastBidTime.put(key, LocalDateTime.now());

        try {
            Auction updatedAuction = auctionService.placeBid(id, amount, principal.getName());
            AuctionResponse responsePayload = AuctionResponse.fromEntity(updatedAuction);
            messagingTemplate.convertAndSend("/topic/auction/" + id, responsePayload);
            return ResponseEntity.ok(responsePayload);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
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
        return ResponseEntity.ok(auctions.stream().map(AuctionResponse::fromEntity).toList());
    }

    @GetMapping("/owner")
    public List<AuctionResponse> getMyAuctions() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return auctionRepository.findBySellerUsername(username)
                .stream().map(AuctionResponse::fromEntity).toList();
    }

    @GetMapping("/won")
    public List<AuctionResponse> getAuctionsIWon() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return auctionRepository.findByStatusAndWinnerUsername(AuctionStatus.CLOSED, username)
                .stream().map(AuctionResponse::fromEntity).toList();
    }

    @GetMapping("/participated")
    public List<AuctionResponse> getAuctionsIParticipated() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return auctionRepository.findParticipatedAuctions(username)
                .stream().map(AuctionResponse::fromEntity).toList();
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
        return ResponseEntity.ok(
                auctionService.getRecommendations(id).stream()
                        .map(AuctionResponse::fromEntity).toList()
        );
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<AuctionResponse>> getAuctionsByCategory(@PathVariable String category) {
        try {
            Category catEnum = Category.valueOf(category.toUpperCase());
            List<Auction> auctions = auctionRepository
                    .findByCategoryAndStatusOrderByStartTimeDesc(catEnum, AuctionStatus.OPEN);
            return ResponseEntity.ok(auctions.stream().map(AuctionResponse::fromEntity).toList());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}