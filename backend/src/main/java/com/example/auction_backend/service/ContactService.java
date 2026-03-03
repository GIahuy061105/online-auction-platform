package com.example.auction_backend.service;

import com.example.auction_backend.dto.request.ContactRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class ContactService {
    private final JavaMailSender mailSender;
    private final ConcurrentHashMap<String, LocalDateTime> ipBlockMap = new ConcurrentHashMap<>();
    public void sendContactMessage(ContactRequest request , HttpServletRequest httpRequest) {
        String clientIP = getClientIP(httpRequest);
        LocalDateTime now = LocalDateTime.now();

        // Kiểm tra nếu email này vừa gửi trong 1 tiếng
        if (ipBlockMap.containsKey(clientIP)) {
            LocalDateTime lastSent = ipBlockMap.get(clientIP);
            if (now.isBefore(lastSent.plusHours(1))) {
                throw new RuntimeException("Bạn gửi quá nhanh! Vui lòng đợi 2 phút.");
            }
        }
        SimpleMailMessage message = getSimpleMailMessage(request);
        mailSender.send(message);
        ipBlockMap.put(clientIP, now);
    }
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    private static SimpleMailMessage getSimpleMailMessage(ContactRequest request) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo("nguyengiahu29@gmail.com");
        message.setSubject("[SDKAuction - Liên hệ mới]: " + request.getSubject());

        String content = "Bạn có một tin nhắn mới từ hệ thống SDKAuction:\n\n"
                + "👤 Người gửi: " + request.getName() + "\n"
                + "📧 Email: " + request.getEmail() + "\n"
                + "📝 Nội dung: \n" + request.getMessage() + "\n\n"
                + "--- Tin nhắn được gửi tự động từ SDKAuction ---";

        message.setText(content);
        return message;
    }
}
