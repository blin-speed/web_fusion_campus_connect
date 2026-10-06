package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Photo;
import com.campuscircular.backend.entity.User;
import com.campuscircular.backend.repository.PhotoRepository;
import com.campuscircular.backend.security.AuthContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/photos")
public class PhotoController {

    private final PhotoRepository photoRepository;

    @Value("${app.upload.dir:./data/uploads}")
    private String uploadDir;

    public PhotoController(PhotoRepository photoRepository) {
        this.photoRepository = photoRepository;
    }

    @PostMapping
    public Photo upload(@RequestParam("file") MultipartFile file, @RequestParam("purpose") String purpose) {
        if (file.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Empty file");

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            Photo photo = new Photo();
            User u = new User(); u.setId(AuthContext.getUserId()); photo.setUploader(u);
            photo.setPurpose(purpose);
            photo.setStoredName(filename);
            photo.setMime(file.getContentType());
            photo.setSizeBytes((int) file.getSize());
            photo.setCreatedAt(Instant.now());

            return photoRepository.save(photo);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file", e);
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        Photo photo = photoRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!photo.getUploader().getId().equals(AuthContext.getUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        
        try {
            Files.deleteIfExists(Paths.get(uploadDir).resolve(photo.getStoredName()));
            photoRepository.delete(photo);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete file", e);
        }
    }
}


