package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Category;
import com.campuscircular.backend.repository.CategoryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<Category> getCategories() {
        List<Category> all = categoryRepository.findAll();
        if (all.isEmpty()) {
            List<String> defaultNames = List.of(
                "Filming Equipment",
                "Electronics",
                "Study Materials",
                "Sports",
                "Tools"
            );
            for (String name : defaultNames) {
                Category c = new Category();
                c.setName(name);
                categoryRepository.save(c);
            }
            all = categoryRepository.findAll();
        }
        return all;
    }

    @PostMapping
    public Category createCategory(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }
        Category cat = new Category();
        cat.setName(name.trim());
        return categoryRepository.save(cat);
    }
}

