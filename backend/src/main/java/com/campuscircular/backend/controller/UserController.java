package com.campuscircular.backend.controller;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/users")
public class UserController {
    @GetMapping public Object list() { return java.util.List.of(); }
    @GetMapping("/{id}") public Object profile(@PathVariable Long id) { return null; }
    @PatchMapping("/me") public Object updateProfile() { return null; }
}
