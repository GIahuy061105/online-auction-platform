package com.example.auction_backend.service;

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
    private final ResendEmailService emailService;

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

    public AuthResponse authenticate(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        var user = repository.findByUsername(request.getUsername()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .build();
    }

    public void forgotPassword(String email) {
        var user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này!"));
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setResetOtp(otp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(5));
        repository.save(user);

        String subject = "Mã xác nhận để đổi mật khẩu - SDKAuction";
        String text = "Chào " + user.getUsername() + ",\n\n"
                + "Mã OTP để đặt lại mật khẩu của bạn là: " + otp + "\n"
                + "Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\n"
                + "Trân trọng,\nĐội ngũ SDKAuction";
        emailService.sendEmail(email, subject, text);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        var user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));
        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
            throw new RuntimeException("Mã OTP không hợp lệ!");
        }
        if (user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn! Vui lòng yêu cầu mã mới");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetOtp(null);
        user.setOtpExpiryTime(null);
        repository.save(user);
    }
}