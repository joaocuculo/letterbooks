package com.joaocuculo.letterbooks.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.joaocuculo.letterbooks.entities.Author;
import com.joaocuculo.letterbooks.entities.AuthorName;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.repositories.AuthorNameRepository;
import com.joaocuculo.letterbooks.repositories.AuthorRepository;
import com.joaocuculo.letterbooks.utils.NameNormalizer;

@Service 
public class AuthorNameService {
    
    private final AuthorNameRepository authorNameRepository;
    private final AuthorRepository authorRepository;

    public AuthorNameService(AuthorNameRepository authorNameRepository, AuthorRepository authorRepository) {
        this.authorNameRepository = authorNameRepository;
        this.authorRepository = authorRepository;
    }

    public List<AuthorName> findByAuthorId(Long authorId) {
        return authorNameRepository.findByAuthorId(authorId);
    }

    public AuthorName create(String alias, Long authorId) {
        Author author = authorRepository.findById(authorId)
            .orElseThrow(() -> new ResourceNotFoundException("Autor não encontrado."));

        String normalizedAlias = NameNormalizer.normalize(alias);
        Optional<Author> authorOptional = authorRepository.findByNormalizedName(normalizedAlias);
        Optional<AuthorName> aliasOptional = authorNameRepository.findByNormalizedName(normalizedAlias);

        if (authorOptional.isPresent()) {
            Author authorExistent = authorOptional.get();
            if (authorExistent.getId().equals(authorId)) {
                return authorNameRepository.findByNormalizedNameAndAuthor(normalizedAlias, authorExistent);
            }
        }
        if (authorNameRepository.findByNormalizedName(normalizedAlias).isPresent()) {
            
        }

        return authorNameRepository.save(
            new AuthorName(
                alias,
                normalizedAlias,
                author
            )
        );
    }

    public AuthorName createFromMerge(Author source, Author target) {
        return authorNameRepository.save(
            new AuthorName(
                source.getName(),
                source.getNormalizedName(),
                target
            )
        );
    }
    
    public void transferAliases(Author source, Author target) {
        authorNameRepository.transferAliases(source.getId(), target.getId());
    }
}
