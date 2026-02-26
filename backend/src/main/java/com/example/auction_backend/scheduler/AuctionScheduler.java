package com.example.auction_backend.scheduler;

import com.example.auction_backend.dto.response.AuctionResponse; // LƯU Ý: Import thêm DTO này
import com.example.auction_backend.model.Auction;
import com.example.auction_backend.enums.AuctionStatus;
import com.example.auction_backend.model.User;
import com.example.auction_backend.repository.AuctionRepository;
import com.example.auction_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuctionScheduler {

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedRate = 60000) // Chạy mỗi 1 phút
    @Transactional
    public void updateAuctionStatus() {
        LocalDateTime now = LocalDateTime.now();

        // ---  1: MỞ PHIÊN ĐẤU GIÁ (WAITING -> OPEN) ---
        List<Auction> startingAuctions = auctionRepository.findByStatusAndStartTimeBefore(
                AuctionStatus.WAITING,
                now
        );

        if (!startingAuctions.isEmpty()) {
            for (Auction auction : startingAuctions) {
                auction.setStatus(AuctionStatus.OPEN);

                // (Tùy chọn) Bắn WebSocket báo có hàng mới lên sàn
                messagingTemplate.convertAndSend("/topic/auctions/", AuctionResponse.fromEntity(auction));
            }
            auctionRepository.saveAll(startingAuctions);
        }

        // ---  2: ĐÓNG PHIÊN ĐẤU GIÁ (OPEN -> CLOSED) ---
        List<Auction> expiredAuctions = auctionRepository.findByStatusAndEndTimeBefore(
                AuctionStatus.OPEN,
                now
        );

        if (!expiredAuctions.isEmpty()) {
            for (Auction auction : expiredAuctions) {
                auction.setStatus(AuctionStatus.CLOSED);

                User winner = auction.getWinner();
                if (winner != null) {
                    User seller = auction.getSeller();
                    BigDecimal finalPrice = auction.getCurrentPrice();

                    // 👇 BỔ SUNG: Chuyển tiền cho người bán
                    seller.setBalance(seller.getBalance().add(finalPrice));
                    userRepository.save(seller);
                }

                // 👇 BỔ SUNG: Bắn WebSocket báo hiệu phiên đã kết thúc
                AuctionResponse responsePayload = AuctionResponse.fromEntity(auction);
                messagingTemplate.convertAndSend("/topic/auction/" + auction.getId(), responsePayload);
                messagingTemplate.convertAndSend("/topic/auctions/", responsePayload);
            }
            auctionRepository.saveAll(expiredAuctions); // Lưu lại toàn bộ trạng thái
        }
    }
}