package com.example.auction_backend.repository;

import com.example.auction_backend.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserId(Long userId);
    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.username = :username")
    void clearDefaultAddressForUser(@Param("username") String username);
    List<Address> findByUserUsername(String username);
}