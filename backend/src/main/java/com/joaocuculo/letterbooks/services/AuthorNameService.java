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

    public AuthorName create(String name, String normalizedName, Author author) {
        return authorNameRepository.save(new AuthorName(
                name,
                normalizedName,
                author
        ));
    }

    public void createFromMerge(Author source, Author target) {
        authorNameRepository.transferAuthorNames(source.getId(), target.getId());
    }
}
