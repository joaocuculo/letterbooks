package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.entities.Author;
import com.joaocuculo.letterbooks.repositories.AuthorRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;

    public AuthorService(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    public Set<Author> resolveAuthors(List<String> authors) {

    }

    private String normalizeAuthor(String rawAuthor) {
        String normalizedAuthor = rawAuthor.trim();
        if (normalizedAuthor.contains(",")) {
            List<String> cleanName = Arrays.stream(rawAuthor.split(",")).map(String::trim).toList();

            List<String> reversedName = new ArrayList<>(cleanName);
            Collections.reverse(reversedName);

            return String.join("", reversedName);
        }
        return normalizedAuthor;
    }
    // vou receber uma lista de string com um ou mais autores
    // tenho que normalizar o que chegar
    // buscar ou criar a partir do autor normalizado
    // retornar um set de authors vindos do banco para trazer o nome e o id (um set de repository.save(authors))
}
