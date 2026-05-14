package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.client.GoogleBooksClient;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchRequestDTO;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchResponseDTO;
import com.joaocuculo.letterbooks.repositories.BookRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final GoogleBooksClient googleBooksClient;

    public BookService(BookRepository bookRepository, GoogleBooksClient googleBooksClient) {
        this.bookRepository = bookRepository;
        this.googleBooksClient = googleBooksClient;
    }

    public GoogleBooksSearchResponseDTO search(GoogleBooksSearchRequestDTO searchRequestDTO) {
        String query = queryBuilder(searchRequestDTO);
        return googleBooksClient.search(
                query,
                Integer.parseInt(searchRequestDTO.maxResults()),
                Integer.parseInt(searchRequestDTO.startIndex())
        );
    }

    private String queryBuilder(GoogleBooksSearchRequestDTO dto) {
        List<String> terms = new ArrayList<>();

        if (dto.title() != null) {
            terms.add("intitle:" + dto.title());
        }

        if (dto.author() != null) {
            terms.add("inauthor:" + dto.author());
        }

        if (dto.publisher() != null) {
            terms.add("inpublisher:" + dto.publisher());
        }

        if (dto.subject() != null) {
            terms.add("subject:" + dto.subject());
        }

        if (dto.isbn() != null) {
            terms.add("isbn:" + dto.isbn());
        }

        if (dto.freeText() != null && !dto.freeText().isBlank()) {
            terms.add(dto.freeText().trim().replaceAll("\\s+", " "));
        }

        return String.join(" ", terms);
    }

}
