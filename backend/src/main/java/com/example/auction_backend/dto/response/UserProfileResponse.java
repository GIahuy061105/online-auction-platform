package com.example.auction_backend.dto.response;
import com.example.auction_backend.model.User;
import lombok.Data;
import lombok.Builder;

import java.math.BigDecimal;

@Data
@Builder
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private BigDecimal balance;
    private String fullName;
    private String phoneNumber;

    public static UserProfileResponse fromEntity(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .balance(user.getBalance())
                .build();
    }
}
