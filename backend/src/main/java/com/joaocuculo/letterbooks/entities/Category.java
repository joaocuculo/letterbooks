package com.joaocuculo.letterbooks.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import jakarta.persistence.*;

import java.io.Serializable;
import java.util.*;

@Entity
@Table(name = "categories")
public class Category implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToMany(mappedBy = "categories")
    private Set<Book> books = new HashSet<>();

    @JsonIgnore
    @OneToMany(
            mappedBy = "category",
            cascade = CascadeType.ALL
    )
    private List<CategoryName> categoryNames = new ArrayList<>();

    public Category() {
    }

    public CategoryName addPrimaryName(String name, String normalizedName) {
        validateName(name, normalizedName);

        boolean hasPrimary = categoryNames.stream()
                .anyMatch(CategoryName::isPrimary);

        if (hasPrimary) {
            throw new BusinessException("Categoria já possui um nome principal.");
        }

        ensureNameDoesNotExist(normalizedName);
        CategoryName categoryName = new CategoryName(name, normalizedName, true, this);
        categoryNames.add(categoryName);
        return categoryName;
    }

    public CategoryName addAlternativeName(String name, String normalizedName) {
        validateName(name, normalizedName);
        getPrimaryCategoryName();
        ensureNameDoesNotExist(normalizedName);

        CategoryName categoryName = new CategoryName(name, normalizedName, false, this);
        categoryNames.add(categoryName);
        return categoryName;
    }

    public String getPrimaryName() {
        return getPrimaryCategoryName().getName();
    }

    public CategoryName changePrimaryName(Long categoryNameId) {
        CategoryName newPrimaryName = findNameById(categoryNameId);
        CategoryName currentPrimaryName = getPrimaryCategoryName();

        if (newPrimaryName == currentPrimaryName) {
            return newPrimaryName;
        }

        currentPrimaryName.markAsAlternative();
        newPrimaryName.markAsPrimary();
        return newPrimaryName;
    }

    public CategoryName removeName(Long categoryNameId) {
        CategoryName categoryName = findNameById(categoryNameId);

        if (categoryName.isPrimary()) {
            throw new BusinessException("Não é possível remover um nome marcado como principal.");
        }

        if (categoryNames.size() == 1) {
            throw new BusinessException("A categoria deve possuir pelo menos um nome.");
        }

        categoryNames.remove(categoryName);
        return categoryName;
    }

    public void absorbNamesFrom(Category source) {
        if (source == null) {
            throw new BusinessException("A categoria de origem deve ser informada.");
        }

        if (source == this || (id != null && Objects.equals(id, source.id))) {
            throw new BusinessException("As categorias de origem e destino devem ser diferentes.");
        }

        getPrimaryCategoryName();
        source.getPrimaryCategoryName();

        List<CategoryName> namesToTransfer = new ArrayList<>(source.categoryNames);

        for (CategoryName sourceName : namesToTransfer) {
            ensureNameDoesNotExist(sourceName.getNormalizedName());
        }

        for (CategoryName sourceName : namesToTransfer) {
            sourceName.markAsAlternative();
            sourceName.changeCategory(this);
            categoryNames.add(sourceName);
        }

        source.categoryNames.clear();
    }

    private CategoryName getPrimaryCategoryName() {
        List<CategoryName> primaryNames = categoryNames.stream()
                .filter(CategoryName::isPrimary)
                .toList();

        if (primaryNames.isEmpty()) {
            throw new BusinessException("Categoria não possui nome principal definido.");
        }

        if (primaryNames.size() > 1) {
            throw new BusinessException("Categoria possui mais de um nome principal definido.");
        }

        return primaryNames.getFirst();
    }

    private CategoryName findNameById(Long categoryNameId) {
        if (categoryNameId == null) {
            throw new BusinessException("O nome da categoria deve ser informado.");
        }

        return categoryNames.stream()
                .filter(categoryName -> Objects.equals(categoryName.getId(), categoryNameId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nome da categoria não encontrado."
                ));
    }

    private void ensureNameDoesNotExist(String normalizedName) {
        boolean alreadyExists = categoryNames.stream()
                .anyMatch(categoryName -> Objects.equals(
                        categoryName.getNormalizedName(),
                        normalizedName
                ));

        if (alreadyExists) {
            throw new BusinessException("Categoria já possui esse nome cadastrado.");
        }
    }

    private void validateName(String name, String normalizedName) {
        if (name == null || name.isBlank()) {
            throw new BusinessException("Nome da categoria deve ser informado.");
        }

        if (normalizedName == null || normalizedName.isBlank()) {
            throw new BusinessException("Nome normalizado da categoria deve ser informado.");
        }
    }

    public Long getId() {
        return id;
    }

    public Set<Book> getBooks() {
        return books;
    }

    public List<CategoryName> getCategoryNames() {
        return Collections.unmodifiableList(categoryNames);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Category category)) return false;

        return id != null && Objects.equals(id, category.getId());
    }

    @Override
    public int hashCode() {
        return Category.class.hashCode();
    }
}
