package com.example.auction_backend.service;
import com.example.auction_backend.dto.request.AuctionRequest;
import com.example.auction_backend.model.Auction;
import com.example.auction_backend.enums.AuctionStatus;
import com.example.auction_backend.model.Bid;
import com.example.auction_backend.model.User;
import com.example.auction_backend.repository.AuctionRepository;
import com.example.auction_backend.repository.BidRepository;
import com.example.auction_backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final BidRepository bidRepository;

    public Auction createAuction(AuctionRequest request , String username) {
        // 1. Lấy username của người đang đăng nhập từ Security Context
        System.out.println("--- CREATE AUCTION ---");
        System.out.println("Ảnh nhận được: " + request.getImageUrls());

        // 2. Tìm User trong DB
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // 3. Tạo Entity Auction
        Auction auction = new Auction();
        auction.setProductName(request.getProductName());
        auction.setDescription(request.getDescription());
        auction.setStartingPrice(request.getStartingPrice());
        auction.setCurrentPrice(request.getStartingPrice());
        auction.setBuyNowPrice(request.getBuyNowPrice());
        auction.setStepPrice(request.getStepPrice());
        auction.setStartTime(request.getStartTime());
        auction.setEndTime(request.getEndTime());
        auction.setSeller(seller);
        LocalDateTime now = LocalDateTime.now();
        if(request.getImageUrls() != null && !request.getImageUrls().isEmpty()){
            auction.setImageUrls(request.getImageUrls());
        }else{
            auction.setImageUrls(new ArrayList<>());
        }
        if(request.getStartTime().isAfter(now)){
            auction.setStatus(AuctionStatus.WAITING);
        }else{
            auction.setStatus(AuctionStatus.OPEN);
        }
        return auctionRepository.save(auction);
    }
    public List<Auction> getAllAuctions() {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        return auctionRepository.findActiveAndRecentlyClosed(twentyFourHoursAgo);
    }
    @Transactional
    public Auction placeBid(Long auctionId, BigDecimal bidAmount, String username) {
        User bidder = userRepository.findByUsername(username).
                orElseThrow(() -> new RuntimeException("Username not found"));

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // --- 1. KIỂM TRA TRẠNG THÁI ---
        if (auction.getStatus() != AuctionStatus.OPEN) {
            throw new RuntimeException("Phiên đấu giá đã kết thúc hoặc chưa bắt đầu!");
        }
        if (LocalDateTime.now().isAfter(auction.getEndTime())) {
            auction.setStatus(AuctionStatus.CLOSED);
            auctionRepository.save(auction);
            throw new RuntimeException("Đã hết thời gian đấu giá!");
        }
        if (auction.getSeller().getId().equals(bidder.getId())) {
            throw new RuntimeException("Bạn không thể tự đấu giá sản phẩm của mình!");
        }
        if (auction.getWinner() != null && auction.getWinner().getId().equals(bidder.getId())) {
            throw new RuntimeException("Bạn đang dẫn đầu rồi, không cần đặt thêm nữa!");
        }

        // --- 2. KIỂM TRA GIÁ VÀ TIỀN ---
        BigDecimal minNextPrice = auction.getCurrentPrice().add(auction.getStepPrice());
        if (bidAmount.compareTo(minNextPrice) < 0) {
            throw new RuntimeException("Giá đặt không hợp lệ! Phải tối thiểu là: " + minNextPrice);
        }
        if (bidder.getBalance().compareTo(bidAmount) < 0) {
            throw new RuntimeException("Số dư không đủ! (Ví hiện tại: " + bidder.getBalance() + ")");
        }

        // --- 3. XỬ LÝ DÒNG TIỀN ---
        User previousWinner = auction.getWinner();
        if (previousWinner != null) {
            BigDecimal refundAmount = auction.getCurrentPrice();
            previousWinner.setBalance(previousWinner.getBalance().add(refundAmount));
            userRepository.save(previousWinner);
        }

        bidder.setBalance(bidder.getBalance().subtract(bidAmount));
        userRepository.save(bidder);

        // --- 4. CẬP NHẬT & LƯU ---
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
    @Transactional
    public Auction buyNow(Long auctionId, String username) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên đấu giá!"));

        // 1. Kiểm tra điều kiện
        if (auction.getStatus() != AuctionStatus.OPEN) {
            throw new RuntimeException("Phiên đấu giá này đã kết thúc hoặc chưa bắt đầu!");
        }
        if (auction.getBuyNowPrice() == null) {
            throw new RuntimeException("Sản phẩm này không hỗ trợ mua đứt!");
        }

        User buyer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        if (buyer.getBalance().compareTo(auction.getBuyNowPrice()) < 0) {
            throw new RuntimeException("Số dư không đủ để mua đứt sản phẩm này!");
        }
        User previousWinner = auction.getWinner();
        if (previousWinner != null) {
            previousWinner.setBalance(previousWinner.getBalance().add(auction.getCurrentPrice()));
            userRepository.save(previousWinner);
        }

        // 2. Thực hiện chốt đơn
        buyer.setBalance(buyer.getBalance().subtract(auction.getBuyNowPrice()));
        userRepository.save(buyer);

        User seller = auction.getSeller();
        seller.setBalance(seller.getBalance().add(auction.getBuyNowPrice()));
        userRepository.save(seller);

        auction.setCurrentPrice(auction.getBuyNowPrice());
        auction.setWinner(buyer);
        auction.setStatus(AuctionStatus.CLOSED);
        auction.setEndTime(LocalDateTime.now());
        return auctionRepository.save(auction);
    }
}