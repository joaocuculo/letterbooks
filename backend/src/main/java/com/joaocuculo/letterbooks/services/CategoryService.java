package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.request.CategoryRequestDTO;
import com.joaocuculo.letterbooks.dto.response.CategoryResponseDTO;
import com.joaocuculo.letterbooks.entities.Category;
import com.joaocuculo.letterbooks.entities.CategoryName;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.repositories.BookRepository;
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
    private final BookRepository bookRepository;
    private final CategoryNameRepository categoryNameRepository;

    public CategoryService(CategoryRepository categoryRepository, BookRepository bookRepository, CategoryNameRepository categoryNameRepository) {
        this.categoryRepository = categoryRepository;
        this.bookRepository = bookRepository;
        this.categoryNameRepository = categoryNameRepository;
    }

    @Transactional
    public Page<CategoryResponseDTO> findAll(Pageable pageable) {
        Page<Category> categories = categoryRepository.findAll(pageable);
        return categories.map(category -> new CategoryResponseDTO(
                category.getId(),
                category.getPrimaryName()
        ));
    }

    @Transactional
    public CategoryResponseDTO findById(Long id) {
        Category category = getById(id);
        return new CategoryResponseDTO(
                category.getId(),
                category.getPrimaryName()
        );
    }

    @Transactional
    public List<CategoryResponseDTO> create(CategoryRequestDTO request) {
        if (request == null) {
            throw new BusinessException("Os dados da categoria devem ser informados.");
        }

        Map<String, String> categoryNames = normalizeDisplayNames(request.name());

        categoryNames.forEach((normalizedName, displayName) ->
                categoryNameRepository.findByNormalizedName(normalizedName)
                        .ifPresent(existingName -> {
                            throw new BusinessException(
                                    "O nome cadastrado corresponde a " + existingName.getName() + " no sistema."
                            );
                        })
        );

        return categoryNames.entrySet().stream()
                .map(entry -> createNewCategory(entry.getValue(), entry.getKey()))
                .map(category -> new CategoryResponseDTO(
                        category.getId(),
                        category.getPrimaryName()
                ))
                .toList();
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

            Map<String, String> categoryNames = normalizeDisplayNames(rawCategory);
            for (Map.Entry<String, String> entry : categoryNames.entrySet()) {
                Category category = findOrCreateCategory(entry.getValue(), entry.getKey());
                categories.add(category);
            }
        }

        return categories;
    }

    @Transactional
    public void mergeCategories(Long targetCategoryId, Long sourceCategoryId) {
        if (targetCategoryId == null || sourceCategoryId == null) {
            throw new BusinessException("As categorias de origem e destino devem ser informadas.");
        }

        if (Objects.equals(targetCategoryId, sourceCategoryId)) {
            throw new BusinessException("A categoria de destino e origem devem ser diferentes.");
        }

        Category target = getById(targetCategoryId);
        Category source = getById(sourceCategoryId);

        target.absorbNamesFrom(source);
        categoryRepository.save(target);

        bookRepository.removeCategoryRelationConflicts(target.getId(), source.getId());
        bookRepository.transferCategoryRelations(target.getId(), source.getId());

        categoryRepository.delete(source);
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

    private Map<String, String> normalizeDisplayNames(String rawDisplayName) {
        if (rawDisplayName == null || rawDisplayName.isBlank()) {
            throw new BusinessException("Nome da categoria deve ser informado.");
        }

        Map<String, String> categoryNames = new LinkedHashMap<>();
        Arrays.stream(rawDisplayName.split("/"))
                .map(String::trim)
                .filter(name -> !name.isBlank())
                .forEach(name -> categoryNames.putIfAbsent(NameNormalizer.normalize(name), name));

        if (categoryNames.isEmpty()) {
            throw new BusinessException("Nome da categoria deve ser informado.");
        }

        return categoryNames;
    }

    private Category getById(Long id) {
        if (id == null) {
            throw new BusinessException("A categoria deve ser informada.");
        }

        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Categoria com id: " + id + " não encontrada."
                ));
    }

}
