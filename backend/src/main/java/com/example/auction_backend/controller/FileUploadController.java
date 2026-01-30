package com.example.auction_backend.controller;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Collections;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {
    private static final String UPLOAD_DIR = "uploads";

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file ){
        try{
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if(!Files.exists(uploadPath)){
                Files.createDirectories(uploadPath);
            }
            // Taọ tên file độc nhất
            String filename = UUID.randomUUID().toString()+"_" + StringUtils.cleanPath(file.getOriginalFilename());
            // Lưu file vào thư mục
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream() , filePath , StandardCopyOption.REPLACE_EXISTING);
            // Trả về đường dẫn để Frontend xài
            String fileUrl = "http://localhost:8080/uploads/" + filename;
            return ResponseEntity.ok(Collections.singletonMap("url" , fileUrl));
        }catch (IOException e){
            return ResponseEntity.internalServerError().body("Upload thất bại: " + e.getMessage());
        }
    }
}
