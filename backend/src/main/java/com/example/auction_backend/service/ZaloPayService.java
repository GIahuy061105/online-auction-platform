package com.example.auction_backend.service;

import com.example.auction_backend.config.ZaloPayConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ZaloPayService {

    private final ZaloPayConfig config;
    private final RestTemplate restTemplate = new RestTemplate();

    public String createOrder(String appUser, long amount, String txnRef) throws Exception {
        String appTime = String.valueOf(System.currentTimeMillis());
        String item = "[]";

        String embedData = "{\"redirecturl\": \"https://sdkauction.vercel.app/deposit\"}";

        String macData = config.getAppId() + "|" + txnRef + "|" + appUser + "|" + amount + "|"
                + appTime + "|" + embedData + "|" + item;

        String mac = hmacSHA256(config.getKey1(), macData);

        MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
        requestBody.add("app_id", config.getAppId());
        requestBody.add("app_trans_id", txnRef);
        requestBody.add("app_user", appUser);
        requestBody.add("app_time", appTime);
        requestBody.add("amount", String.valueOf(amount));
        requestBody.add("item", item);
        requestBody.add("embed_data", embedData);
        requestBody.add("bank_code", "");
        requestBody.add("description", "Nap tien SDKAuction - #" + txnRef);
        requestBody.add("mac", mac);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);

        Map<String, Object> response = restTemplate.postForObject(config.getEndpoint(), request, Map.class);

        if (response != null && response.containsKey("order_url")) {
            return (String) response.get("order_url");
        }

        throw new Exception("Lỗi từ ZaloPay: " + response);
    }

    private String hmacSHA256(String key, String data) throws Exception {
        Mac hmac256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmac256.init(secretKey);
        byte[] hash = hmac256.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    public String getCurrentTimeString(String format) {
        SimpleDateFormat sdf = new SimpleDateFormat(format);
        sdf.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        return sdf.format(new Date());
    }
}