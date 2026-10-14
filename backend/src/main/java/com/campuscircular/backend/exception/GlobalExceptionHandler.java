package com.campuscircular.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleValidation(IllegalArgumentException e) {
        return buildError("VALIDATION", e.getMessage(), HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<?> handleApi(ApiException e) {
        return buildError(e.getCode(), e.getMessage(), e.getStatus());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> handleState(IllegalStateException e) {
        return buildError("INVALID_STATE", e.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<?> handleResponseStatus(org.springframework.web.server.ResponseStatusException e) {
        HttpStatus status = HttpStatus.resolve(e.getStatusCode().value());
        return buildError(status != null ? status.name() : "ERROR", e.getReason() != null ? e.getReason() : e.getMessage(), status != null ? status : HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception e) {
        return buildError("INTERNAL_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public static ResponseEntity<Map<String, Object>> buildError(String code, String message, HttpStatus status) {
        return ResponseEntity.status(status).body(Map.of("error", Map.of("code", code, "message", message != null ? message : "Error")));
    }
}
