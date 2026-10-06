package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.dto.request.CategoryMergeRequestDTO;
import com.joaocuculo.letterbooks.dto.request.CategoryNameRequestDTO;
import com.joaocuculo.letterbooks.dto.request.CategoryRequestDTO;
import com.joaocuculo.letterbooks.dto.response.CategoryNameResponseDTO;
import com.joaocuculo.letterbooks.dto.response.CategoryResponseDTO;
import com.joaocuculo.letterbooks.services.CategoryNameService;
import com.joaocuculo.letterbooks.services.CategoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryNameService categoryNameService;

    public CategoryController(CategoryService categoryService, CategoryNameService categoryNameService) {
        this.categoryService = categoryService;
        this.categoryNameService = categoryNameService;
    }

    @GetMapping
    public ResponseEntity<Page<CategoryResponseDTO>> findAll(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<CategoryResponseDTO> page = categoryService.findAll(pageable);
        return ResponseEntity.ok().body(page);
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryResponseDTO> findById(@PathVariable Long categoryId) {
        CategoryResponseDTO category = categoryService.findById(categoryId);
        return ResponseEntity.ok().body(category);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CategoryResponseDTO>> create(
            @Valid @RequestBody CategoryRequestDTO request
    ) {
        List<CategoryResponseDTO> categories = categoryService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(categories);
    }

    @PostMapping("/merge")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> merge(@Valid @RequestBody CategoryMergeRequestDTO request) {
        categoryService.mergeCategories(request.targetCategoryId(), request.sourceCategoryId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{categoryId}/names")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CategoryNameResponseDTO>> findNames(@PathVariable Long categoryId) {
        return ResponseEntity.ok(categoryNameService.findByCategoryId(categoryId));
    }

    @PostMapping("/{categoryId}/names")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryNameResponseDTO> addAlternativeName(
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryNameRequestDTO request
    ) {
        CategoryNameResponseDTO categoryName = categoryNameService.addAlternativeName(categoryId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryName);
    }

    @PatchMapping("/{categoryId}/names/{categoryNameId}/primary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryNameResponseDTO> changePrimaryName(
            @PathVariable Long categoryId,
            @PathVariable Long categoryNameId
    ) {
        return ResponseEntity.ok(categoryNameService.changePrimaryName(categoryId, categoryNameId));
    }

    @DeleteMapping("/{categoryId}/names/{categoryNameId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeName(
            @PathVariable Long categoryId,
            @PathVariable Long categoryNameId
    ) {
        categoryNameService.removeName(categoryId, categoryNameId);
        return ResponseEntity.noContent().build();
    }
}
