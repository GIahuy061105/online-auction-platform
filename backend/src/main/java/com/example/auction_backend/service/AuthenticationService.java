package com.example.auction_backend.service; // Nhớ tạo package service

import com.example.auction_backend.dto.response.AuthResponse;
import com.example.auction_backend.dto.request.LoginRequest;
import com.example.auction_backend.dto.request.RegisterRequest;
import com.example.auction_backend.model.User;
import com.example.auction_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;
    // 1. Xử lý Đăng ký
    public AuthResponse register(RegisterRequest request) {
        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .balance(BigDecimal.ZERO)
                .build();

        repository.save(user);

        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .build();
    }

    // 2. Xử lý Đăng nhập
    public AuthResponse authenticate(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var user = repository.findByUsername(request.getUsername())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .build();
    }
    // ==========================================
    // CÁC HÀM XỬ LÝ QUÊN MẬT KHẨU
    // ==========================================
    public void forgotPassword (String email){
        var user = repository.findByEmail(email)
                .orElseThrow(()-> new RuntimeException("Không tìm thấy tài khoản với email này!"));
        String otp = String.format("%06d" , new Random().nextInt(999999));
        user.setResetOtp(otp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(5)); // 5 phút hết hạn
        repository.save(user);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Mã xác nhận để đổi mật khẩu - SDKAuction");
        message.setText("Chào " + user.getUsername() + ",\n\n"
                + "Mã OTP để đặt lại mật khẩu của bạn là: " + otp + "\n"
                + "Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\n"
                + "Trân trọng,\nĐội ngũ SDKAuction");
        mailSender.send(message);
    }
    public void resetPassword(String email, String otp , String newPassword){
        var user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));
        if(user.getResetOtp() == null || !user.getResetOtp().equals(otp)){
            throw new RuntimeException("Mã OTP không hợp lệ!");
        }
        if(user.getOtpExpiryTime().isBefore(LocalDateTime.now())){
            throw new RuntimeException("Mã OTP đã hết hạn! Vui lòng yêu cầu mã mới");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetOtp(null);
        user.setOtpExpiryTime(null);
        repository.save(user);
    }
}