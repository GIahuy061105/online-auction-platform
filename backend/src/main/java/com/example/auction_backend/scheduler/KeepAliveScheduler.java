package com.example.auction_backend.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class KeepAliveScheduler {

    @Scheduled(fixedDelay = 100000) // 10 phút
    public void keepAlive() {
        try {
            new RestTemplate().getForObject(
                    "https://sdkauction.up.railway.app/api/auctions",
                    String.class
            );
        } catch (Exception e) {
            System.out.println("Keep-alive ping failed: " + e.getMessage());
        }
    }
}