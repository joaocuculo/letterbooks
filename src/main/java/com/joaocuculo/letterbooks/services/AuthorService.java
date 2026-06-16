package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.entities.Author;
import com.joaocuculo.letterbooks.repositories.AuthorRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;

    public AuthorService(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    public Set<Author> resolveAuthors(List<String> rawAuthors) {
        if (rawAuthors == null || rawAuthors.isEmpty()) {
            return Set.of();
        }
        List<String> authorNames = rawAuthors.stream()
                .map(this::normalizeDisplayName)
                .toList();

        List<String> normalizedNames = authorNames.stream()
                .map(this::normalizeKey)
                .toList();

        Set<Author> authors = new HashSet<>();
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
    // (X) vou receber uma lista de string com um ou mais autores
    // (X) tenho que normalizar o que chegar
    // ( ) buscar ou criar a partir do autor normalizado
    // ( ) retornar um set de authors vindos do banco para trazer o nome e o id (um set de repository.save(authors))
    // (X) caso a lista de autores venha null ou vazia, devemos retornar um Set vazio
}
