package com.example.auction_backend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class VNPayConfig {
    @Value("${VNPAY_TMN_CODE}")
    public String tmnCode;

    @Value("${VNPAY_HASH_SECRET}")
    public String hashSecret;

    @Value("${VNPAY_URL}")
    public String vnpUrl;

    @Value("${VNPAY_RETURN_URL}")
    public String returnUrl;
}
