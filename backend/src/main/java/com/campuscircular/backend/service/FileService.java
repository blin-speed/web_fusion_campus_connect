package com.campuscircular.backend.service;
import org.springframework.stereotype.Service;
@Service
public class FileService {
    public String storeFile(byte[] data, String originalName) {
        return "fake-file-id";
    }
}
