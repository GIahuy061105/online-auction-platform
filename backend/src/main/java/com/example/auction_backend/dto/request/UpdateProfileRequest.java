package com.example.auction_backend.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String phoneNumber;
    private String fullName;
}
