package com.joaocuculo.letterbooks.entities;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "author_name")
public class AuthorName {

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
    @JoinColumn(name = "author_id", nullable = false)
    private Author author;

    protected AuthorName() {
    }

    AuthorName(String name, String normalizedName, boolean primary, Author author) {
        this.name = name;
        this.normalizedName = normalizedName;
        this.primary = primary;
        this.author = author;
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

    public Author getAuthor() {
        return author;
    }

    void changeAuthor(Author author) {
        this.author = author;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AuthorName that)) return false;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return AuthorName.class.hashCode();
    }
}
