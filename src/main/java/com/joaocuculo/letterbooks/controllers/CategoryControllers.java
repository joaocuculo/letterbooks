package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.dto.response.CategoryResponseDTO;
import com.joaocuculo.letterbooks.services.CategoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/categories")
public class CategoryControllers {

    private final CategoryService categoryService;

    public CategoryControllers(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<Page<CategoryResponseDTO>> findAll(Pageable pageable) {
        Page<CategoryResponseDTO> page = categoryService.findAll(pageable);
        return ResponseEntity.ok().body(page);
    }
}
