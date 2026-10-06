package com.campuscircular.backend.controller;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/demand-requests")
public class DemandRequestController {
    @GetMapping public Object list() { return java.util.List.of(); }
    @PostMapping public Object create() { return null; }
    @PostMapping("/{id}/fulfill") public Object fulfill(@PathVariable Long id) { return null; }
}
