package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.dto.request.BookSearchRequestDTO;
import com.joaocuculo.letterbooks.dto.response.BookResponseDTO;
import com.joaocuculo.letterbooks.services.BookService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/books")
public class BookController {

    private final BookService service;

    public BookController(BookService service) {
        this.service = service;
    }

    @GetMapping("/search")
    public ResponseEntity<Page<BookResponseDTO>> search(
            @Valid @ModelAttribute BookSearchRequestDTO searchRequestDTO,
            @PageableDefault(page = 0, size = 10) Pageable pageable) {
        Page<BookResponseDTO> searchResult = service.search(searchRequestDTO, pageable);
        return ResponseEntity.ok(searchResult);
    }
}
