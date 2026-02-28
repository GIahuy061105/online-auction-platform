package com.example.auction_backend.controller;

import com.example.auction_backend.model.Auction;
import com.example.auction_backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    // Nút thả tim / bỏ tim
    @PostMapping("/toggle/{auctionId}")
    public ResponseEntity<?> toggleWishlist(@PathVariable Long auctionId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isLiked = wishlistService.toggleWishlist(auctionId, username);
        return ResponseEntity.ok(Map.of(
                "message", isLiked ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích",
                "isLiked", isLiked
        ));
    }

    // Lấy danh sách yêu thích
    @GetMapping("/my-wishlist")
    public ResponseEntity<?> getMyWishlist() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Auction> myWishlists = wishlistService.getMyWishlist(username);
        return ResponseEntity.ok(myWishlists);
    }
    @GetMapping("/check/{auctionId}")
    public ResponseEntity<Boolean> checkWishlistStatus(@PathVariable Long auctionId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isLiked = wishlistService.checkWishlist(auctionId, username);
        return ResponseEntity.ok(isLiked); // Trả về true hoặc false
    }
}