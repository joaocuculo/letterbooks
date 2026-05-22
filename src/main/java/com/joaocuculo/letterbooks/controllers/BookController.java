package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.dto.request.BookSearchRequestDTO;
import com.joaocuculo.letterbooks.dto.response.BookSearchResponseDTO;
import com.joaocuculo.letterbooks.services.BookService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/books")
public class BookController {

    private final BookService service;

    public BookController(BookService service) {
        this.service = service;
    }

    @GetMapping("/search")
    public ResponseEntity<Page<BookSearchResponseDTO>> search(
            @Valid @ModelAttribute BookSearchRequestDTO searchRequestDTO,
            @RequestParam(defaultValue = "0") @PositiveOrZero int page,
            @RequestParam(defaultValue = "10") @Positive @Max(40) int size) {
        Page<BookSearchResponseDTO> searchResult = service.search(searchRequestDTO, page, size);
        return ResponseEntity.ok(searchResult);
    }
}
