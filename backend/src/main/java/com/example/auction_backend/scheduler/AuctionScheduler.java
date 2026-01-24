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

    // Chạy mỗi 1 phút (60000ms) một lần
    // fixedRate: Tính từ lúc bắt đầu chạy lần trước
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void closeExpiredAuctions() {
        // 1. Tìm các phiên đang OPEN mà giờ kết thúc < giờ hiện tại
        List<Auction> expiredAuctions = auctionRepository.findByStatusAndEndTimeBefore(
                AuctionStatus.OPEN,
                LocalDateTime.now()
        );

        if (expiredAuctions.isEmpty()) {
            return;
        }

        // 2. Duyệt qua từng phiên và đóng lại
        for (Auction auction : expiredAuctions) {
            auction.setStatus(AuctionStatus.CLOSED);

            // Logic mở rộng sau này:
            // - Nếu có người thắng (winner != null) -> Gửi email chúc mừng
            // - Nếu không có người thắng -> Hoàn trả lại cho người bán
            System.out.println("Robot: Đã đóng phiên đấu giá ID: " + auction.getId());
        }


        auctionRepository.saveAll(expiredAuctions);
    }
}