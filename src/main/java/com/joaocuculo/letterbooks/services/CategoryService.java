package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.entities.Category;
import com.joaocuculo.letterbooks.repositories.CategoryRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

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

        Set<Category> categories = new HashSet<>();
        for (String rawCategory : rawCategories) {
            if (rawCategory == null || rawCategory.isBlank()) {
                continue;
            }

            List<String> normalizedNames = normalizeDisplayName(rawCategory);
            for (String name : normalizedNames) {
                String normalizedName = normalizeKey(name);
                Category category = findOrCreateCategory(name, normalizedName);
                categories.add(category);
            }
        }

        return categories;
    }

    private Category findOrCreateCategory(String name, String normalizedName) {
        return categoryRepository.findByNormalizedName(normalizedName)
                .orElseGet(() -> categoryRepository.save(new Category(name, normalizedName)));
    }

    private String normalizeKey(String rawName) {
        return Normalizer.normalize(rawName, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "") // remove os acentos
                .replaceAll("[^a-zA-Z0-9\\s]", "") // remove os caracteres especiais
                .replaceAll("\\s+", " ")
                .trim()
                .toLowerCase();
    }

    private List<String> normalizeDisplayName(String rawDisplayName) {
        String normalizedDisplayName = rawDisplayName.trim();
        List<String> normalizedDisplayNames = new ArrayList<>();

        if (normalizedDisplayName.contains("/")) {
            Set<String> cleanDisplayNames = Arrays.stream(normalizedDisplayName.split("/"))
                    .map(String::trim)
                    .collect(Collectors.toSet()); // transformado em Set para evitar duplicatas

            normalizedDisplayNames.addAll(cleanDisplayNames);
        } else {
            normalizedDisplayNames.add(normalizedDisplayName);
        }

        return normalizedDisplayNames;
    }
}
