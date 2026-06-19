package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.entities.Category;
import com.joaocuculo.letterbooks.repositories.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public Set<Category> resolveCategories(List<String> rawCategories) {
        if (rawCategories == null || rawCategories.isEmpty()) {
            return Set.of();
        }
        return Set.of(); // só para não gritar erro
    }

    private Category findOrCreateCategory(String name) {
        return categoryRepository.findByName(name)
                .orElseGet(() -> categoryRepository.save(new Category(name)));
    }

    private String normalizeDisplayName(String rawDisplayName) {
        String normalizedDisplayName = rawDisplayName.trim();
        if (normalizedDisplayName.contains("/")) {
            List<String> cleanDisplayName = Arrays.stream(normalizedDisplayName.split("/"))
                    .map(String::trim)
                    .toList();

            return "TEM A POSSIBILIDADE DE RETORNAR UMA LISTA DE STRING OU UMA LISTA DE STRING";
        }

        return normalizedDisplayName;
    }
}
