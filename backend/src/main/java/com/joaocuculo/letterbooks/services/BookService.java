package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.client.GoogleBooksClient;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchResponseDTO;
import com.joaocuculo.letterbooks.dto.request.BookSearchRequestDTO;
import com.joaocuculo.letterbooks.dto.response.BookCardResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookResponseDTO;
import com.joaocuculo.letterbooks.entities.Author;
import com.joaocuculo.letterbooks.entities.Book;
import com.joaocuculo.letterbooks.entities.Category;
import com.joaocuculo.letterbooks.entities.UserBook;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.mapper.BookMapper;
import com.joaocuculo.letterbooks.repositories.BookRepository;
import com.joaocuculo.letterbooks.repositories.UserBookRepository;
import com.joaocuculo.letterbooks.specifications.BookSpecifications;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

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
    private final UserBookRepository userBookRepository;

    public BookService(BookRepository bookRepository, GoogleBooksClient googleBooksClient, AuthorService authorService, CategoryService categoryService, UserBookRepository userBookRepository) {
        this.bookRepository = bookRepository;
        this.authorService = authorService;
        this.categoryService = categoryService;
        this.googleBooksClient = googleBooksClient;
        this.userBookRepository = userBookRepository;
    }

    public BookResponseDTO findByGoogleBooksId(String googleBooksId) {
        Optional<Book> book = bookRepository.findByGoogleBooksId(googleBooksId);
        return book
                .map(BookMapper::toResponseDTO)
                .orElseGet(() ->
                        BookMapper.toResponseDTO(
                                googleBooksClient.findByGoogleBooksId(googleBooksId)
                        )
                );
    }

    public Page<BookCardResponseDTO> search(BookSearchRequestDTO searchRequestDTO, Pageable pageable, Long userId) {
        String query = queryBuilder(searchRequestDTO);

        if (query.isBlank()) throw new BusinessException("É preciso informar ao menos um parãmetro de busca.");

        int startIndex = (int) pageable.getOffset();
        GoogleBooksSearchResponseDTO googleResponse = googleBooksClient.search(query, pageable.getPageSize(), startIndex);

        if (googleResponse == null || googleResponse.items() == null) {
            log.warn("Google Books indisponível. Executando busca local.");
            return searchLocal(searchRequestDTO, pageable, userId);
        }

        List<GoogleBooksResponseDTO> items= googleResponse.items();
        List<String> googleBooksIds = items.stream()
                .map(GoogleBooksResponseDTO::googleBooksId)
                .toList();
        Map<String, UserBook> userBooksByGoogleId = resolveUserBooks(userId, googleBooksIds);

        List<BookCardResponseDTO> content = items.stream()
                .map(item -> {
                    UserBook userBook = userBooksByGoogleId.get(item.googleBooksId());
                    return BookMapper.toCardResponseDTO(
                            item,
                            userBook != null && userBook.isFavorite(),
                            userBook != null ? userBook.getId() : null
                    );
                })
                .toList();

        return new PageImpl<>(content, pageable, googleResponse.totalItems());
    }

    private Page<BookCardResponseDTO> searchLocal(BookSearchRequestDTO searchRequestDTO, Pageable pageable, Long userId) {
        Page<Book> books = bookRepository.findAll(BookSpecifications.withFilters(searchRequestDTO), pageable);

        List<String> googleBooksIds = books.getContent().stream()
                .map(Book::getGoogleBooksId)
                .toList();

        Map<String, UserBook> userBooksByGoogleId = resolveUserBooks(userId, googleBooksIds);

        return books.map(book -> {
            UserBook userBook = userBooksByGoogleId.get(book.getGoogleBooksId());

            return BookMapper.toCardResponseDTO(
                    book,
                    userBook != null && userBook.isFavorite(),
                    userBook != null ? userBook.getId() : null
            );
        });
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
        
        Set<Author> authors = authorService.resolveAuthors(googleBook.volumeInfo().authors());
        Set<Category> categories = categoryService.resolveCategories(googleBook.volumeInfo().categories());

        Book newBook = BookMapper.toEntity(googleBook, authors, categories);

        return bookRepository.save(newBook);
    }

    private Map<String, UserBook> resolveUserBooks(Long userId, List<String> googleBooksIds) {
        if (userId == null || googleBooksIds.isEmpty()) {
            return Map.of();
        }

        return userBookRepository.findByUserIdAndBookGoogleBooksIdIn(userId, googleBooksIds).stream()
                .collect(Collectors.toMap(
                        userBook -> userBook.getBook().getGoogleBooksId(),
                        userBook -> userBook
                ));
    }
}
