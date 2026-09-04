package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.dto.request.BookSearchRequestDTO;
import com.joaocuculo.letterbooks.dto.response.BookCardResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookshelfResponseDTO;
import com.joaocuculo.letterbooks.dto.response.DiscoverResponseDTO;
import com.joaocuculo.letterbooks.services.BookService;
import com.joaocuculo.letterbooks.services.BookshelfService;
import com.joaocuculo.letterbooks.services.DiscoverService;
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
    private final DiscoverService discoverService;

    public BookController(BookService bookService, BookshelfService bookshelfService, DiscoverService discoverService) {
        this.bookService = bookService;
        this.bookshelfService = bookshelfService;
        this.discoverService = discoverService;
    }

    @GetMapping("/search")
    public ResponseEntity<Page<BookCardResponseDTO>> search(
            @Valid @ModelAttribute BookSearchRequestDTO searchRequestDTO,
            @PageableDefault(page = 0, size = 10) Pageable pageable,
            @AuthenticationPrincipal JWTUserData user) {
        Long userId = user != null ? user.userId() : null;
        Page<BookCardResponseDTO> searchResult = bookService.search(searchRequestDTO, pageable, userId);
        return ResponseEntity.ok(searchResult);
    }

    @GetMapping("/discover")
    public ResponseEntity<DiscoverResponseDTO> discover(@AuthenticationPrincipal JWTUserData user) {
        Long userId = user != null ? user.userId() : null;
        DiscoverResponseDTO discover = discoverService.discover(userId);
        return ResponseEntity.ok().body(discover);
    }

    @GetMapping("/{googleBooksId}")
    public ResponseEntity<BookResponseDTO> findByGoogleBooksId(@PathVariable String googleBooksId) {
        BookResponseDTO book = bookService.findByGoogleBooksId(googleBooksId);
        return ResponseEntity.ok(book);
    }

    @GetMapping("/{bookId}/bookshelves")
    public ResponseEntity<List<BookshelfResponseDTO>> findBookshelvesByBookId(
            @PathVariable Long bookId, @AuthenticationPrincipal JWTUserData user) {
        List<BookshelfResponseDTO> bookshelves = bookshelfService.findByUserIdAndBookId(user.userId(), bookId);
        return ResponseEntity.ok().body(bookshelves);
    }
}
