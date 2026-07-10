package com.example.auction_backend.model;

import com.example.auction_backend.enums.Role;
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

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(nullable = false)
    private BigDecimal balance;

    @Column(name = "is_verified", nullable = false, columnDefinition = "boolean default false")
    private boolean isVerified = false;

    @Column(name = "id_card_number", unique = true)
    private String idCardNumber;

    @Column(name = "id_card_name")
    private String idCardName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'USER'")
    @Builder.Default
    private Role role = Role.USER;

    @Column(name = "is_phone_verified", nullable = false, columnDefinition = "boolean default false")
    private boolean isPhoneVerified = false;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Bid> bids;

    @JsonIgnore
    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL)
    private List<Auction> auctions;


    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL ,fetch = FetchType.EAGER)
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

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
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
    public boolean isAccountNonExpired() {return true;}

    @Override
    public boolean isAccountNonLocked() {return true;}

    @Override
    public boolean isCredentialsNonExpired() {return true;}

    @Override
    public boolean isEnabled() {return true;}
}