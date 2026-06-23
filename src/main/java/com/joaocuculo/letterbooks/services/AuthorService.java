package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.response.AuthorResponseDTO;
import com.joaocuculo.letterbooks.entities.Author;
import com.joaocuculo.letterbooks.repositories.AuthorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;

    public AuthorService(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    public Page<AuthorResponseDTO> findAll(Pageable pageable) {
        Page<Author> authors = authorRepository.findAll(pageable);
        return authors.map(
                author -> new AuthorResponseDTO(
                        author.getId(),
                        author.getName(),
                        author.getNormalizedName()
                )
        );
    }

    public Set<Author> resolveAuthors(List<String> rawAuthors) {
        if (rawAuthors == null || rawAuthors.isEmpty()) {
            return Set.of();
        }

        Set<Author> authors = new HashSet<>();
        for (String rawAuthor : rawAuthors) {
            if (rawAuthor == null || rawAuthor.isBlank()) {
                continue;
            }

            String displayName = normalizeDisplayName(rawAuthor);
            String normalizedName = normalizeKey(displayName);

            Author author = findOrCreateAuthor(normalizedName, displayName);

            authors.add(author);
        }

        return authors;
    }

    private Author findOrCreateAuthor(String normalizedName, String name) {
        return authorRepository.findByNormalizedName(normalizedName)
                .orElseGet(() -> authorRepository.save(new Author(name, normalizedName)));
    }

    private String normalizeKey(String rawName) {
        return Normalizer.normalize(rawName, Normalizer.Form.NFD) // separa os acentos das letras
                .replaceAll("\\p{M}", "") // remove os acentos
                .replaceAll("[^a-zA-Z0-9\\s]", "") // remove os caracteres especiais
                .replaceAll("\\s+", " ")
                .trim()
                .toLowerCase();
    }

    private String normalizeDisplayName(String rawDisplayName) {
        String normalizedDisplayName = rawDisplayName.trim();
        if (normalizedDisplayName.contains(",")) {
            List<String> cleanDisplayName = Arrays.stream(normalizedDisplayName.split(","))
                    .map(String::trim)
                    .toList();

            List<String> reversedDisplayName = new ArrayList<>(cleanDisplayName);
            Collections.reverse(reversedDisplayName);

            return String.join(" ", reversedDisplayName);
        }
        return normalizedDisplayName;
    }
}
