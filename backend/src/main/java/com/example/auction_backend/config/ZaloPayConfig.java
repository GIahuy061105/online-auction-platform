package com.example.auction_backend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class ZaloPayConfig {
    @Value("${ZALOPAY_APP_ID}")
    private String appId;

    @Value("${ZALOPAY_KEY1}")
    private String key1;

    @Value("${ZALOPAY_KEY2}")
    private String key2;

    @Value("${ZALOPAY_ENDPOINT}")
    private String endpoint;
}