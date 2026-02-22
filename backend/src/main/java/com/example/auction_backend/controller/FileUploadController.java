package com.example.auction_backend.controller;

import com.example.auction_backend.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final CloudinaryService cloudinaryService;
    @PostMapping("/upload")
    public ResponseEntity<List<String>> uploadImages(@RequestParam("files") MultipartFile[] files) {
        List<String> imageUrls = new ArrayList<>();

        try {
            for (MultipartFile file : files) {
                String url = cloudinaryService.uploadFile(file);
                imageUrls.add(url);
            }
            return ResponseEntity.ok(imageUrls);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }
}