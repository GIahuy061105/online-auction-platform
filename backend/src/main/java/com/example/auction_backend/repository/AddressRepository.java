package com.example.auction_backend.repository;

import com.example.auction_backend.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserId(Long userId);
}