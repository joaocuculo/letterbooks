package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.entities.Author;
import com.joaocuculo.letterbooks.repositories.AuthorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;

    public AuthorService(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    public Set<Author> resolveAuthors(List<String> authors) {

    }

    private String normalizeAuthors(String rawAuthor) {

    }
    // vou receber uma lista de string com um ou mais autores
    // tenho que normalizar o que chegar
    // buscar ou criar a partir do autor normalizado
    // retornar um set de authors vindos do banco para trazer o nome e o id (um set de repository.save(authors))
}
