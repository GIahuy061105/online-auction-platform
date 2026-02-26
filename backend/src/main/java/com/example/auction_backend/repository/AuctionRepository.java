package com.example.auction_backend.repository;

import com.example.auction_backend.enums.AuctionStatus;
import com.example.auction_backend.model.Auction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AuctionRepository extends JpaRepository<Auction, Long> {

    List<Auction> findByStatusAndEndTimeBefore(AuctionStatus status, LocalDateTime now);
    List<Auction> findByStatusAndStartTimeBefore(AuctionStatus status, LocalDateTime now);
    @Query("SELECT a FROM Auction a WHERE " +
            "(:keyword IS NULL OR LOWER(a.productName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:status IS NULL OR a.status = :status)")
    List<Auction> searchAuctions(@Param("keyword") String keyword,
                                 @Param("status") AuctionStatus status);

    List<Auction> findBySellerUsername(String username);
    List<Auction> findByStatusAndWinnerUsername(AuctionStatus status , String username);

    @Query("SELECT DISTINCT b.auction FROM Bid b WHERE b.user.username = :username")
    List<Auction> findParticipatedAuctions(@Param("username") String username);

    @Query("SELECT a FROM Auction a WHERE " +
            "(a.status = 'OPEN' AND a.endTime > CURRENT_TIMESTAMP) OR " +
            "a.status = 'WAITING' OR " +
            "(a.status = 'CLOSED' AND a.endTime >= :timeLimit) " +
            "ORDER BY a.startTime DESC")
    List<Auction> findActiveAndRecentlyClosed(@Param("timeLimit") LocalDateTime timeLimit);
}