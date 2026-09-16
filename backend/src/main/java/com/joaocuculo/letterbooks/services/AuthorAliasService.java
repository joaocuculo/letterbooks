package com.joaocuculo.letterbooks.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.joaocuculo.letterbooks.entities.Author;
import com.joaocuculo.letterbooks.entities.AuthorAlias;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.repositories.AuthorAliasRepository;
import com.joaocuculo.letterbooks.repositories.AuthorRepository;
import com.joaocuculo.utils.NameNormalizer;

@Service 
public class AuthorAliasService {
    
    private final AuthorAliasRepository authorAliasRepository;
    private final AuthorRepository authorRepository;

    public AuthorAliasService(AuthorAliasRepository authorAliasRepository, AuthorRepository authorRepository) {
        this.authorAliasRepository = authorAliasRepository;
        this.authorRepository = authorRepository;
    }

    public List<AuthorAlias> findByAuthorId(Long authorId) {
        return authorAliasRepository.findByAuthorId(authorId);
    }

    public AuthorAlias create(String alias, Long authorId) {
        Author author = authorRepository.findById(authorId)
            .orElseThrow(() -> new ResourceNotFoundException("Autor não encontrado."));

        return authorAliasRepository.save(
            new AuthorAlias(
                alias,
                NameNormalizer.normalize(alias),
                author
            )
        );
    }

    public AuthorAlias createFromMerge(Author source, Author target) {
        return authorAliasRepository.save(
            new AuthorAlias(
                source.getName(),
                source.getNormalizedName(),
                target
            )
        );
    }
}
