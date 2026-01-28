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
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final BidRepository bidRepository;

    public Auction createAuction(AuctionRequest request) {
        // 1. Lấy username của người đang đăng nhập từ Security Context
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Tìm User trong DB
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // 3. Tạo Entity Auction
        Auction auction = new Auction();
        auction.setProductName(request.getProductName());
        auction.setDescription(request.getDescription());
        auction.setStartingPrice(request.getStartingPrice());
        auction.setCurrentPrice(request.getStartingPrice());
        auction.setStepPrice(request.getStepPrice());
        auction.setStartTime(request.getStartTime());
        auction.setEndTime(request.getEndTime());
        auction.setStatus(AuctionStatus.OPEN);
        auction.setSeller(seller);

        return auctionRepository.save(auction);
    }
    public List<Auction> getAllAuctions() {
        return auctionRepository.findAll();
    }
    @Transactional
    public Auction placeBid (Long auctionId , BigDecimal bidAmount){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User bidder = userRepository.findByUsername(username).
                orElseThrow(() -> new RuntimeException("Username not found"));

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // Kiểm tra giá đặt
        BigDecimal minNextPrice = auction.getCurrentPrice().add(auction.getStepPrice());
        if(bidAmount.compareTo(minNextPrice) < 0){
            throw new RuntimeException("Giá đặt không hợp lệ! Phải tối thiểu là: " + minNextPrice);
        }
        // Kiểm tra số dư
        if(bidder.getBalance().compareTo(bidAmount) < 0){
            throw new RuntimeException("Số dư không đủ để đặt mức giá này!");
        }
        // Kiểm tra hợp lệ (Validate)
        // 1. Phiên này còn mở không?
        if (auction.getStatus() != AuctionStatus.OPEN) {
            throw new RuntimeException("Phiên đấu giá đã kết thúc!");
        }
        // Đã hết giờ chưa?
        if (LocalDateTime.now().isAfter(auction.getEndTime())) {
            auction.setStatus(AuctionStatus.CLOSED);
            auctionRepository.save(auction);
            throw new RuntimeException("Đã hết thời gian đấu giá!");
        }
        // Ko đc đấu giá sản phẩm của mình
        if (auction.getSeller().getId().equals(bidder.getId())) {
            throw new RuntimeException("Bạn không thể tự đấu giá sản phẩm của mình!");
        }
        // Tiền đặt có cao hơn giá hiện tại không?
        if (bidAmount.compareTo(auction.getCurrentPrice()) <= 0) {
            throw new RuntimeException("Giá đặt phải cao hơn giá hiện tại (" + auction.getCurrentPrice() + ")");
        }
        // Ví có đủ tiền không?
        if (bidder.getBalance().compareTo(bidAmount) < 0) {
            throw new RuntimeException("Số dư không đủ! (Ví: " + bidder.getBalance() + ")");
        }
        User PreviousWinner = auction.getWinner();
        if(PreviousWinner != null){
            BigDecimal refundAmount = auction.getCurrentPrice();
            PreviousWinner.setBalance(PreviousWinner.getBalance().add(refundAmount));
            userRepository.save(PreviousWinner);
        }
        // Trừ tiền người đấu giá
        bidder.setBalance(bidder.getBalance().subtract(bidAmount));
        userRepository.save(bidder);

        // Cập nhật giá mới cho sản phẩm
        auction.setCurrentPrice(bidAmount);
        auction.setWinner(bidder); // Tạm thời người này đang thắng
        auctionRepository.save(auction);

        // 3. Lưu lịch sử Bid
        Bid bid = new Bid();
        bid.setAuction(auction);
        bid.setUser(bidder);
        bid.setAmount(bidAmount);
        bid.setBidTime(LocalDateTime.now());
        bidRepository.save(bid);

        return auction;
    }
}