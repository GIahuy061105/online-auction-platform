package com.example.auction_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String recipientName; // Tên người nhận (có thể khác tên user)
    private String phoneNumber;   // SĐT người nhận
    private String addressLine;   // Số nhà, đường
    private String city;          // Tỉnh/Thành phố
    private String district;      // Quận/Huyện

    @JsonProperty("isDefault")
    private boolean isDefault;    // Địa chỉ mặc định

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}