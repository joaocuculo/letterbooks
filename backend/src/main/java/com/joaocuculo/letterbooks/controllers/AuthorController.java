package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.dto.request.AuthorMergeRequestDTO;
import com.joaocuculo.letterbooks.dto.request.AuthorNameRequestDTO;
import com.joaocuculo.letterbooks.dto.request.AuthorRequestDTO;
import com.joaocuculo.letterbooks.dto.response.AuthorNameResponseDTO;
import com.joaocuculo.letterbooks.dto.response.AuthorResponseDTO;
import com.joaocuculo.letterbooks.services.AuthorNameService;
import com.joaocuculo.letterbooks.services.AuthorService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/authors")
public class AuthorController {

    private final AuthorService authorService;
    private final AuthorNameService authorNameService;

    public AuthorController(AuthorService authorService, AuthorNameService authorNameService) {
        this.authorService = authorService;
        this.authorNameService = authorNameService;
    }

    @GetMapping
    public ResponseEntity<Page<AuthorResponseDTO>> findAll(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<AuthorResponseDTO> page = authorService.findAll(pageable);
        return ResponseEntity.ok().body(page);
    }

    @GetMapping("/{authorId}")
    public ResponseEntity<AuthorResponseDTO> findById(@PathVariable Long authorId) {
        AuthorResponseDTO author = authorService.findById(authorId);
        return ResponseEntity.ok().body(author);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthorResponseDTO> create(@Valid @RequestBody AuthorRequestDTO request) {
        AuthorResponseDTO author = authorService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(author);
    }

    @PostMapping("/merge")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> merge(@Valid @RequestBody AuthorMergeRequestDTO request) {
        authorService.mergeAuthors(request.targetAuthorId(), request.sourceAuthorId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{authorId}/names")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuthorNameResponseDTO>> findNames(@PathVariable Long authorId) {
        return ResponseEntity.ok(authorNameService.findByAuthorId(authorId));
    }

    @PostMapping("/{authorId}/names")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthorNameResponseDTO> addAlternativeName(
            @PathVariable Long authorId,
            @Valid @RequestBody AuthorNameRequestDTO request
    ) {
        AuthorNameResponseDTO authorName = authorNameService.addAlternativeName(authorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(authorName);
    }

    @PatchMapping("/{authorId}/names/{authorNameId}/primary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthorNameResponseDTO> changePrimaryName(
            @PathVariable Long authorId,
            @PathVariable Long authorNameId
    ) {
        return ResponseEntity.ok(authorNameService.changePrimaryName(authorId, authorNameId));
    }

    @DeleteMapping("/{authorId}/names/{authorNameId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeName(
            @PathVariable Long authorId,
            @PathVariable Long authorNameId
    ) {
        authorNameService.removeName(authorId, authorNameId);
        return ResponseEntity.noContent().build();
    }
}
