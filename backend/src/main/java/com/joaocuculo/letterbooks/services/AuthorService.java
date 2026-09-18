package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.response.AuthorResponseDTO;
import com.joaocuculo.letterbooks.entities.Author;
import com.joaocuculo.letterbooks.entities.AuthorAlias;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.repositories.AuthorAliasRepository;
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
    private final AuthorAliasRepository authorAliasRepository;
    private final AuthorAliasService authorAliasService;

    public AuthorService(AuthorRepository authorRepository, BookRepository bookRepository, AuthorAliasRepository authorAliasRepository, AuthorAliasService authorAliasService) {
        this.authorRepository = authorRepository;
        this.bookRepository = bookRepository;
        this.authorAliasRepository = authorAliasRepository;
        this.authorAliasService = authorAliasService;
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
            String normalizedName = NameNormalizer.normalize(displayName);

            Author author = findOrCreateAuthor(normalizedName, displayName);

            authors.add(author);
        }

        return authors;
    }

    @Transactional
    public void mergeAuthors(Long targetAuthorId, Long sourceAuthorId) {
        
        if (targetAuthorId.equals(sourceAuthorId)) {
            throw new BusinessException("O autor de destino e origem devem ser diferentes.");
        }
        
        Author target = authorRepository.findById(targetAuthorId)
                .orElseThrow(() -> new ResourceNotFoundException("Autor com id:" + targetAuthorId + " não encontrado."));
        Author source = authorRepository.findById(sourceAuthorId)
                .orElseThrow(() -> new ResourceNotFoundException("Autor com id:" + sourceAuthorId + " não encontrado."));

        authorAliasService.createFromMerge(source, target); // cria alias
        authorAliasService.transferAliases(source, target); // transfere alias para author
        bookRepository.removeAuthorRelationConflicts(target.getId(), source.getId()); // remove possiveis livros que possam possuir o author que será o novo dono
        bookRepository.transferAuthorRelations(target.getId(), source.getId()); // transfere livros para author

        authorRepository.delete(source);
    }

    private Author findOrCreateAuthor(String normalizedName, String name) {
        return authorRepository.findByNormalizedName(normalizedName)
                .or(() -> authorAliasRepository.findByNormalizedName(normalizedName)
                        .map(AuthorAlias::getAuthor))
                .orElseGet(() -> authorRepository.save(new Author(name, normalizedName)));
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
