package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.request.AuthorNameRequestDTO;
import com.joaocuculo.letterbooks.dto.response.AuthorNameResponseDTO;
import com.joaocuculo.letterbooks.entities.Author;
import com.joaocuculo.letterbooks.entities.AuthorName;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.repositories.AuthorNameRepository;
import com.joaocuculo.letterbooks.repositories.AuthorRepository;
import com.joaocuculo.letterbooks.utils.NameNormalizer;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthorNameService {

    private final AuthorRepository authorRepository;
    private final AuthorNameRepository authorNameRepository;

    public AuthorNameService(AuthorRepository authorRepository, AuthorNameRepository authorNameRepository) {
        this.authorRepository = authorRepository;
        this.authorNameRepository = authorNameRepository;
    }

    @Transactional
    public List<AuthorNameResponseDTO> findByAuthorId(Long authorId) {
        Author author = getAuthorById(authorId);
        return author.getAuthorNames().stream()
                .map(authorName -> new AuthorNameResponseDTO(
                        authorName.getId(),
                        authorName.getName(),
                        authorName.isPrimary()
                ))
                .toList();
    }

    @Transactional
    public AuthorNameResponseDTO addAlternativeName(Long authorId, AuthorNameRequestDTO request) {
        if (request == null || request.name() == null || request.name().isBlank()) {
            throw new BusinessException("Os dados do nome devem ser informados.");
        }

        Author author = getAuthorById(authorId);
        String name = request.name().trim();
        String normalizedName = NameNormalizer.normalize(name);

        ensureNameIsAvailable(normalizedName);

        AuthorName authorName = author.addAlternativeName(name, normalizedName);
        authorRepository.saveAndFlush(author);
        return new AuthorNameResponseDTO(
                authorName.getId(),
                authorName.getName(),
                authorName.isPrimary()
        );
    }

    @Transactional
    public AuthorNameResponseDTO changePrimaryName(Long authorId, Long authorNameId) {
        Author author = getAuthorById(authorId);
        AuthorName newPrimaryName = author.changePrimaryName(authorNameId);
        authorRepository.save(author);
        return new AuthorNameResponseDTO(
                newPrimaryName.getId(),
                newPrimaryName.getName(),
                newPrimaryName.isPrimary()
        );
    }

    @Transactional
    public void removeName(Long authorId, Long authorNameId) {
        Author author = getAuthorById(authorId);
        AuthorName removedName = author.removeName(authorNameId);
        authorNameRepository.delete(removedName);
    }

    private Author getAuthorById(Long authorId) {
        if (authorId == null) {
            throw new BusinessException("O autor deve ser informado.");
        }

        return authorRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Autor com id: " + authorId + " não encontrado."
                ));
    }

    private void ensureNameIsAvailable(String normalizedName) {
        authorNameRepository.findByNormalizedName(normalizedName)
                .ifPresent(existingName -> {
                    throw new BusinessException(
                            "O nome informado já corresponde ao autor " + existingName.getAuthor().getPrimaryName() + "."
                    );
                });
    }
}
