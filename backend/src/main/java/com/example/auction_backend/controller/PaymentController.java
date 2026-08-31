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
import org.springframework.http.MediaType;
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
    public ResponseEntity<String> zalopayCallback(@RequestBody String rawPayload) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(rawPayload);

            String dataStr = root.get("data").asText();
            String reqMac = root.get("mac").asText();

            String mac = zaloPayService.hmacSHA256(zaloPayConfig.getKey2(), dataStr);
            if (!reqMac.equals(mac)) {
                System.out.println("❌ LỖI MAC - ZaloPay gửi: " + reqMac + " | Server tính: " + mac);
                System.out.println("⚠️ Môi trường Sandbox bị lệch chuỗi. TẠM THỜI BỎ QUA CHECK MAC ĐỂ CỘNG TIỀN!");
                return ResponseEntity.ok()
                      .contentType(MediaType.APPLICATION_JSON)
                .body("{\"return_code\": -1, \"return_message\": \"mac not equal\"}");
            }
            JsonNode dataJson = mapper.readTree(dataStr);
            String appTransId = dataJson.get("app_trans_id").asText();
            System.out.println("🔍 Đang xử lý giao dịch: " + appTransId);
            PaymentTransaction tx = transactionRepository.findById(appTransId).orElse(null);
            if (tx == null) {
                System.out.println("❌ Không tìm thấy giao dịch trong DB!");
            } else if (!"PENDING".equals(tx.getStatus())) {
                System.out.println("⚠️ Giao dịch này đã được xử lý trước đó rồi.");
            } else {
                User user = tx.getUser();
                user.setBalance(user.getBalance().add(tx.getAmount()));
                userRepository.save(user);

                tx.setStatus("SUCCESS");
                transactionRepository.save(tx);

                System.out.println("✅ THÀNH CÔNG: Đã cộng " + tx.getAmount() + " VND vào ví của " + user.getUsername());
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"return_code\": 1, \"return_message\": \"success\"}");

        } catch (Exception e) {
            System.out.println("❌ LỖI HỆ THỐNG: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"return_code\": 0, \"return_message\": \"fail\"}");
        }
    }
}
