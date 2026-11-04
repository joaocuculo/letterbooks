package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.request.BookshelfBulkRequestDTO;
import com.joaocuculo.letterbooks.dto.response.BookshelfBulkResultDTO;
import com.joaocuculo.letterbooks.dto.response.BookshelfBulkSummaryDTO;
import com.joaocuculo.letterbooks.entities.*;
import com.joaocuculo.letterbooks.exceptions.*;
import com.joaocuculo.letterbooks.repositories.BookRepository;
import com.joaocuculo.letterbooks.repositories.BookshelfItemRepository;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.sql.SQLException;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
public class BookshelfBulkService {
    private final BookshelfService shelves;
    private final BookRepository books;
    private final BookService catalog;
    private final GoogleBooksService google;
    private final UserBookService library;
    private final BookshelfItemRepository items;
    private final TransactionTemplate transaction;

    public BookshelfBulkService(BookshelfService shelves, BookRepository books, BookService catalog,
            GoogleBooksService google, UserBookService library, BookshelfItemRepository items,
            PlatformTransactionManager manager) {
        this.shelves = shelves; this.books = books; this.catalog = catalog;
        this.google = google; this.library = library; this.items = items;
        transaction = new TransactionTemplate(manager);
        transaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        transaction.setTimeout(15);
    }

    private List<String> bookIds(BookshelfBulkRequestDTO request) {
        return request.googleBooksIds().stream().map(String::trim).distinct().sorted().toList();
    }

    private List<Long> shelfIds(BookshelfBulkRequestDTO request) {
        return request.bookshelfIds().stream().distinct().sorted().toList();
    }

    @Transactional(readOnly = true)
    public BookshelfBulkSummaryDTO summary(BookshelfBulkRequestDTO request, Long userId) {
        var googleIds = bookIds(request);
        var ids = shelfIds(request);
        shelves.getOwnedBookshelves(ids, userId);
        var counts = items.countSelectedBooks(ids, googleIds).stream().collect(Collectors.toMap(
                BookshelfItemRepository.SelectedShelfCount::getBookshelfId,
                BookshelfItemRepository.SelectedShelfCount::getExistingCount));
        return new BookshelfBulkSummaryDTO(googleIds.size(), ids.stream().map(id ->
                new BookshelfBulkSummaryDTO.Shelf(id, counts.getOrDefault(id, 0L).intValue())).toList());
    }

    public BookshelfBulkResultDTO add(BookshelfBulkRequestDTO request, Long userId) {
        var googleIds = bookIds(request);
        var ids = shelfIds(request);
        shelves.getOwnedBookshelves(ids, userId);
        var localIds = books.findByGoogleBooksIdIn(googleIds).stream().map(Book::getGoogleBooksId).collect(Collectors.toSet());
        var prepared = prepare(googleIds.stream().filter(id -> !localIds.contains(id)).toList());
        for (int attempt = 0; ; attempt++) {
            try {
                return transaction.execute(status -> persist(ids, googleIds, prepared, userId));
            } catch (ConcurrencyFailureException | DataIntegrityViolationException error) {
                if (attempt > 0 || !retryable(error)) throw error;
            }
        }
    }

    private boolean retryable(RuntimeException error) {
        if (error instanceof ConcurrencyFailureException) return true;
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if (cause instanceof SQLException sql && "23505".equals(sql.getSQLState())) return true;
        }
        return false;
    }

    private Map<String, GoogleBooksResponseDTO> prepare(List<String> missing) {
        if (missing.isEmpty()) return Map.of();
        var executor = Executors.newFixedThreadPool(4, Thread.ofVirtual().factory());
        var completion = new ExecutorCompletionService<GoogleBooksResponseDTO>(executor);
        var tasks = new ArrayList<Future<GoogleBooksResponseDTO>>();
        long deadline = System.nanoTime() + Duration.ofSeconds(45).toNanos();
        try {
            for (var id : missing) tasks.add(completion.submit(() -> {
                var response = google.findByGoogleBooksId(id);
                if (response == null || response.volumeInfo() == null || !id.equals(response.googleBooksId())
                        || response.volumeInfo().title() == null || response.volumeInfo().title().isBlank())
                    throw new ExternalServiceException("Não foi possível carregar os dados de um dos livros.");
                return response;
            }));
            var result = new HashMap<String, GoogleBooksResponseDTO>();
            for (int i = 0; i < missing.size(); i++) {
                var task = completion.poll(Math.max(0, deadline - System.nanoTime()), TimeUnit.NANOSECONDS);
                if (task == null) throw new ExternalServiceException("O tempo de preparação dos livros foi excedido. Tente novamente.");
                var response = task.get();
                result.put(response.googleBooksId(), response);
            }
            return result;
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw new ExternalServiceException("A preparação dos livros foi interrompida.");
        } catch (ExecutionException error) {
            if (error.getCause() instanceof RuntimeException cause) throw cause;
            throw new ExternalServiceException("Não foi possível preparar os livros.");
        } finally {
            tasks.forEach(task -> task.cancel(true));
            executor.shutdownNow();
        }
    }

    private BookshelfBulkResultDTO persist(List<Long> ids, List<String> googleIds,
            Map<String, GoogleBooksResponseDTO> prepared, Long userId) {
        var owned = shelves.getOwnedBookshelves(ids, userId).stream()
                .sorted(Comparator.comparing(Bookshelf::getId)).toList();
        var local = books.findByGoogleBooksIdIn(googleIds).stream()
                .collect(Collectors.toMap(Book::getGoogleBooksId, book -> book));
        var resolved = new ArrayList<Book>();
        for (var id : googleIds) {
            var book = local.get(id);
            if (book == null) {
                var data = prepared.get(id);
                if (data == null) throw new BusinessException("O catálogo foi alterado. Atualize a seleção e tente novamente.");
                book = catalog.createFromPreparedGoogleBook(data);
            }
            library.ensureInLibrary(userId, book);
            resolved.add(book);
        }
        var existing = items.findSelectedItems(ids, googleIds).stream().collect(Collectors.groupingBy(
                item -> item.getBookshelf().getId(), Collectors.mapping(item -> item.getBook().getId(), Collectors.toSet())));
        var additions = new ArrayList<BookshelfItem>();
        var results = new ArrayList<BookshelfBulkResultDTO.Shelf>();
        for (var shelf : owned) {
            var present = existing.getOrDefault(shelf.getId(), Set.of());
            for (var book : resolved) if (!present.contains(book.getId())) additions.add(new BookshelfItem(shelf, book));
            results.add(new BookshelfBulkResultDTO.Shelf(shelf.getId(), resolved.size() - present.size(), present.size()));
        }
        items.saveAll(additions);
        items.flush();
        return new BookshelfBulkResultDTO(resolved.size(), results);
    }
}
