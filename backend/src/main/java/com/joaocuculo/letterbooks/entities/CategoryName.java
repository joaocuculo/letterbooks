package com.joaocuculo.letterbooks.entities;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "category_name")
public class CategoryName {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String normalizedName;

    @Column(name = "is_primary", nullable = false)
    private boolean primary;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    protected CategoryName() {
    }

    CategoryName(String name, String normalizedName, boolean primary, Category category) {
        this.name = name;
        this.normalizedName = normalizedName;
        this.primary = primary;
        this.category = category;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getNormalizedName() {
        return normalizedName;
    }

    public boolean isPrimary() {
        return primary;
    }

    void markAsPrimary() {
        this.primary = true;
    }

    void markAsAlternative() {
        this.primary = false;
    }

    public Category getCategory() {
        return category;
    }

    void changeCategory(Category category) {
        this.category = category;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CategoryName that)) return false;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return CategoryName.class.hashCode();
    }
}
