package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.response.CategoryResponseDTO;
import com.joaocuculo.letterbooks.entities.Category;
import com.joaocuculo.letterbooks.entities.CategoryName;
import com.joaocuculo.letterbooks.repositories.CategoryNameRepository;
import com.joaocuculo.letterbooks.repositories.CategoryRepository;
import com.joaocuculo.letterbooks.utils.NameNormalizer;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryNameRepository categoryNameRepository;

    public CategoryService(CategoryRepository categoryRepository, CategoryNameRepository categoryNameRepository) {
        this.categoryRepository = categoryRepository;
        this.categoryNameRepository = categoryNameRepository;
    }

    @Transactional
    public Page<CategoryResponseDTO> findAll(Pageable pageable) {
        Page<Category> categories = categoryRepository.findAll(pageable);
        return categories.map(
                category -> new CategoryResponseDTO(
                        category.getId(),
                        category.getPrimaryName()
                )
        );
    }

    @Transactional
    public Set<Category> resolveCategories(List<String> rawCategories) {
        if (rawCategories == null || rawCategories.isEmpty()) {
            return Set.of();
        }

        Set<Category> categories = new HashSet<>();
        for (String rawCategory : rawCategories) {
            if (rawCategory == null || rawCategory.isBlank()) {
                continue;
            }

            List<String> displayNames = normalizeDisplayName(rawCategory);
            for (String name : displayNames) {
                String normalizedName = NameNormalizer.normalize(name);
                Category category = findOrCreateCategory(name, normalizedName);
                categories.add(category);
            }
        }

        return categories;
    }

    private Category findOrCreateCategory(String name, String normalizedName) {
        return categoryNameRepository.findByNormalizedName(normalizedName)
                .map(CategoryName::getCategory)
                .orElseGet(() -> createNewCategory(name, normalizedName));
    }

    private Category createNewCategory(String name, String normalizedName) {
        Category category = new Category();
        category.addPrimaryName(name, normalizedName);
        return categoryRepository.save(category);
    }

    private List<String> normalizeDisplayName(String rawDisplayName) {
        String normalizedDisplayName = rawDisplayName.trim();
        List<String> normalizedDisplayNames = new ArrayList<>();

        if (normalizedDisplayName.contains("/")) {
            Set<String> cleanDisplayNames = Arrays.stream(normalizedDisplayName.split("/"))
                    .map(String::trim)
                    .filter(name -> !name.isBlank())
                    .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));

            normalizedDisplayNames.addAll(cleanDisplayNames);
        } else {
            normalizedDisplayNames.add(normalizedDisplayName);
        }

        return normalizedDisplayNames;
    }
}
