package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.dto.request.BookSearchRequestDTO;
import com.joaocuculo.letterbooks.dto.response.BookResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookshelfResponseDTO;
import com.joaocuculo.letterbooks.services.BookService;
import com.joaocuculo.letterbooks.services.BookshelfService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/books")
public class BookController {

    private final BookService bookService;
    private final BookshelfService bookshelfService;

    public BookController(BookService bookService, BookshelfService bookshelfService) {
        this.bookService = bookService;
        this.bookshelfService = bookshelfService;
    }

    @GetMapping("/search")
    public ResponseEntity<Page<BookResponseDTO>> search(
            @Valid @ModelAttribute BookSearchRequestDTO searchRequestDTO,
            @PageableDefault(page = 0, size = 10) Pageable pageable) {
        Page<BookResponseDTO> searchResult = bookService.search(searchRequestDTO, pageable);
        return ResponseEntity.ok(searchResult);
    }

    @GetMapping("/{bookId}/bookshelves")
    public ResponseEntity<List<BookshelfResponseDTO>> findBookshelvesByBookId(
            @PathVariable Long bookId, @AuthenticationPrincipal JWTUserData user) {
        List<BookshelfResponseDTO> bookshelves = bookshelfService.findByUserIdAndBookId(user.userId(), bookId);
        return ResponseEntity.ok().body(bookshelves);
    }
}
