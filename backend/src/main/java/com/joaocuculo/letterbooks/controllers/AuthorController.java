package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.dto.request.AuthorMergeRequest;
import com.joaocuculo.letterbooks.dto.response.AuthorResponseDTO;
import com.joaocuculo.letterbooks.services.AuthorService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/authors")
public class AuthorController {

    private final AuthorService authorService;

    public AuthorController(AuthorService authorService) {
        this.authorService = authorService;
    }

    @GetMapping
    public ResponseEntity<Page<AuthorResponseDTO>> findAll(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<AuthorResponseDTO> page = authorService.findAll(pageable);
        return ResponseEntity.ok().body(page);
    }

    @PostMapping("/merge")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> merge(@Valid @RequestBody AuthorMergeRequest request) {
        authorService.mergeAuthors(request.targetAuthorId(), request.sourceAuthorId());
        return ResponseEntity.noContent().build();
    }
}
