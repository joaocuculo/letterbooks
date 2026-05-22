package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.client.GoogleBooksClient;
import com.joaocuculo.letterbooks.dto.request.BookSearchRequestDTO;
import com.joaocuculo.letterbooks.dto.response.BookSearchResponseDTO;
import com.joaocuculo.letterbooks.entities.Book;
import com.joaocuculo.letterbooks.mapper.BookMapper;
import com.joaocuculo.letterbooks.repositories.BookRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Service
public class BookService {

    private static final Map<String, Function<BookSearchRequestDTO, String>> FIELDS =
            Map.of(
                    "intitle:", BookSearchRequestDTO::title,
                    "inauthor:", BookSearchRequestDTO::author,
                    "inpublisher:", BookSearchRequestDTO::publisher,
                    "subject:", BookSearchRequestDTO::subject,
                    "isbn:", BookSearchRequestDTO::isbn
            );

    private final BookRepository bookRepository;
    private final GoogleBooksClient googleBooksClient;

    public BookService(BookRepository bookRepository, GoogleBooksClient googleBooksClient) {
        this.bookRepository = bookRepository;
        this.googleBooksClient = googleBooksClient;
    }

    public Page<BookSearchResponseDTO> search(BookSearchRequestDTO searchRequestDTO, int page, int size) {
        String query = queryBuilder(searchRequestDTO);

        int startIndex = page * size;

        try {
            var googleResponse = googleBooksClient.search(query, size, startIndex);

            List<BookSearchResponseDTO> content = googleResponse.items() == null ? List.of() :
                    googleResponse.items()
                            .stream()
                            .map(BookMapper::fromGoogle)
                            .toList();

            return new PageImpl<>(content, PageRequest.of(page, size), googleResponse.totalItems());
        } catch (WebClientException e) {
            return searchLocal(searchRequestDTO, page, size);
        }
    }

    private String queryBuilder(BookSearchRequestDTO dto) {
        List<String> terms = new ArrayList<>();

        FIELDS.forEach((prefix, getter) -> {
            String value = getter.apply(dto);

            if (value != null && !value.isBlank()) {
                terms.add(prefix + value.trim());
            }
        });

        if (dto.freeText() != null && !dto.freeText().isBlank()) {
            terms.add(dto.freeText().trim().replaceAll("\\s+", " "));
        }

        return String.join(" ", terms);
    }

    private String normalizeFreeText(String freeText) {
        if (freeText == null || freeText.isBlank()) {
            return null;
        }

        freeText = freeText.trim();

        if (freeText.startsWith("\"") && freeText.endsWith("\"")) {
            return freeText.substring(1, freeText.length() - 1);
        }

        return freeText;
    }

    private Page<BookSearchResponseDTO> searchLocal(BookSearchRequestDTO searchRequestDTO, int page, int size) {
        Page<Book> localPage = bookRepository.search(
                searchRequestDTO.title(),
                searchRequestDTO.author(),
                searchRequestDTO.publisher(),
                searchRequestDTO.subject(),
                searchRequestDTO.isbn(),
                normalizeFreeText(searchRequestDTO.freeText()),
                PageRequest.of(page, size)
        );

        return localPage.map(BookMapper::fromEntity);
    }

}
