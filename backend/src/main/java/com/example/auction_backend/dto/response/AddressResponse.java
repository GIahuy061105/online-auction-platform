package com.example.auction_backend.dto.response;

import com.example.auction_backend.model.Address;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {
    private Long id;
    private String recipientName;
    private String phoneNumber;
    private String fullAddress;

    @JsonProperty("isDefault")
    private boolean isDefault;

    public static AddressResponse fromEntity(Address address) {
        if (address == null) return null;
        return AddressResponse.builder()
                .id(address.getId())
                .recipientName(address.getRecipientName())
                .phoneNumber(address.getPhoneNumber())
                .fullAddress(address.getAddressLine() + ", " + address.getDistrict() + ", " + address.getCity())
                .isDefault(address.isDefault())
                .build();
    }
}