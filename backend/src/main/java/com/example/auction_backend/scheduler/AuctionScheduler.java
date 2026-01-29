package com.example.auction_backend.scheduler;

import com.example.auction_backend.model.Auction;
import com.example.auction_backend.enums.AuctionStatus;
import com.example.auction_backend.repository.AuctionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuctionScheduler {

    private final AuctionRepository auctionRepository;

    @Scheduled(fixedRate = 60000) // Chạy mỗi 1 phút
    @Transactional
    public void updateAuctionStatus() {
        LocalDateTime now = LocalDateTime.now();

        // --- NHIỆM VỤ 1: MỞ PHIÊN ĐẤU GIÁ (WAITING -> OPEN) ---
        // Tìm những phiên đang WAITING mà giờ bắt đầu <= giờ hiện tại
        List<Auction> startingAuctions = auctionRepository.findByStatusAndStartTimeBefore(
                AuctionStatus.WAITING,
                now
        );

        if (!startingAuctions.isEmpty()) {
            for (Auction auction : startingAuctions) {
                auction.setStatus(AuctionStatus.OPEN);
            }
            auctionRepository.saveAll(startingAuctions);
        }

        // --- NHIỆM VỤ 2: ĐÓNG PHIÊN ĐẤU GIÁ (OPEN -> CLOSED) ---
        // Tìm những phiên đang OPEN mà giờ kết thúc <= giờ hiện tại
        List<Auction> expiredAuctions = auctionRepository.findByStatusAndEndTimeBefore(
                AuctionStatus.OPEN,
                now
        );

        if (!expiredAuctions.isEmpty()) {
            for (Auction auction : expiredAuctions) {
                auction.setStatus(AuctionStatus.CLOSED);
            }
            auctionRepository.saveAll(expiredAuctions);
        }
    }
}