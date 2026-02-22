package com.example.auction_backend.controller;

import com.example.auction_backend.dto.response.AuthResponse;
import com.example.auction_backend.dto.request.LoginRequest;
import com.example.auction_backend.dto.request.RegisterRequest;
import com.example.auction_backend.model.User;
import com.example.auction_backend.repository.UserRepository;
import com.example.auction_backend.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;
@RestController
@RequestMapping("/api/auth") // Đường dẫn gốc cho Auth
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService service;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        // 1. Kiểm tra username đã tồn tại chưa
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message","Lỗi: Username đã tồn tại!"));
        }
        // 2. Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message","Lỗi: Email đã được sử dụng!"));
        }
        String passwordRegex = "^(?=.*[A-Z])(?=.*\\d).{8,}$";
        if (!request.getPassword().matches(passwordRegex)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu phải có ít nhất 8 ký tự, gồm 1 chữ viết hoa và 1 chữ số!"));
        }

        // 3. Tạo user mới và MÃ HÓA mật khẩu
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setBalance(new BigDecimal("0"));

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message","Đăng ký thành công!"));
    }

    // API Đăng nhập: POST http://localhost:8080/api/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(
            @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }
}