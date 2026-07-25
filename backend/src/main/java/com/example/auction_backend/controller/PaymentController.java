package com.example.auction_backend.controller;

import com.example.auction_backend.config.ZaloPayConfig;
import com.example.auction_backend.model.PaymentTransaction;
import com.example.auction_backend.model.User;
import com.example.auction_backend.repository.PaymentTransactionRepository;
import com.example.auction_backend.repository.UserRepository;
import com.example.auction_backend.service.ZaloPayService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final ZaloPayService zaloPayService;
    private final UserRepository userRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final ZaloPayConfig zaloPayConfig;

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
    @PostMapping("/zalopay-callback")
    public ResponseEntity<Map<String, Object>> zalopayCallback(@RequestBody Map<String, Object> callbackData) {
        System.out.println("🚀🚀🚀 ZALOPAY GỌI WEBHOOK: " + callbackData);
        Map<String, Object> result = new HashMap<>();
        try {
            String dataStr = (String) callbackData.get("data");
            String reqMac = (String) callbackData.get("mac");
            String mac = zaloPayService.hmacSHA256(zaloPayConfig.getKey2(), dataStr);
            if (!reqMac.equals(mac)) {
                System.out.println("❌ LỖI: Chữ ký MAC không khớp! (Có thể sai Key2)");
                result.put("return_code", -1);
                result.put("return_message", "mac not equal");
                return ResponseEntity.ok(result);
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode dataJson = mapper.readTree(dataStr);
            String appTransId = dataJson.get("app_trans_id").asText();

            System.out.println("🔍 Đang tìm giao dịch trong Database: " + appTransId);

            PaymentTransaction tx = transactionRepository.findById(appTransId).orElse(null);

            if (tx == null) {
                System.out.println("❌ LỖI: Không tìm thấy giao dịch " + appTransId + " trong DB!");
            } else if (!"PENDING".equals(tx.getStatus())) {
                System.out.println("⚠️ Giao dịch này đã được cộng tiền trước đó rồi!");
            } else {
                User user = tx.getUser();
                user.setBalance(user.getBalance().add(tx.getAmount()));
                userRepository.save(user);

                tx.setStatus("SUCCESS");
                transactionRepository.save(tx);

                System.out.println("✅ THÀNH CÔNG: Đã cộng " + tx.getAmount() + " VND vào ví của " + user.getUsername());
            }
            result.put("return_code", 1);
            result.put("return_message", "success");
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            System.out.println("❌ LỖI HỆ THỐNG: " + e.getMessage());
            e.printStackTrace();

            result.put("return_code", 0);
            result.put("return_message", e.getMessage());
            return ResponseEntity.ok(result);
        }
    }
}