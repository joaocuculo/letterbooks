package com.joaocuculo.letterbooks.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.joaocuculo.letterbooks.entities.Author;
import com.joaocuculo.letterbooks.entities.AuthorName;
import com.joaocuculo.letterbooks.repositories.AuthorNameRepository;
import com.joaocuculo.letterbooks.utils.NameNormalizer;

@Service 
public class AuthorNameService {
    
    private final AuthorNameRepository authorNameRepository;

    public AuthorNameService(AuthorNameRepository authorNameRepository) {
        this.authorNameRepository = authorNameRepository;
    }

    public List<AuthorName> findByAuthorId(Long authorId) {
        return authorNameRepository.findByAuthorId(authorId);
    }

    public AuthorName create(String name, String normalizedName, Author author) {
        return authorNameRepository.save(new AuthorName(
                name,
                NameNormalizer.normalize(normalizedName),
                author
        ));
    }

    public void transferAuthorNames(Author source, Author target) {
        authorNameRepository.transferAuthorNames(source.getId(), target.getId());
    }
}
