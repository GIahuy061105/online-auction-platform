package com.example.auction_backend.dto.response;

import com.example.auction_backend.model.Address;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {
    private Long id;
    private String recipientName;
    private String phoneNumber;
    private String fullAddress; // Trả về chuỗi địa chỉ ghép sẵn cho tiện
    private boolean isDefault;

    public static AddressResponse fromEntity(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .recipientName(address.getRecipientName())
                .phoneNumber(address.getPhoneNumber())
                .fullAddress(address.getAddressLine() + ", " + address.getDistrict() + ", " + address.getCity())
                .isDefault(address.isDefault())
                .build();
    }
}