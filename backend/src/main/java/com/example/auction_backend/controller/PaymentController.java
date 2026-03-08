// controller/PaymentController.java
package com.example.auction_backend.controller;

import com.example.auction_backend.config.VNPayConfig;
import com.example.auction_backend.model.PaymentTransaction;
import com.example.auction_backend.model.User;
import com.example.auction_backend.repository.PaymentTransactionRepository;
import com.example.auction_backend.repository.UserRepository;
import com.example.auction_backend.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;
    private final UserRepository userRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final VNPayConfig vnPayConfig;
    // Bước 1: Tạo link VNPay
    @PostMapping("/create")
    public ResponseEntity<String> createPayment(
            @RequestParam long amount,
            HttpServletRequest request) throws Exception {
        System.out.println("=== VNPAY DEBUG ===");
        System.out.println("TmnCode: [" + vnPayConfig.getTmnCode() + "]");
        System.out.println("HashSecret length: " + vnPayConfig.getHashSecret().length());
        System.out.println("IP: " + getClientIp(request));
        System.out.println("Amount: " + amount);
        System.out.println("===================");
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String txnRef = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String ipAddr = getClientIp(request);

        // Lưu giao dịch PENDING
        transactionRepository.save(PaymentTransaction.builder()
                .txnRef(txnRef)
                .user(user)
                .amount(BigDecimal.valueOf(amount))
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build());

        String paymentUrl = vnPayService.createPaymentUrl(amount, txnRef, ipAddr);
        return ResponseEntity.ok(paymentUrl);
    }

    // Bước 2: VNPay callback
    @GetMapping("/vnpay-return")
    public void vnpayReturn(
            @RequestParam Map<String, String> params,
            HttpServletResponse response) throws Exception {

        boolean valid = vnPayService.verifyReturn(params);
        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");

        PaymentTransaction tx = transactionRepository.findById(txnRef).orElse(null);

        if (valid && "00".equals(responseCode) && tx != null && "PENDING".equals(tx.getStatus())) {
            // Cộng tiền vào ví
            User user = tx.getUser();
            user.setBalance(user.getBalance().add(tx.getAmount()));
            userRepository.save(user);

            // Cập nhật trạng thái giao dịch
            tx.setStatus("SUCCESS");
            transactionRepository.save(tx);

            response.sendRedirect(
                    "https://sdkauction.vercel.app/deposit?status=success&amount=" + tx.getAmount()
            );
        } else {
            if (tx != null) {
                tx.setStatus("FAILED");
                transactionRepository.save(tx);
            }
            response.sendRedirect("https://sdkauction.vercel.app/deposit?status=failed");
        }
    }
    private String getClientIp(HttpServletRequest request) {
        String[] headers = {
                "X-Forwarded-For",
                "X-Real-IP",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP"
        };
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0].trim();
            }
        }
        String ip = request.getRemoteAddr();
        if ("127.0.0.1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip)) {
            return "1.1.1.1";
        }
        return ip;
    }
}
