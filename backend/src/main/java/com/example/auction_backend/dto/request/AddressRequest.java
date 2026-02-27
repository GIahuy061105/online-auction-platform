package com.example.auction_backend.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class AddressRequest {
    private String recipientName;
    private String phoneNumber;
    private String addressLine;
    private String city;
    private String district;
    private boolean isDefault;
}