package com.example.auction_backend.service;

import com.example.auction_backend.dto.request.AuctionRequest;
import com.example.auction_backend.enums.Category;
import com.example.auction_backend.model.Address;
import com.example.auction_backend.model.Auction;
import com.example.auction_backend.enums.AuctionStatus;
import com.example.auction_backend.model.Bid;
import com.example.auction_backend.model.User;
import com.example.auction_backend.repository.AuctionRepository;
import com.example.auction_backend.repository.BidRepository;
import com.example.auction_backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final BidRepository bidRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Tạo phiên đấu giá
    public Auction createAuction(AuctionRequest request, String username) {
        // ✅ Validate input
        if (request.getProductName() == null || request.getProductName().isBlank()) {
            throw new RuntimeException("Tên sản phẩm không được để trống!");
        }
        if (request.getStartingPrice() == null || request.getStartingPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Giá khởi điểm phải lớn hơn 0!");
        }
        if (request.getStepPrice() == null || request.getStepPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Bước giá phải lớn hơn 0!");
        }
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new RuntimeException("Thời gian bắt đầu và kết thúc không được để trống!");
        }
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new RuntimeException("Thời gian kết thúc phải sau thời gian bắt đầu!");
        }
        if (request.getEndTime().isBefore(LocalDateTime.now().plusMinutes(5))) {
            throw new RuntimeException("Thời gian kết thúc phải ít nhất 5 phút kể từ bây giờ!");
        }
        if (request.getBuyNowPrice() != null
                && request.getBuyNowPrice().compareTo(request.getStartingPrice()) <= 0) {
            throw new RuntimeException("Giá mua đứt phải lớn hơn giá khởi điểm!");
        }

        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Auction auction = new Auction();
        auction.setProductName(request.getProductName().trim());
        auction.setDescription(request.getDescription());
        auction.setStartingPrice(request.getStartingPrice());
        auction.setCurrentPrice(request.getStartingPrice());
        auction.setBuyNowPrice(request.getBuyNowPrice());
        auction.setStepPrice(request.getStepPrice());
        auction.setStartTime(request.getStartTime());
        auction.setEndTime(request.getEndTime());
        auction.setSeller(seller);
        auction.setCategory(request.getCategory() != null ? request.getCategory() : Category.OTHER_ELECTRONICS);
        auction.setImageUrls(
                (request.getImageUrls() != null && !request.getImageUrls().isEmpty())
                        ? request.getImageUrls()
                        : new ArrayList<>()
        );

        LocalDateTime now = LocalDateTime.now();
        auction.setStatus(request.getStartTime().isAfter(now) ? AuctionStatus.WAITING : AuctionStatus.OPEN);

        return auctionRepository.save(auction);
    }

    // Lấy tất cả phiên
    public List<Auction> getAllAuctions() {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        return auctionRepository.findActiveAndRecentlyClosed(twentyFourHoursAgo);
    }

    // Đặt giá
    @Transactional
    public Auction placeBid(Long auctionId, BigDecimal bidAmount, String username) {
        // ✅ Validate giá bid
        if (bidAmount == null || bidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Giá đặt phải lớn hơn 0!");
        }

        User bidder = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tên người dùng"));
        validateUserProfile(bidder);

        Auction auction = auctionRepository.findByIdForBidding(auctionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên đấu giá"));

        if (auction.getStatus() != AuctionStatus.OPEN) {
            throw new RuntimeException("Phiên đấu giá đã kết thúc hoặc chưa bắt đầu!");
        }
        if (LocalDateTime.now().isAfter(auction.getEndTime())) {
            throw new RuntimeException("Đã hết thời gian đấu giá!");
        }
        if (auction.getSeller().getId().equals(bidder.getId())) {
            throw new RuntimeException("Bạn không thể tự đấu giá sản phẩm của mình!");
        }
        if (auction.getWinner() != null && auction.getWinner().getId().equals(bidder.getId())) {
            throw new RuntimeException("Bạn đang dẫn đầu rồi, không cần đặt thêm nữa!");
        }

        BigDecimal minNextPrice = auction.getWinner() == null
                ? auction.getCurrentPrice()
                : auction.getCurrentPrice().add(auction.getStepPrice());

        if (bidAmount.compareTo(minNextPrice) < 0) {
            throw new RuntimeException("Giá đặt không hợp lệ! Phải tối thiểu là: " + minNextPrice);
        }
        if (bidder.getBalance().compareTo(bidAmount) < 0) {
            throw new RuntimeException("Số dư không đủ! (Ví hiện tại: " + bidder.getBalance() + ")");
        }

        // Tự động gia hạn nếu còn < 3 phút
        long secondsLeft = ChronoUnit.SECONDS.between(LocalDateTime.now(), auction.getEndTime());
        if (secondsLeft < 180 && secondsLeft > 0) {
            auction.setEndTime(auction.getEndTime().plusSeconds(120));
        }

        // Hoàn tiền người thua
        User previousWinner = auction.getWinner();
        if (previousWinner != null) {
            previousWinner.setBalance(previousWinner.getBalance().add(auction.getCurrentPrice()));
            userRepository.save(previousWinner);

            Map<String, Object> outbidNotif = new HashMap<>();
            outbidNotif.put("title", "⚠️ Bị vượt giá!");
            outbidNotif.put("message", "Tài khoản " + bidder.getUsername()
                    + " vừa trả giá cao hơn bạn cho món: " + auction.getProductName());
            outbidNotif.put("auctionId", auction.getId());
            outbidNotif.put("type", "warning");
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + previousWinner.getUsername(), (Object) outbidNotif);
        }

        // Thông báo cho seller
        Map<String, Object> sellerNotif = new HashMap<>();
        sellerNotif.put("title", "🎉 Có người đặt giá!");
        sellerNotif.put("message", bidder.getUsername() + " vừa đặt " + bidAmount
                + "đ cho sản phẩm " + auction.getProductName());
        sellerNotif.put("auctionId", auction.getId());
        sellerNotif.put("type", "success");
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + auction.getSeller().getUsername(), (Object) sellerNotif);

        // Trừ tiền bidder
        bidder.setBalance(bidder.getBalance().subtract(bidAmount));
        userRepository.save(bidder);

        // Cập nhật auction
        auction.setCurrentPrice(bidAmount);
        auction.setWinner(bidder);
        auctionRepository.save(auction);

        Bid bid = new Bid();
        bid.setAuction(auction);
        bid.setUser(bidder);
        bid.setAmount(bidAmount);
        bid.setBidTime(LocalDateTime.now());
        bidRepository.save(bid);

        return auction;
    }

    // Mua đứt
    @Transactional
    public Auction buyNow(Long auctionId, String username) {
        Auction auction = auctionRepository.findByIdWithDetails(auctionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên đấu giá!"));

        if (auction.getStatus() != AuctionStatus.OPEN) {
            throw new RuntimeException("Phiên đấu giá này đã kết thúc hoặc chưa bắt đầu!");
        }
        if (auction.getBuyNowPrice() == null) {
            throw new RuntimeException("Sản phẩm này không hỗ trợ mua đứt!");
        }

        User buyer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        validateUserProfile(buyer);

        if (auction.getSeller().getId().equals(buyer.getId())) {
            throw new RuntimeException("Bạn không thể tự mua sản phẩm của mình!");
        }
        if (buyer.getBalance().compareTo(auction.getBuyNowPrice()) < 0) {
            throw new RuntimeException("Số dư không đủ để mua đứt sản phẩm này!");
        }

        // Hoàn tiền người đang dẫn đầu (nếu có)
        User previousWinner = auction.getWinner();
        if (previousWinner != null) {
            previousWinner.setBalance(previousWinner.getBalance().add(auction.getCurrentPrice()));
            userRepository.save(previousWinner);
        }

        // Trừ tiền buyer, cộng tiền seller
        buyer.setBalance(buyer.getBalance().subtract(auction.getBuyNowPrice()));
        userRepository.save(buyer);

        User seller = auction.getSeller();
        seller.setBalance(seller.getBalance().add(auction.getBuyNowPrice()));
        userRepository.save(seller);

        // Lưu địa chỉ giao hàng
        Address defaultAddr = buyer.getDefaultAddress();
        if (defaultAddr != null) {
            auction.setDeliveryRecipientName(defaultAddr.getRecipientName());
            auction.setDeliveryPhone(defaultAddr.getPhoneNumber());
            auction.setDeliveryAddress(defaultAddr.getAddressLine() + ", "
                    + defaultAddr.getDistrict() + ", " + defaultAddr.getCity());
        }

        auction.setCurrentPrice(auction.getBuyNowPrice());
        auction.setWinner(buyer);
        auction.setStatus(AuctionStatus.CLOSED);
        auction.setEndTime(LocalDateTime.now());
        return auctionRepository.save(auction);
    }

    // Gợi ý sản phẩm
    public List<Auction> getRecommendations(Long currentAuctionId) {
        Auction currentAuction = auctionRepository.findById(currentAuctionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên đấu giá"));
        Category currentCategory = currentAuction.getCategory() != null
                ? currentAuction.getCategory() : Category.OTHER_ELECTRONICS;
        return auctionRepository.findTop4ByCategoryAndStatusAndIdNotOrderByEndTimeAsc(
                currentCategory, AuctionStatus.OPEN, currentAuctionId);
    }

    // Validate hồ sơ user
    private void validateUserProfile(User user) {
        if (user.getFullName() == null || user.getFullName().isBlank()) {
            throw new RuntimeException("Bạn cần cập nhật họ tên trước khi tham gia đấu giá!");
        }
        if (user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()) {
            throw new RuntimeException("Bạn cần cập nhật số điện thoại trước khi tham gia đấu giá!");
        }
        if (user.getAddresses() == null || user.getAddresses().isEmpty()) {
            throw new RuntimeException("Bạn cần thêm địa chỉ giao hàng trước khi tham gia đấu giá!");
        }
    }
}