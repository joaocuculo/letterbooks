package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.entities.Category;
import com.joaocuculo.letterbooks.repositories.CategoryRepository;
import org.springframework.stereotype.Service;

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
                Category category = findOrCreateCategory(name);
                categories.add(category);
            }
        }

        return categories; // IMPLEMENTAR ATRIBUTO DE NOME DA CATEGORIA NORMALIZADO E OUTRAS QUESTOES E PONTOS DE MELHORIA
    }

    private Category findOrCreateCategory(String name) {
        return categoryRepository.findByName(name)
                .orElseGet(() -> categoryRepository.save(new Category(name)));
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
