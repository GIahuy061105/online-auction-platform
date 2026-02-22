package com.example.auction_backend.controller;

import com.example.auction_backend.dto.request.AddressRequest;
import com.example.auction_backend.dto.response.AddressResponse;
import com.example.auction_backend.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}