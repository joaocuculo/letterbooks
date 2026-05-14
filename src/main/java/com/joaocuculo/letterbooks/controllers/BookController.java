package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchRequestDTO;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchResponseDTO;
import com.joaocuculo.letterbooks.services.BookService;
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
    public ResponseEntity<GoogleBooksSearchResponseDTO> search(@RequestBody GoogleBooksSearchRequestDTO searchRequestDTO) {
        GoogleBooksSearchResponseDTO searchResult = service.search(searchRequestDTO);
        return ResponseEntity.ok(searchResult);
    }
}
