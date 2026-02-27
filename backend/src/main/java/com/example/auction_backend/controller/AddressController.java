package com.example.auction_backend.controller;

import com.example.auction_backend.dto.request.AddressRequest;
import com.example.auction_backend.dto.response.AddressResponse;
import com.example.auction_backend.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getMyAddresses() {
        return ResponseEntity.ok(addressService.getMyAddresses().stream()
                .map(AddressResponse::fromEntity)
                .toList());
    }

    @PostMapping
    public ResponseEntity<AddressResponse> addAddress(@RequestBody AddressRequest request) {
        return ResponseEntity.ok(AddressResponse.fromEntity(addressService.addAddress(request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok().build();
    }
    @PutMapping("/{id}/default")
    public ResponseEntity<?> setDefaultAddress(@PathVariable Long id , Principal principal){
        try {
            // Lấy username từ Token của người đang đăng nhập
            String username = principal.getName();

            // Gọi Service xử lý
            addressService.setDefaultAddress(id, username);

            // Trả về thành công
            return ResponseEntity.ok().body(Map.of("message", "Cập nhật địa chỉ mặc định thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}