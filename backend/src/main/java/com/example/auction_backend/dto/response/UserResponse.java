package com.example.auction_backend.dto.response;
import com.example.auction_backend.model.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private String email;
    private String fullName;
    private String phoneNumber;
    private AddressResponse defaultAddress;
    private Long id;
    private String username;
    public static UserResponse fromEntity(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .defaultAddress(AddressResponse.fromEntity(user.getDefaultAddress()))
                .build();
    }
}
