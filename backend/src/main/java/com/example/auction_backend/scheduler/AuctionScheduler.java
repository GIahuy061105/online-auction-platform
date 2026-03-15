package com.example.auction_backend.scheduler;

import com.example.auction_backend.dto.response.AuctionResponse;
import com.example.auction_backend.model.Address;
import com.example.auction_backend.model.Auction;
import com.example.auction_backend.enums.AuctionStatus;
import com.example.auction_backend.model.User;
import com.example.auction_backend.repository.AuctionRepository;
import com.example.auction_backend.repository.UserRepository;
import com.example.auction_backend.service.ResendEmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuctionScheduler {

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ResendEmailService emailService;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void updateAuctionStatus() {
        LocalDateTime now = LocalDateTime.now();

        // 1: MỞ PHIÊN (WAITING -> OPEN)
        List<Auction> startingAuctions = auctionRepository.findByStatusAndStartTimeBefore(
                AuctionStatus.WAITING, now);
        if (!startingAuctions.isEmpty()) {
            for (Auction auction : startingAuctions) {
                auction.setStatus(AuctionStatus.OPEN);
                messagingTemplate.convertAndSend("/topic/auctions/", AuctionResponse.fromEntity(auction));
            }
            auctionRepository.saveAll(startingAuctions);
        }

        // 2: ĐÓNG PHIÊN (OPEN -> CLOSED)
        List<Auction> expiredAuctions = auctionRepository.findByStatusAndEndTimeBefore(
                AuctionStatus.OPEN, now);
        if (!expiredAuctions.isEmpty()) {
            for (Auction auction : expiredAuctions) {
                auction.setStatus(AuctionStatus.CLOSED);

                User winner = auction.getWinner();
                User seller = auction.getSeller();
                BigDecimal finalPrice = auction.getCurrentPrice();

                if (winner != null) {
                    // Cộng tiền seller
                    seller.setBalance(seller.getBalance().add(finalPrice));
                    userRepository.save(seller);

                    // Lưu địa chỉ giao hàng
                    Address defaultAddr = winner.getDefaultAddress();
                    if (defaultAddr != null) {
                        auction.setDeliveryRecipientName(defaultAddr.getRecipientName());
                        auction.setDeliveryPhone(defaultAddr.getPhoneNumber());
                        auction.setDeliveryAddress(defaultAddr.getAddressLine() + ", "
                                + defaultAddr.getDistrict() + ", " + defaultAddr.getCity());
                    }

                    // Thông báo real-time cho WINNER
                    Map<String, Object> winnerNotif = new HashMap<>();
                    winnerNotif.put("title", "🏆 Chúc mừng! Bạn đã thắng!");
                    winnerNotif.put("message", "Bạn đã thắng phiên đấu giá: " + auction.getProductName()
                            + " với giá " + finalPrice + "đ");
                    winnerNotif.put("auctionId", auction.getId());
                    winnerNotif.put("type", "success");
                    messagingTemplate.convertAndSend(
                            "/topic/notifications/" + winner.getUsername(), (Object) winnerNotif);

                    // Thông báo real-time cho SELLER
                    Map<String, Object> sellerNotif = new HashMap<>();
                    sellerNotif.put("title", "💰 Sản phẩm đã được bán!");
                    sellerNotif.put("message", "Sản phẩm " + auction.getProductName()
                            + " đã kết thúc. Người thắng: " + winner.getUsername()
                            + " | Giá chốt: " + finalPrice + "đ");
                    sellerNotif.put("auctionId", auction.getId());
                    sellerNotif.put("type", "success");
                    messagingTemplate.convertAndSend(
                            "/topic/notifications/" + seller.getUsername(), (Object) sellerNotif);

                    // Gửi email cho WINNER
                    try {
                        if (winner.getEmail() != null) {
                            emailService.sendEmail(
                                    winner.getEmail(),
                                    "🏆 Bạn đã thắng đấu giá - SDKAuction",
                                    "Chào " + winner.getUsername() + ",\n\n"
                                            + "Chúc mừng! Bạn đã thắng phiên đấu giá:\n"
                                            + "Sản phẩm: " + auction.getProductName() + "\n"
                                            + "Giá chốt: " + finalPrice + "đ\n\n"
                                            + "Người bán sẽ liên hệ giao hàng sớm nhất có thể.\n\n"
                                            + "Trân trọng,\nĐội ngũ SDKAuction"
                            );
                        }
                    } catch (Exception e) {
                        System.err.println("Lỗi gửi email winner: " + e.getMessage());
                    }

                    // Gửi email cho SELLER
                    try {
                        if (seller.getEmail() != null) {
                            emailService.sendEmail(
                                    seller.getEmail(),
                                    "💰 Sản phẩm đã được bán - SDKAuction",
                                    "Chào " + seller.getUsername() + ",\n\n"
                                            + "Sản phẩm của bạn đã được bán thành công:\n"
                                            + "Sản phẩm: " + auction.getProductName() + "\n"
                                            + "Giá chốt: " + finalPrice + "đ\n"
                                            + "Người mua: " + winner.getUsername() + "\n\n"
                                            + "Số tiền đã được cộng vào ví của bạn.\n"
                                            + "Vui lòng vào Cửa hàng để xem thông tin giao hàng.\n\n"
                                            + "Trân trọng,\nĐội ngũ SDKAuction"
                            );
                        }
                    } catch (Exception e) {
                        System.err.println("Lỗi gửi email seller: " + e.getMessage());
                    }

                } else {
                    // Không có ai đấu giá
                    Map<String, Object> noWinnerNotif = new HashMap<>();
                    noWinnerNotif.put("title", "📭 Phiên đấu giá kết thúc");
                    noWinnerNotif.put("message", "Sản phẩm " + auction.getProductName()
                            + " không có người tham gia đấu giá.");
                    noWinnerNotif.put("auctionId", auction.getId());
                    noWinnerNotif.put("type", "info");
                    messagingTemplate.convertAndSend(
                            "/topic/notifications/" + seller.getUsername(), (Object) noWinnerNotif);
                }

                AuctionResponse responsePayload = AuctionResponse.fromEntity(auction);
                messagingTemplate.convertAndSend("/topic/auction/" + auction.getId(), responsePayload);
                messagingTemplate.convertAndSend("/topic/auctions/", responsePayload);
            }
            auctionRepository.saveAll(expiredAuctions);
        }
    }
}