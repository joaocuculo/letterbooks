package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.request.CategoryNameRequestDTO;
import com.joaocuculo.letterbooks.dto.response.CategoryNameResponseDTO;
import com.joaocuculo.letterbooks.entities.Category;
import com.joaocuculo.letterbooks.entities.CategoryName;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.repositories.CategoryNameRepository;
import com.joaocuculo.letterbooks.repositories.CategoryRepository;
import com.joaocuculo.letterbooks.utils.NameNormalizer;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryNameService {

    private final CategoryRepository categoryRepository;
    private final CategoryNameRepository categoryNameRepository;

    public CategoryNameService(CategoryRepository categoryRepository, CategoryNameRepository categoryNameRepository) {
        this.categoryRepository = categoryRepository;
        this.categoryNameRepository = categoryNameRepository;
    }

    @Transactional
    public List<CategoryNameResponseDTO> findByCategoryId(Long categoryId) {
        Category category = getCategoryById(categoryId);
        return category.getCategoryNames().stream()
                .map(categoryName -> new CategoryNameResponseDTO(
                        categoryName.getId(),
                        categoryName.getName(),
                        categoryName.isPrimary()
                ))
                .toList();
    }

    @Transactional
    public CategoryNameResponseDTO addAlternativeName(Long categoryId, CategoryNameRequestDTO request) {
        if (request == null || request.name() == null || request.name().isBlank()) {
            throw new BusinessException("Os dados do nome devem ser informados.");
        }

        Category category = getCategoryById(categoryId);
        String name = request.name().trim();
        String normalizedName = NameNormalizer.normalize(name);

        ensureNameIsAvailable(normalizedName);

        CategoryName categoryName = category.addAlternativeName(name, normalizedName);
        categoryRepository.saveAndFlush(category);
        return new CategoryNameResponseDTO(
                categoryName.getId(),
                categoryName.getName(),
                categoryName.isPrimary()
        );
    }

    @Transactional
    public CategoryNameResponseDTO changePrimaryName(Long categoryId, Long categoryNameId) {
        Category category = getCategoryById(categoryId);
        CategoryName newPrimaryName = category.changePrimaryName(categoryNameId);
        categoryRepository.save(category);
        return new CategoryNameResponseDTO(
                newPrimaryName.getId(),
                newPrimaryName.getName(),
                newPrimaryName.isPrimary()
        );
    }

    @Transactional
    public void removeName(Long categoryId, Long categoryNameId) {
        Category category = getCategoryById(categoryId);
        CategoryName removedName = category.removeName(categoryNameId);
        categoryNameRepository.delete(removedName);
    }

    private Category getCategoryById(Long categoryId) {
        if (categoryId == null) {
            throw new BusinessException("A categoria deve ser informada.");
        }

        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Categoria com id: " + categoryId + " não encontrada."
                ));
    }

    private void ensureNameIsAvailable(String normalizedName) {
        categoryNameRepository.findByNormalizedName(normalizedName)
                .ifPresent(existingName -> {
                    throw new BusinessException(
                            "O nome informado já corresponde à categoria "
                                    + existingName.getCategory().getPrimaryName() + "."
                    );
                });
    }

}
