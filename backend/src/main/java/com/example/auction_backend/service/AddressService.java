package com.example.auction_backend.service;

import com.example.auction_backend.dto.request.AddressRequest;
import com.example.auction_backend.model.Address;
import com.example.auction_backend.model.User;
import com.example.auction_backend.repository.AddressRepository;
import com.example.auction_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<Address> getMyAddresses() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        return addressRepository.findByUserId(user.getId());
    }

    @Transactional
    public Address addAddress(AddressRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        // Nếu đây là địa chỉ đầu tiên, tự động set mặc định
        List<Address> existing = addressRepository.findByUserId(user.getId());
        boolean isFirst = existing.isEmpty();

        if (request.isDefault() && !isFirst) {
            // Nếu user muốn set cái mới là mặc định -> bỏ mặc định các cái cũ
            for (Address addr : existing) {
                addr.setDefault(false);
            }
            addressRepository.saveAll(existing);
        }

        Address address = new Address();
        address.setRecipientName(request.getRecipientName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setAddressLine(request.getAddressLine());
        address.setCity(request.getCity());
        address.setDistrict(request.getDistrict());
        address.setDefault(isFirst || request.isDefault());
        address.setUser(user);

        return addressRepository.save(address);
    }

    public void deleteAddress(Long id) {
        addressRepository.deleteById(id);
    }
}