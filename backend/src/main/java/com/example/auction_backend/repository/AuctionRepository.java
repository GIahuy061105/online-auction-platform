package com.example.auction_backend.repository;

import com.example.auction_backend.enums.AuctionStatus;
import com.example.auction_backend.model.Auction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AuctionRepository extends JpaRepository<Auction, Long> {
    // Sau này sẽ thêm các hàm như findByStatus(OPEN)...
    List<Auction> findByStatusAndEndTimeBefore(AuctionStatus status, LocalDateTime now);
}