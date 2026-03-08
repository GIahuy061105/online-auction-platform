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
    public ResponseEntity<String> createPayment(@RequestParam long amount, HttpServletRequest request) throws Exception {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // CHỨC NĂNG 2: Kiểm tra hồ sơ trước khi nạp tiền/đấu giá
        if (user.getFullName() == null || user.getPhoneNumber() == null) {
            return ResponseEntity.badRequest().body("Vui lòng cập nhật Họ tên và SĐT trong hồ sơ trước!");
        }

        String txnRef = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String ipAddr = getClientIp(request);

        transactionRepository.save(PaymentTransaction.builder()
                .txnRef(txnRef)
                .user(user)
                .amount(BigDecimal.valueOf(amount))
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(vnPayService.createPaymentUrl(amount, txnRef, ipAddr));
    }

    // Bước 2: VNPay callback
    public void vnpayReturn(@RequestParam Map<String, String> params, HttpServletResponse response) {
        try {
            boolean valid = vnPayService.verifyReturn(params);
            String responseCode = params.get("vnp_ResponseCode");
            String txnRef = params.get("vnp_TxnRef");

            PaymentTransaction tx = transactionRepository.findById(txnRef).orElse(null);

            if (valid && "00".equals(responseCode) && tx != null && "PENDING".equals(tx.getStatus())) {
                User user = tx.getUser();
                user.setBalance(user.getBalance().add(tx.getAmount()));
                userRepository.save(user);

                tx.setStatus("SUCCESS");
                transactionRepository.save(tx);

                response.sendRedirect("https://sdkauction.vercel.app/deposit?status=success");
            } else {
                response.sendRedirect("https://sdkauction.vercel.app/deposit?status=failed");
            }
        } catch (Exception e) {
            e.printStackTrace();
            try { response.sendRedirect("https://sdkauction.vercel.app/deposit?status=error"); } catch (Exception ignored) {}
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
