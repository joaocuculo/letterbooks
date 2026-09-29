package com.joaocuculo.letterbooks.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;

import jakarta.persistence.*;

import java.io.Serializable;
import java.util.*;

@Entity
@Table(name = "authors")
public class Author implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToMany(mappedBy = "authors")
    private Set<Book> books = new HashSet<>();

    @JsonIgnore
    @OneToMany(
        mappedBy = "author",
        cascade = CascadeType.ALL
    )
    private List<AuthorName> authorNames = new ArrayList<>();

    public Author() {
    }

    public void addPrimaryName(String name, String normalizedName) {
        validateName(name, normalizedName);

        boolean hasPrimary = authorNames.stream()
                .anyMatch(AuthorName::isPrimary);

        if (hasPrimary) {
            throw new BusinessException("Autor já possui um nome principal.");
        }

        ensureNameDoesNotExist(normalizedName);
        authorNames.add(new AuthorName(name, normalizedName, true, this));
    }

    public void addAlternativeName(String name, String normalizedName) {
        validateName(name, normalizedName);
        getPrimaryAuthorName();
        ensureNameDoesNotExist(normalizedName);

        authorNames.add(new AuthorName(name, normalizedName, false, this));
    }

    public String getPrimaryName() {
        return getPrimaryAuthorName().getName();
    }

    public void changePrimaryName(Long authorNameId) {
        AuthorName newPrimaryName = findNameById(authorNameId);
        AuthorName currentPrimaryName = getPrimaryAuthorName();

        if (newPrimaryName == currentPrimaryName) {
            return;
        }

        currentPrimaryName.setPrimary(false);
        newPrimaryName.setPrimary(true);
    }

    public AuthorName removeName(Long authorNameId) {
        AuthorName authorName = findNameById(authorNameId);

        if (authorName.isPrimary()) {
            throw new BusinessException("Não é possível remover um nome marcado como principal.");
        }

        if (authorNames.size() == 1) {
            throw new BusinessException("O autor deve possuir pelo menos um nome.");
        }

        authorNames.remove(authorName);
        return authorName;
    }

    public void absorbNamesFrom(Author source) {
        if (source == null) {
            throw new BusinessException("O autor de origem deve ser informado.");
        }

        if (source == this || (id != null && Objects.equals(id, source.id))) {
            throw new BusinessException("O autor de origem e destino devem ser diferentes.");
        }

        getPrimaryAuthorName();
        source.getPrimaryAuthorName();

        List<AuthorName> namesToTransfer = new ArrayList<>(source.authorNames);

        for (AuthorName sourceName : namesToTransfer) {
            ensureNameDoesNotExist(sourceName.getNormalizedName());
        }

        for (AuthorName sourceName : namesToTransfer) {
            sourceName.setPrimary(false);
            sourceName.setAuthor(this);
            authorNames.add(sourceName);
        }

        source.authorNames.clear();
    }

    private AuthorName getPrimaryAuthorName() {
        List<AuthorName> primaryNames = authorNames.stream()
                .filter(AuthorName::isPrimary)
                .toList();

        if (primaryNames.isEmpty()) {
            throw new BusinessException("Autor não possui nome principal definido.");
        }

        if (primaryNames.size() > 1) {
            throw new BusinessException("Autor possui mais de um nome principal definido.");
        }

        return primaryNames.getFirst();
    }

    private AuthorName findNameById(Long authorNameId) {
        return authorNames.stream()
                .filter(authorName -> Objects.equals(authorName.getId(), authorNameId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nome do autor não encontrado."
                ));
    }

    private void ensureNameDoesNotExist(String normalizedName) {
        boolean alreadyExists = authorNames.stream()
                .anyMatch(authorName -> Objects.equals(
                        authorName.getNormalizedName(),
                        normalizedName
                ));

        if (alreadyExists) {
            throw new BusinessException("Autor já possui esse nome cadastrado.");
        }
    }

    private void validateName(String name, String normalizedName) {
        if (name == null || name.isBlank()) {
            throw new BusinessException("Nome do autor deve ser informado.");
        }

        if (normalizedName == null || normalizedName.isBlank()) {
            throw new BusinessException("Nome normalizado do autor deve ser informado.");
        }
    }

    public Long getId() {
        return id;
    }

    public Set<Book> getBooks() {
        return books;
    }

    public List<AuthorName> getAuthorNames() {
        return Collections.unmodifiableList(authorNames);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Author author)) return false;

        return id != null && Objects.equals(id, author.getId());
    }

    @Override
    public int hashCode() {
        return Author.class.hashCode();
    }
}
