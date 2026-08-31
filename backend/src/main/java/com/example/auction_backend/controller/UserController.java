package com.example.auction_backend.controller;

import com.example.auction_backend.dto.request.ContactRequest;
import com.example.auction_backend.dto.request.UpdateProfileRequest;
import com.example.auction_backend.dto.response.UserProfileResponse;
import com.example.auction_backend.model.User;
import com.example.auction_backend.repository.UserRepository;
import com.example.auction_backend.service.CloudinaryService;
import com.example.auction_backend.service.ContactService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final ContactService contactService;
    private final CloudinaryService cloudinaryService;
    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
        }

        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return ResponseEntity.ok(UserProfileResponse.fromEntity(user));
    }
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
        }

        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(UserProfileResponse.fromEntity(updatedUser));
    }
    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!"));
            }

            String username = auth.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            String avatarUrl = cloudinaryService.uploadFile(file);
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    @PostMapping("/contact")
    public ResponseEntity<?> contact(@RequestBody ContactRequest request, HttpServletRequest httpRequest) {
        contactService.sendContactMessage(request, httpRequest);
        return ResponseEntity.ok("Đã gửi tin nhắn thành công!");
    }
}