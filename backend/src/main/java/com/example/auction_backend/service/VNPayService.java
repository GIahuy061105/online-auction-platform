// service/VNPayService.java
package com.example.auction_backend.service;

import com.example.auction_backend.config.VNPayConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VNPayService {

    private final VNPayConfig config;

    public String createPaymentUrl(long amount, String txnRef, String ipAddr) throws Exception {
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode",  config.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Nap tien SDKAuction " + txnRef);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", config.getReturnUrl());
        params.put("vnp_IpAddr", ipAddr);
        params.put("vnp_CreateDate",
                new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        StringBuilder hashData = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            hashData.append(entry.getKey()).append('=')
                    .append(entry.getValue()).append('&');
        }
        String hashStr = hashData.substring(0, hashData.length() - 1);

        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                    .append('=')
                    .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                    .append('&');
        }
        String queryStr = query.substring(0, query.length() - 1);

        String secureHash = hmacSHA512(config.getHashSecret(), hashStr);
        System.out.println("HashStr: " + hashStr);
        System.out.println("SecureHash: " + secureHash);
        return config.getVnpUrl() + "?" + queryStr + "&vnp_SecureHash=" + secureHash;
    }

    public boolean verifyReturn(Map<String, String> params) throws Exception {
        String receivedHash = params.get("vnp_SecureHash");
        Map<String, String> filtered = new TreeMap<>(params);
        filtered.remove("vnp_SecureHash");
        filtered.remove("vnp_SecureHashType");

        StringBuilder data = new StringBuilder();
        for (Map.Entry<String, String> e : filtered.entrySet()) {
            data.append(e.getKey()).append('=')
                    .append(URLEncoder.encode(e.getValue(), StandardCharsets.US_ASCII))
                    .append('&');
        }
        String dataStr = data.substring(0, data.length() - 1);
        return hmacSHA512(config.getHashSecret(), dataStr).equalsIgnoreCase(receivedHash);
    }

    private String hmacSHA512(String key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA512");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}