package com.example.auction_backend.controller;

import com.example.auction_backend.model.PaymentTransaction;
import com.example.auction_backend.model.User;
import com.example.auction_backend.repository.PaymentTransactionRepository;
import com.example.auction_backend.repository.UserRepository;
import com.example.auction_backend.service.ZaloPayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final ZaloPayService zaloPayService;
    private final UserRepository userRepository;
    private final PaymentTransactionRepository transactionRepository;

    @PostMapping("/create")
    public ResponseEntity<String> createPayment(@RequestParam long amount) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            if (user.getFullName() == null || user.getPhoneNumber() == null) {
                return ResponseEntity.badRequest().body("Vui lòng cập nhật Họ tên và SĐT trong hồ sơ trước!");
            }

            String timeString = zaloPayService.getCurrentTimeString("yyMMdd");
            String txnRef = timeString + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);

            transactionRepository.save(PaymentTransaction.builder()
                    .txnRef(txnRef)
                    .user(user)
                    .amount(BigDecimal.valueOf(amount))
                    .status("PENDING")
                    .createdAt(LocalDateTime.now())
                    .build());

            String orderUrl = zaloPayService.createOrder(username, amount, txnRef);
            return ResponseEntity.ok(orderUrl);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra khi tạo giao dịch: " + e.getMessage());
        }
    }
}