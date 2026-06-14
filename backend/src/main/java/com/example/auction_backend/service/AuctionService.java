package com.example.auction_backend.service;

import com.example.auction_backend.dto.request.AuctionRequest;
import com.example.auction_backend.enums.Category;
import com.example.auction_backend.enums.DepositStatus;
import com.example.auction_backend.enums.PaymentStatus;
import com.example.auction_backend.model.*;
import com.example.auction_backend.enums.AuctionStatus;
import com.example.auction_backend.repository.AuctionDepositRepository;
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
    private final AuctionDepositRepository depositRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Tạo phiên đấu giá
    public Auction createAuction(AuctionRequest request, String username) {
        // Validate input cơ bản
        if (request.getProductName() == null || request.getProductName().isBlank()) {
            throw new RuntimeException("Tên sản phẩm không được để trống!");
        }
        if (request.getStartingPrice() == null || request.getStartingPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Giá khởi điểm phải lớn hơn 0!");
        }
        // Thêm Validate tiền cọc
        if (request.getDepositAmount() == null || request.getDepositAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Tiền cọc không được để trống và phải >= 0!");
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
        auction.setDepositAmount(request.getDepositAmount()); // Set tiền cọc
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

    // Đặt giá
    @Transactional
    public Auction placeBid(Long auctionId, BigDecimal bidAmount, String username) {
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

        // --- BƯỚC QUAN TRỌNG: Kiểm tra vé vào cửa (Tiền cọc) ---
        boolean hasLockedDeposit = depositRepository.existsByUserAndAuctionAndDepositStatus(bidder, auction, DepositStatus.LOCKED);
        if (!hasLockedDeposit) {
            throw new RuntimeException("Bạn phải đặt cọc trước khi đưa ra giá thầu!");
        }
        // --------------------------------------------------------

        BigDecimal minNextPrice = auction.getWinner() == null
                ? auction.getCurrentPrice()
                : auction.getCurrentPrice().add(auction.getStepPrice());

        if (bidAmount.compareTo(minNextPrice) < 0) {
            throw new RuntimeException("Giá đặt không hợp lệ! Phải tối thiểu là: " + minNextPrice);
        }

        // Tự động gia hạn nếu còn < 3 phút
        long secondsLeft = ChronoUnit.SECONDS.between(LocalDateTime.now(), auction.getEndTime());
        if (secondsLeft < 180 && secondsLeft > 0) {
            auction.setEndTime(auction.getEndTime().plusSeconds(120));
        }

        // Gửi thông báo cho người thua cũ (ĐÃ XÓA LOGIC HOÀN TIỀN VÍ)
        User previousWinner = auction.getWinner();
        if (previousWinner != null) {
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

        // Cập nhật auction
        auction.setCurrentPrice(bidAmount);
        auction.setWinner(bidder);
        auctionRepository.save(auction);

        // Lưu lịch sử Bid
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

        // Tính toán số tiền thực tế phải trừ (nếu người này đã cọc rồi thì trừ phần cọc ra)
        boolean hasLockedDeposit = depositRepository.existsByUserAndAuctionAndDepositStatus(buyer, auction, DepositStatus.LOCKED);
        BigDecimal finalPriceToPay = hasLockedDeposit
                ? auction.getBuyNowPrice().subtract(auction.getDepositAmount())
                : auction.getBuyNowPrice();

        if (buyer.getBalance().compareTo(finalPriceToPay) < 0) {
            throw new RuntimeException("Số dư không đủ để mua đứt sản phẩm này!");
        }

        // Trừ tiền người mua, cộng tiền người bán
        buyer.setBalance(buyer.getBalance().subtract(finalPriceToPay));
        userRepository.save(buyer);

        User seller = auction.getSeller();
        seller.setBalance(seller.getBalance().add(auction.getBuyNowPrice()));
        userRepository.save(seller);

        if (hasLockedDeposit) {
            AuctionDeposit deposit = depositRepository
                    .findByUserAndAuction(buyer, auction)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin cọc"));
            deposit.setDepositStatus(DepositStatus.COMPLETED);
            depositRepository.save(deposit);
        }

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
        auction.setPaymentStatus(PaymentStatus.PAID);
        return auctionRepository.save(auction);
    }

    public List<Auction> getAllAuctions() {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        return auctionRepository.findActiveAndRecentlyClosed(twentyFourHoursAgo);
    }

    public List<Auction> getRecommendations(Long currentAuctionId) {
        Auction currentAuction = auctionRepository.findById(currentAuctionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên đấu giá"));
        Category currentCategory = currentAuction.getCategory() != null
                ? currentAuction.getCategory() : Category.OTHER_ELECTRONICS;
        return auctionRepository.findTop4ByCategoryAndStatusAndIdNotOrderByEndTimeAsc(
                currentCategory, AuctionStatus.OPEN, currentAuctionId);
    }

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
    @Transactional
    public String payRemainingBalance(Long auctionId, String username) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên đấu giá"));
        if (auction.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException(
                    "Phiên đấu giá này đã được thanh toán rồi!");
        }
        if (auction.getStatus() != AuctionStatus.CLOSED) {
            throw new RuntimeException("Phiên đấu giá chưa kết thúc!");
        }
        User winner = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (auction.getWinner() == null || !auction.getWinner().getId().equals(winner.getId())) {
            throw new RuntimeException("Bạn không phải là người chiến thắng phiên này!");
        }

        AuctionDeposit deposit = depositRepository.findByUserAndAuction(winner, auction)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin đặt cọc"));

        if (deposit.getDepositStatus() != DepositStatus.AWAITING_PAYMENT) {
            throw new RuntimeException("Đơn hàng này đã được thanh toán hoặc trạng thái không hợp lệ!");
        }

        BigDecimal remainingAmount = auction.getCurrentPrice().subtract(deposit.getAmount());

        if (winner.getBalance().compareTo(remainingAmount) < 0) {
            throw new RuntimeException("Số dư ví không đủ (" + winner.getBalance() + "đ). Vui lòng nạp thêm " + remainingAmount.subtract(winner.getBalance()) + "đ qua VNPAY để thanh toán.");
        }
        deposit.setDepositStatus(DepositStatus.COMPLETED);
        depositRepository.save(deposit);

        winner.setBalance(winner.getBalance().subtract(remainingAmount));
        userRepository.save(winner);

        User seller = auction.getSeller();
        seller.setBalance(seller.getBalance().add(auction.getCurrentPrice()));
        userRepository.save(seller);

        auction.setPaymentStatus(PaymentStatus.PAID);
        auctionRepository.save(auction);

        Map<String, Object> sellerNotif = new HashMap<>();
        sellerNotif.put("title", "📦 Người mua đã thanh toán!");
        sellerNotif.put("message", "Tài khoản " + winner.getUsername() + " đã thanh toán đủ tiền cho: " + auction.getProductName() + ". Bạn đã nhận được " + auction.getCurrentPrice() + "đ vào ví. Vui lòng giao hàng!");
        sellerNotif.put("auctionId", auction.getId());
        sellerNotif.put("type", "success");
        messagingTemplate.convertAndSend("/topic/notifications/" + seller.getUsername(), (Object) sellerNotif);

        return "Thanh toán thành công! Người bán đã nhận được thông báo để giao hàng.";
    }
    @Transactional
    public String lockDeposit(Long auctionId, String username) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên đấu giá"));

        if (auction.getStatus() != AuctionStatus.OPEN) {
            throw new RuntimeException("Phiên đấu giá không ở trạng thái mở!");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // 1. Kiểm tra xem đã cọc chưa
        boolean alreadyDeposited = depositRepository.existsByUserAndAuctionAndDepositStatus(user, auction ,DepositStatus.LOCKED);
        if (alreadyDeposited) {
            return "Bạn đã đặt cọc cho phiên này rồi!";
        }

        // 2. Kiểm tra số dư ví
        if (user.getBalance().compareTo(auction.getDepositAmount()) < 0) {
            throw new RuntimeException("INSUFFICIENT_BALANCE");
        }

        // 3. Trừ tiền ví
        user.setBalance(user.getBalance().subtract(auction.getDepositAmount()));
        userRepository.save(user);

        // 4. Lưu lịch sử cọc
        com.example.auction_backend.model.AuctionDeposit deposit = new com.example.auction_backend.model.AuctionDeposit();
        deposit.setUser(user);
        deposit.setAuction(auction);
        deposit.setAmount(auction.getDepositAmount());
        deposit.setDepositStatus(DepositStatus.LOCKED);
        deposit.setCreatedAt(LocalDateTime.now());
        depositRepository.save(deposit);

        return "Khóa cọc thành công! Bạn đã có thể trả giá.";
    }
    public boolean checkUserDeposited(Long auctionId, String username) {
        java.util.Optional<Auction> auctionOpt = auctionRepository.findById(auctionId);
        java.util.Optional<User> userOpt = userRepository.findByUsername(username);

        if (auctionOpt.isEmpty() || userOpt.isEmpty()) {
            return false;
        }
        return depositRepository.findByUserAndAuction(userOpt.get(), auctionOpt.get()).isPresent();
    }
}