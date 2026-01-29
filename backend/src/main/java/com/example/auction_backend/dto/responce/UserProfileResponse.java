package com.example.auction_backend.dto.responce;
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

    public static UserProfileResponse fromEntity(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .balance(user.getBalance())
                .build();
    }
}
