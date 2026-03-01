package com.example.auction_backend.repository;

import com.example.auction_backend.enums.AuctionStatus;
import com.example.auction_backend.enums.Category;
import com.example.auction_backend.model.Auction;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AuctionRepository extends JpaRepository<Auction, Long> {
    @EntityGraph(attributePaths = {"seller", "winner", "imageUrls"})
    @Query("SELECT a FROM Auction a WHERE a.id = :id")
    Optional<Auction> findByIdWithDetails(@Param("id") Long id);

    @EntityGraph(attributePaths = {"seller", "imageUrls"})
    List<Auction> findByStatusAndEndTimeBefore(AuctionStatus status, LocalDateTime now);

    @EntityGraph(attributePaths = {"seller", "imageUrls"})
    List<Auction> findByStatusAndStartTimeBefore(AuctionStatus status, LocalDateTime now);

    @EntityGraph(attributePaths = {"seller", "imageUrls"})
    @Query("SELECT a FROM Auction a WHERE " +
            "(:keyword IS NULL OR LOWER(a.productName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:status IS NULL OR a.status = :status)")
    List<Auction> searchAuctions(@Param("keyword") String keyword,
                                 @Param("status") AuctionStatus status);

    @EntityGraph(attributePaths = {"seller", "imageUrls"})
    List<Auction> findBySellerUsername(String username);

    @EntityGraph(attributePaths = {"seller", "winner", "imageUrls"})
    List<Auction> findByStatusAndWinnerUsername(AuctionStatus status , String username);

    @EntityGraph(attributePaths = {"seller", "imageUrls"})
    @Query("SELECT DISTINCT b.auction FROM Bid b WHERE b.user.username = :username")
    List<Auction> findParticipatedAuctions(@Param("username") String username);

    @EntityGraph(attributePaths = {"seller", "imageUrls"})
    @Query("SELECT a FROM Auction a WHERE " +
            "(a.status = 'OPEN' AND a.endTime > CURRENT_TIMESTAMP) OR " +
            "a.status = 'WAITING' OR " +
            "(a.status = 'CLOSED' AND a.endTime >= :timeLimit) " +
            "ORDER BY a.startTime DESC")
    List<Auction> findActiveAndRecentlyClosed(@Param("timeLimit") LocalDateTime timeLimit);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Auction a WHERE a.id = :id")
    Optional<Auction> findByIdForBidding(@Param("id") Long id);

    // Danh mục sản phẩm và gợi ý sản phẩm
    @EntityGraph(attributePaths = {"seller", "imageUrls"})
    List<Auction> findTop4ByCategoryAndStatusAndIdNotOrderByEndTimeAsc(Category category, AuctionStatus status, Long id);

    @EntityGraph(attributePaths = {"seller", "imageUrls"})
    List<Auction> findByCategoryAndStatusOrderByStartTimeDesc(Category category, AuctionStatus status);
}