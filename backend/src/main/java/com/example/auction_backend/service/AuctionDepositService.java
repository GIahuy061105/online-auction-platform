package com.example.auction_backend.service;

import com.example.auction_backend.enums.DepositStatus;
import com.example.auction_backend.model.Auction;
import com.example.auction_backend.model.AuctionDeposit;
import com.example.auction_backend.model.User;
import com.example.auction_backend.repository.AuctionDepositRepository;
import com.example.auction_backend.repository.AuctionRepository;
import com.example.auction_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuctionDepositService {

    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final AuctionDepositRepository depositRepository;

    @Transactional
    public String lockDeposit(Long userId, Long auctionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (!"OPEN".equals(auction.getStatus().name())) {
            throw new RuntimeException("Phiên đấu giá không ở trạng thái mở!");
        }

        boolean alreadyDeposited = depositRepository.existsByUserAndAuctionAndStatus(user, auction, "LOCKED");
        if (alreadyDeposited) {
            return "Bạn đã đặt cọc cho phiên này rồi.";
        }

        if (user.getBalance().compareTo(auction.getDepositAmount()) < 0) {
            throw new RuntimeException("INSUFFICIENT_BALANCE");
        }
        user.setBalance(user.getBalance().subtract(auction.getDepositAmount()));
        userRepository.save(user);

        AuctionDeposit deposit = AuctionDeposit.builder()
                .user(user)
                .auction(auction)
                .amount(auction.getDepositAmount())
                .depositStatus(DepositStatus.LOCKED)
                .createdAt(LocalDateTime.now())
                .build();
        depositRepository.save(deposit);

        return "Đặt cọc thành công! Bạn đã có thể trả giá.";
    }
}