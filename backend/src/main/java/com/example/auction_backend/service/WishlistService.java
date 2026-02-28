package com.example.auction_backend.service;

import com.example.auction_backend.model.Auction;
import com.example.auction_backend.model.User;
import com.example.auction_backend.model.Wishlist;
import com.example.auction_backend.repository.AuctionRepository;
import com.example.auction_backend.repository.UserRepository;
import com.example.auction_backend.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    @Transactional
    public boolean toggleWishlist(Long auctionId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên đấu giá!"));

        Optional<Wishlist> existingWishlist = wishlistRepository.findByUserAndAuction(user, auction);

        if (existingWishlist.isPresent()) {

            wishlistRepository.delete(existingWishlist.get());
            return false;
        } else {
            Wishlist newWishlist = new Wishlist();
            newWishlist.setUser(user);
            newWishlist.setAuction(auction);
            wishlistRepository.save(newWishlist);
            return true;
        }
    }

    public List<Auction> getMyWishlist(String username) {
        return wishlistRepository.findAuctionsByUsername(username);
    }
    public boolean checkWishlist(Long auctionId, String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        Optional<Auction> auctionOpt = auctionRepository.findById(auctionId);

        if (userOpt.isPresent() && auctionOpt.isPresent()) {
            return wishlistRepository.findByUserAndAuction(userOpt.get(), auctionOpt.get()).isPresent();
        }
        return false;
    }
}