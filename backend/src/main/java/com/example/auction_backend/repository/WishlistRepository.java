package com.example.auction_backend.repository;

import com.example.auction_backend.model.Auction;
import com.example.auction_backend.model.User;
import com.example.auction_backend.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Optional<Wishlist> findByUserAndAuction(User user, Auction auction);

    // Lấy danh sách các phiên đấu giá mà user đang yêu thích
    @Query("SELECT w.auction FROM Wishlist w WHERE w.user.username = :username ORDER BY w.createdAt DESC")
    List<Auction> findAuctionsByUsername(@Param("username") String username);
}