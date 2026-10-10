package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookCardResponseDTO;
import com.joaocuculo.letterbooks.dto.response.DiscoverResponseDTO;
import com.joaocuculo.letterbooks.dto.response.DiscoverSectionDTO;
import com.joaocuculo.letterbooks.entities.Book;
import com.joaocuculo.letterbooks.entities.UserBook;
import com.joaocuculo.letterbooks.mapper.BookMapper;
import com.joaocuculo.letterbooks.repositories.BookRepository;
import com.joaocuculo.letterbooks.repositories.UserBookRepository;
import com.joaocuculo.letterbooks.specifications.BookSpecifications;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DiscoverService {

    private static final Logger log = LoggerFactory.getLogger(DiscoverService.class);
    private static final int SECTION_SIZE = 12;
    private final GoogleBooksService googleBooksService;
    private final UserBookRepository userBookRepository;
    private final BookRepository bookRepository;
    // Buscas temáticas em texto livre: os filtros subject retornaram zero resultados no diagnóstico.
    private static final List<SectionDefinition> SECTIONS = List.of(
            new SectionDefinition("fiction", "Ficção", "fiction", List.of("fiction", "ficção", "ficcao")),
            new SectionDefinition("technology", "Tecnologia", "technology", List.of("technology", "tecnologia")),
            new SectionDefinition("biographies", "Biografias", "biographies", List.of("biograph", "biograf"))
    );

    public DiscoverService(GoogleBooksService googleBooksService, UserBookRepository userBookRepository, BookRepository bookRepository) {
        this.googleBooksService = googleBooksService;
        this.userBookRepository = userBookRepository;
        this.bookRepository = bookRepository;
    }

    @Transactional(readOnly = true)
    public DiscoverResponseDTO discover(Long userId) {
        List<DiscoverSectionDTO> sections = SECTIONS.stream()
                .map(def -> loadSection(def, userId))
                .flatMap(Optional::stream)
                .toList();
        if (sections.isEmpty()) {
            // Livros sem uma categoria correspondente não devem receber um rótulo incorreto.
            List<Book> books = bookRepository.findAll(sectionPage()).getContent();
            return new DiscoverResponseDTO(toLocalSection("catalog", "Do nosso catálogo", books, userId).stream().toList());
        }
        return new DiscoverResponseDTO(sections);
    }

    private Optional<DiscoverSectionDTO> loadSection(SectionDefinition definition, Long userId) {
        try {
            GoogleBooksSearchResponseDTO response = googleBooksService.search(definition.query(), SECTION_SIZE, 0);
            if (response == null) {
                log.warn("Google Books indisponível para a seção: {}. Consulta: {}. Executando busca local.", definition.key(), definition.query());
            } else if (response.items() == null || response.items().isEmpty()) {
                log.info("Google Books sem livros para a seção: {}. Consulta: {}. Total informado: {}. Executando busca local.",
                        definition.key(), definition.query(), response.totalItems());
            } else {
                List<GoogleBooksResponseDTO> items = response.items().stream()
                        .filter(this::isUsableBook)
                        .toList();
                if (!items.isEmpty()) {
                    Map<String, UserBook> userBooks = resolveUserBooks(userId, items.stream().map(GoogleBooksResponseDTO::googleBooksId).toList());
                    List<BookCardResponseDTO> books = items.stream()
                            .map(item -> {
                                UserBook userBook = userBooks.get(item.googleBooksId());
                                return BookMapper.toCardResponseDTO(item, userBook != null && userBook.isFavorite(), userBook != null ? userBook.getId() : null);
                            })
                            .toList();
                    log.info("Seção {} carregada do Google Books: {} livros. Consulta: {}.", definition.key(), books.size(), definition.query());
                    return Optional.of(new DiscoverSectionDTO(definition.key(), definition.title(), books));
                }
                log.warn("Google Books retornou livros sem dados essenciais para a seção: {}. Executando busca local.", definition.key());
            }
        } catch (Exception exception) {
            log.warn("Erro ao carregar a seção: {}. Tipo: {}. Executando busca local.", definition.key(), exception.getClass().getSimpleName());
        }
        List<Book> books = bookRepository.findAll(BookSpecifications.withSubjects(definition.localSubjects()), sectionPage()).getContent();
        return toLocalSection(definition.key(), definition.title(), books, userId);
    }

    private boolean isUsableBook(GoogleBooksResponseDTO book) {
        return book != null && book.googleBooksId() != null && !book.googleBooksId().isBlank()
                && book.volumeInfo() != null && book.volumeInfo().title() != null && !book.volumeInfo().title().isBlank();
    }

    private Optional<DiscoverSectionDTO> toLocalSection(String key, String title, List<Book> books, Long userId) {
        if (books.isEmpty()) {
            log.info("Nenhum livro persistido disponível para a seção: {}.", key);
            return Optional.empty();
        }
        Map<String, UserBook> userBooks = resolveUserBooks(userId, books.stream().map(Book::getGoogleBooksId).toList());
        List<BookCardResponseDTO> cards = books.stream()
                .map(book -> {
                    UserBook userBook = userBooks.get(book.getGoogleBooksId());
                    return BookMapper.toCardResponseDTO(book, userBook != null && userBook.isFavorite(), userBook != null ? userBook.getId() : null);
                })
                .toList();
        log.info("Seção {} carregada do banco local: {} livros.", key, cards.size());
        return Optional.of(new DiscoverSectionDTO(key, title, cards));
    }

    private PageRequest sectionPage() {
        return PageRequest.of(0, SECTION_SIZE, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
    }

    private Map<String, UserBook> resolveUserBooks(Long userId, List<String> googleBooksIds) {
        if (userId == null) {
            return Map.of();
        }
        return userBookRepository.findByUserIdAndBookGoogleBooksIdIn(userId, googleBooksIds).stream()
                .collect(Collectors.toMap(ub -> ub.getBook().getGoogleBooksId(), ub -> ub));
    }

    private record SectionDefinition(String key, String title, String query, List<String> localSubjects) {
    }
}
