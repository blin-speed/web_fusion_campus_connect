package com.campuscircular.backend.controller;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/disputes")
public class DisputeController {
    @GetMapping("/mine") public Object mine() { return java.util.List.of(); }
    @GetMapping("/{id}") public Object detail(@PathVariable Long id) { return null; }
    @PostMapping("/{id}/evidence") public Object evidence(@PathVariable Long id) { return null; }
}
