package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.client.GoogleBooksClient;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchResponseDTO;
import com.joaocuculo.letterbooks.dto.request.BookSearchRequestDTO;
import com.joaocuculo.letterbooks.dto.response.BookResponseDTO;
import com.joaocuculo.letterbooks.entities.Author;
import com.joaocuculo.letterbooks.entities.Book;
import com.joaocuculo.letterbooks.entities.Category;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.mapper.BookMapper;
import com.joaocuculo.letterbooks.repositories.BookRepository;
import com.joaocuculo.letterbooks.specifications.BookSpecifications;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
    private static final Logger log = LoggerFactory.getLogger(BookService.class);
    private final BookRepository bookRepository;
    private final AuthorService authorService;
    private final CategoryService categoryService;
    private final GoogleBooksClient googleBooksClient;

    public BookService(BookRepository bookRepository, GoogleBooksClient googleBooksClient, AuthorService authorService, CategoryService categoryService) {
        this.bookRepository = bookRepository;
        this.authorService = authorService;
        this.categoryService = categoryService;
        this.googleBooksClient = googleBooksClient;
    }

    public Page<BookResponseDTO> search(BookSearchRequestDTO searchRequestDTO, Pageable pageable) {
        String query = queryBuilder(searchRequestDTO);

        if (query.isBlank()) throw new BusinessException("É preciso informar ao menos um parãmetro de busca.");

        int startIndex = (int) pageable.getOffset();
        GoogleBooksSearchResponseDTO googleResponse = googleBooksClient.search(query, pageable.getPageSize(), startIndex);

        if (googleResponse == null || googleResponse.items() == null) {
            log.warn("Google Books indisponível. Executando busca local.");
            return searchLocal(searchRequestDTO, pageable);
        }

        List<BookResponseDTO> content = googleResponse.items()
                .stream()
                .map(BookMapper::fromGoogle)
                .toList();

        return new PageImpl<>(content, pageable, googleResponse.totalItems());
    }

    private Page<BookResponseDTO> searchLocal(BookSearchRequestDTO searchRequestDTO, Pageable pageable) {
        return bookRepository.findAll(BookSpecifications.withFilters(searchRequestDTO), pageable)
                .map(BookMapper::fromEntity);
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

    public Book findOrCreateByGoogleBooksId(String googleBooksId) {
        return bookRepository.findByGoogleBooksId(googleBooksId)
                .orElseGet(() -> createFromGoogleBooks(googleBooksId));
    }

    private Book createFromGoogleBooks(String googleBooksId) {
        GoogleBooksResponseDTO googleBook = googleBooksClient.findByGoogleBooksId(googleBooksId);

        // PROCESSO DE PEGAR OU CRIAR AUTOR E CATEGORIA PARA INSERIR NO LIVRO CADASTRADO.
        Set<Author> authors = authorService.resolveAuthors(googleBook.volumeInfo().authors());
        Set<Category> categories = categoryService.resolveCategories(googleBook.volumeInfo().categories());

        Book newBook = BookMapper.ToEntity(googleBook, authors, categories);

        return bookRepository.save(newBook);
    }
}
