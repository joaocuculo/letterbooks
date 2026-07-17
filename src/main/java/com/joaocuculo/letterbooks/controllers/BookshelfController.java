package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.dto.response.BookshelfResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookshelfSummaryDTO;
import com.joaocuculo.letterbooks.services.BookshelfService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
