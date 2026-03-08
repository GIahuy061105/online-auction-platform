package com.example.auction_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PingController {

    @RequestMapping(value = "/api/ping", method = {RequestMethod.GET, RequestMethod.HEAD})
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}