package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.dto.request.BookshelfRequestDTO;
import com.joaocuculo.letterbooks.dto.request.BookshelfUpdateDTO;
import com.joaocuculo.letterbooks.dto.response.BookshelfResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookshelfSummaryDTO;
import com.joaocuculo.letterbooks.services.BookshelfService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping(value = "/bookshelves")
public class BookshelfController {

    private final BookshelfService bookshelfService;

    public BookshelfController(BookshelfService bookshelfService) {
        this.bookshelfService = bookshelfService;
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<BookshelfResponseDTO> findById(@PathVariable Long id) {
        BookshelfResponseDTO bookshelf = bookshelfService.findById(id);
        return ResponseEntity.ok().body(bookshelf);
    }

    @GetMapping(value = "/user/{userId}")
    public ResponseEntity<Page<BookshelfSummaryDTO>> findByUserId(
            @PathVariable Long userId, @AuthenticationPrincipal JWTUserData user, @PageableDefault(size = 20) Pageable pageable) {
        Page<BookshelfSummaryDTO> bookshelves = bookshelfService.findByUserId(userId, user.userId(), pageable);
        return ResponseEntity.ok().body(bookshelves);
    }

    @PostMapping
    public ResponseEntity<BookshelfResponseDTO> create(
            @AuthenticationPrincipal JWTUserData user, @RequestBody @Valid BookshelfRequestDTO request) {
        BookshelfResponseDTO bookshelf = bookshelfService.create(user.userId(), request);
        URI uri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(bookshelf.id())
                .toUri();
        return ResponseEntity.created(uri).body(bookshelf);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal JWTUserData user) {
        bookshelfService.delete(id, user.userId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping(value = "/{id}")
    public ResponseEntity<BookshelfResponseDTO> update(
            @PathVariable Long id, @RequestBody @Valid BookshelfUpdateDTO request, @AuthenticationPrincipal JWTUserData user) {
        BookshelfResponseDTO bookshelf = bookshelfService.update(id, request, user.userId());
        return ResponseEntity.ok().body(bookshelf);
    }
}
