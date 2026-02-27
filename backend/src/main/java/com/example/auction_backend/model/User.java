package com.example.auction_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails { // Bắt buộc phải implements UserDetails

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column (name = "fullname")
    private String fullName;

    @Column (name = "phonenumber")
    private String phoneNumber;

    @Column(nullable = false)
    private BigDecimal balance;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Bid> bids;

    @JsonIgnore
    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL)
    private List<Auction> auctions;


    // Địa chỉ giao hàng
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Address> addresses;
    @JsonIgnore
    public Address getDefaultAddress() {
        if (addresses == null || addresses.isEmpty()) return null;
        return addresses.stream()
                .filter(Address::isDefault)
                .findFirst()
                .orElse(addresses.get(0));
    }
    //--- Cho việc lấy lại mật khẩu
    @Column(name = "reset_otp", length = 6)
    private String resetOtp;

    @Column(name = "otp_expiry_time")
    private LocalDateTime otpExpiryTime;

    // --- CÁC HÀM CỦA SPRING SECURITY (UserDetails) ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Tạm thời trả về quyền USER cho tất cả mọi người
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Quan trọng: Phải là true
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Quan trọng: Phải là true
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Quan trọng: Phải là true
    }

    @Override
    public boolean isEnabled() {
        return true; // Quan trọng: Phải là true
    }
}