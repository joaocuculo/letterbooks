package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.entities.Category;
import com.joaocuculo.letterbooks.entities.CategoryName;
import com.joaocuculo.letterbooks.repositories.CategoryNameRepository;
import com.joaocuculo.letterbooks.repositories.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CategoryServiceTest {

    private CategoryRepository categoryRepository;
    private CategoryNameRepository categoryNameRepository;
    private CategoryService categoryService;

    @BeforeEach
    void setUp() {
        categoryRepository = mock(CategoryRepository.class);
        categoryNameRepository = mock(CategoryNameRepository.class);
        categoryService = new CategoryService(categoryRepository, categoryNameRepository);
    }

    @Test
    void shouldReuseCategoryFoundByAlias() {
        Category existingCategory = new Category();
        existingCategory.addPrimaryName("Ficção científica", "ficcao cientifica");
        CategoryName alias = existingCategory.addAlternativeName("Science Fiction", "science fiction");
        when(categoryNameRepository.findByNormalizedName("science fiction"))
                .thenReturn(Optional.of(alias));

        Set<Category> categories = categoryService.resolveCategories(List.of("Science Fiction"));

        assertEquals(1, categories.size());
        assertSame(existingCategory, categories.iterator().next());
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void shouldCreateCategoriesSplittingSlashSeparatedValue() {
        when(categoryNameRepository.findByNormalizedName(any(String.class)))
                .thenReturn(Optional.empty());
        when(categoryRepository.save(any(Category.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Set<Category> categories = categoryService.resolveCategories(List.of("Fantasy / Adventure"));

        assertEquals(2, categories.size());
        verify(categoryNameRepository).findByNormalizedName("fantasy");
        verify(categoryNameRepository).findByNormalizedName("adventure");
        verify(categoryRepository, org.mockito.Mockito.times(2)).save(any(Category.class));
    }
}
