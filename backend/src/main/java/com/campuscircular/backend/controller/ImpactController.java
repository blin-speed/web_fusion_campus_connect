package com.campuscircular.backend.controller;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/impact")
public class ImpactController {
    @GetMapping public Object stats() { return null; }
}
