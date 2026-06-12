package com.example.auction_backend.repository;

import com.example.auction_backend.model.Auction;
import com.example.auction_backend.model.AuctionDeposit;
import com.example.auction_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionDepositRepository extends JpaRepository<AuctionDeposit, Long> {
    boolean existsByUserAndAuctionAndStatus(User user, Auction auction, String status);

    List<AuctionDeposit> findByAuction(Auction auction);
    Optional<AuctionDeposit> findByUserAndAuction(User user, Auction auction);
}