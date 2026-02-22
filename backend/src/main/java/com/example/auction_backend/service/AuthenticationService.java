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

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

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
}