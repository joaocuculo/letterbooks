package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.request.AuthorRequestDTO;
import com.joaocuculo.letterbooks.dto.response.AuthorResponseDTO;
import com.joaocuculo.letterbooks.entities.Author;
import com.joaocuculo.letterbooks.entities.AuthorName;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.repositories.AuthorNameRepository;
import com.joaocuculo.letterbooks.repositories.AuthorRepository;
import com.joaocuculo.letterbooks.repositories.BookRepository;
import com.joaocuculo.letterbooks.utils.NameNormalizer;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final BookRepository bookRepository;
    private final AuthorNameRepository authorNameRepository;

    public AuthorService(AuthorRepository authorRepository, BookRepository bookRepository, AuthorNameRepository authorNameRepository) {
        this.authorRepository = authorRepository;
        this.bookRepository = bookRepository;
        this.authorNameRepository = authorNameRepository;
    }

    @Transactional
    public Page<AuthorResponseDTO> findAll(Pageable pageable) {
        Page<Author> authors = authorRepository.findAll(pageable);
        return authors.map(author -> new AuthorResponseDTO(
                    author.getId(),
                    author.getPrimaryName()
                )
        );
    }

    @Transactional
    public AuthorResponseDTO findById(Long id) {
        Author author = getById(id);
        return new AuthorResponseDTO(
            author.getId(),
            author.getPrimaryName()
        );
    }

    @Transactional
    public AuthorResponseDTO create(AuthorRequestDTO request) {
        if (request == null) {
            throw new BusinessException("Os dados do autor devem ser informados.");
        }

        String displayName = normalizeDisplayName(request.name());
        String normalizedName = NameNormalizer.normalize(displayName);

        authorNameRepository.findByNormalizedName(normalizedName)
                .ifPresent(existingName -> {
                    throw new BusinessException(
                            "O nome cadastrado corresponde a " + existingName.getName() + " no sistema."
                    );
                });

        Author newAuthor = createNewAuthor(displayName, normalizedName);
        return new AuthorResponseDTO(
                newAuthor.getId(),
                newAuthor.getPrimaryName()
        );
    }

    @Transactional
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
            String normalizedName = NameNormalizer.normalize(displayName);

            Author author = findOrCreateAuthor(normalizedName, displayName);

            authors.add(author);
        }

        return authors;
    }

    @Transactional
    public void mergeAuthors(Long targetAuthorId, Long sourceAuthorId) {
        if (targetAuthorId == null || sourceAuthorId == null) {
            throw new BusinessException("Os autores de origem e destino devem ser informados.");
        }

        if (Objects.equals(targetAuthorId, sourceAuthorId)) {
            throw new BusinessException("O autor de destino e origem devem ser diferentes.");
        }

        Author target = getById(targetAuthorId);
        Author source = getById(sourceAuthorId);

        target.absorbNamesFrom(source);
        authorRepository.save(target);

        bookRepository.removeAuthorRelationConflicts(target.getId(), source.getId());
        bookRepository.transferAuthorRelations(target.getId(), source.getId());

        authorRepository.delete(source);
    }

    private Author findOrCreateAuthor(String normalizedName, String name) {
        return authorNameRepository.findByNormalizedName(normalizedName)
                .map(AuthorName::getAuthor)
                .orElseGet(() -> createNewAuthor(name, normalizedName));
    }

    private Author createNewAuthor(String name, String normalizedName) {
        Author author = new Author();
        author.addPrimaryName(name, normalizedName);
        return authorRepository.save(author);
    }

    private String normalizeDisplayName(String rawDisplayName) {
        if (rawDisplayName == null || rawDisplayName.isBlank()) {
            throw new BusinessException("Nome do autor deve ser informado.");
        }

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

    private Author getById(Long id) {
        return authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Autor com id:" + id + " não encontrado."));
    }
}
