package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.request.BookshelfBulkRequestDTO;
import com.joaocuculo.letterbooks.entities.*;
import com.joaocuculo.letterbooks.exceptions.*;
import com.joaocuculo.letterbooks.repositories.*;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.SimpleTransactionStatus;
import java.sql.SQLException;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BookshelfBulkTests {
    final BookshelfService shelves = mock(BookshelfService.class);
    final BookRepository books = mock(BookRepository.class);
    final BookService catalog = mock(BookService.class);
    final GoogleBooksService google = mock(GoogleBooksService.class);
    final UserBookService library = mock(UserBookService.class);
    final BookshelfItemRepository items = mock(BookshelfItemRepository.class);
    final PlatformTransactionManager manager = mock(PlatformTransactionManager.class);
    BookshelfBulkService service() {
        doAnswer(call -> {
            TransactionDefinition definition = call.getArgument(0);
            assertEquals(15, definition.getTimeout());
            assertEquals(TransactionDefinition.PROPAGATION_REQUIRES_NEW, definition.getPropagationBehavior());
            return new SimpleTransactionStatus();
        }).when(manager).getTransaction(any());
        return new BookshelfBulkService(shelves, books, catalog, google, library, items, manager);
    }
    Book book(long id, String googleId) {
        var book = new Book(googleId, googleId, null, null, null, null, null, null, null, null, null, null, null);
        ReflectionTestUtils.setField(book, "id", id); return book;
    }
    Bookshelf shelf(long id) {
        var shelf = new Bookshelf("Shelf", null, false, new User());
        ReflectionTestUtils.setField(shelf, "id", id); return shelf;
    }
    GoogleBooksResponseDTO external(String id) {
        return new GoogleBooksResponseDTO(id, new GoogleBooksResponseDTO.VolumeInfo(id, null, List.of(), null, null,
                null, null, null, List.of(), null, null, null));
    }

    @Test void normalizesAndDeduplicatesAndSkipsExistingPairs() {
        var shelf = shelf(1); var a = book(1, "a"); var b = book(2, "b");
        when(shelves.getOwnedBookshelves(List.of(1L), 42L)).thenReturn(List.of(shelf));
        when(books.findByGoogleBooksIdIn(List.of("a", "b"))).thenReturn(List.of(a,b));
        when(items.findSelectedItems(any(),any())).thenReturn(List.of(new BookshelfItem(shelf,a)));
        doAnswer(call -> {
            List<BookshelfItem> additions = call.getArgument(0);
            assertEquals(1, additions.size()); assertSame(b, additions.getFirst().getBook()); return additions;
        }).when(items).saveAll(anyList());
        var result = service().add(new BookshelfBulkRequestDTO(List.of(" b ","a","a"), List.of(1L,1L)),42L);
        assertEquals(2, result.booksCount());
        assertEquals(1, result.shelves().getFirst().addedCount());
        assertEquals(1, result.shelves().getFirst().alreadyPresentCount());
        verifyNoInteractions(google,catalog); verify(library).ensureInLibrary(42L,a); verify(library).ensureInLibrary(42L,b);
        verify(manager).commit(any());
    }
    @Test void membershipCountsAreReadOnlyAndAuthorizeBeforeQuerying() {
        var count = mock(BookshelfItemRepository.SelectedShelfCount.class);
        when(count.getBookshelfId()).thenReturn(1L); when(count.getExistingCount()).thenReturn(1L);
        when(items.countSelectedBooks(List.of(1L,2L),List.of("a","b"))).thenReturn(List.of(count));
        var result = service().summary(new BookshelfBulkRequestDTO(List.of("a","b"),List.of(2L,1L)),42L);
        assertEquals(List.of(1,0),result.shelves().stream().map(s -> s.existingCount()).toList());
        verifyNoInteractions(books,google,catalog,library);
        reset(items);
        when(shelves.getOwnedBookshelves(any(),eq(42L))).thenThrow(new ForbiddenException("Denied"));
        assertThrows(ForbiddenException.class,()->service().summary(new BookshelfBulkRequestDTO(List.of("a"),List.of(1L)),42L));
        verifyNoInteractions(items);
    }
    @Test void deniesForeignDestinationsBeforePreparingAnything() {
        when(shelves.getOwnedBookshelves(any(),anyLong())).thenThrow(new ForbiddenException("Denied"));
        assertThrows(ForbiddenException.class,()->service().add(new BookshelfBulkRequestDTO(List.of("a"),List.of(1L)),42L));
        verifyNoInteractions(books,google,catalog,library,items,manager);
    }
    @Test void externalFailureDoesNotStartWriteTransaction() {
        when(books.findByGoogleBooksIdIn(any())).thenReturn(List.of());
        when(google.findByGoogleBooksId(anyString())).thenThrow(new ExternalServiceException("Unavailable"));
        assertThrows(ExternalServiceException.class,()->service().add(new BookshelfBulkRequestDTO(List.of("a"),List.of(1L)),42L));
        verifyNoInteractions(catalog,library,items,manager);
    }
    @Test void limitsPreparationToFourParallelCallsAndPersistsPreparedData() {
        var active=new AtomicInteger(); var peak=new AtomicInteger();
        when(shelves.getOwnedBookshelves(any(),anyLong())).thenReturn(List.of(shelf(1)));
        when(books.findByGoogleBooksIdIn(any())).thenReturn(List.of());
        when(google.findByGoogleBooksId(anyString())).thenAnswer(call -> {
            peak.accumulateAndGet(active.incrementAndGet(),Math::max);
            try { Thread.sleep(30); return external(call.getArgument(0)); } finally { active.decrementAndGet(); }
        });
        var next=new AtomicInteger();
        when(catalog.createFromPreparedGoogleBook(any())).thenAnswer(call -> book(next.incrementAndGet(),((GoogleBooksResponseDTO)call.getArgument(0)).googleBooksId()));
        var ids=java.util.stream.IntStream.range(0,8).mapToObj(i->"g"+i).toList();
        assertEquals(8,service().add(new BookshelfBulkRequestDTO(ids,List.of(1L)),42L).shelves().getFirst().addedCount());
        assertTrue(peak.get()>1); assertTrue(peak.get()<=4); verify(google,times(8)).findByGoogleBooksId(anyString());
    }
    @Test void retriesOnlyUniqueConflictsInFreshTransactionsAndRecomputesCounts() {
        var a=book(1,"a"); var shelf=shelf(1);
        when(shelves.getOwnedBookshelves(any(),anyLong())).thenReturn(List.of(shelf));
        when(books.findByGoogleBooksIdIn(any())).thenReturn(List.of(a));
        when(items.findSelectedItems(any(),any())).thenReturn(List.of(),List.of(new BookshelfItem(shelf,a)));
        doThrow(new DataIntegrityViolationException("race",new SQLException("duplicate","23505"))).doNothing().when(items).flush();
        var result=service().add(new BookshelfBulkRequestDTO(List.of("a"),List.of(1L)),42L);
        assertEquals(0,result.shelves().getFirst().addedCount()); assertEquals(1,result.shelves().getFirst().alreadyPresentCount());
        verify(manager,times(2)).getTransaction(any()); verify(manager).rollback(any()); verify(manager).commit(any());
    }
    @Test void doesNotRetryNonUniqueConstraintFailures() {
        when(shelves.getOwnedBookshelves(any(),anyLong())).thenReturn(List.of(shelf(1)));
        when(books.findByGoogleBooksIdIn(any())).thenReturn(List.of(book(1,"a")));
        doThrow(new DataIntegrityViolationException("invalid",new SQLException("constraint","23503"))).when(items).flush();
        assertThrows(DataIntegrityViolationException.class,()->service().add(new BookshelfBulkRequestDTO(List.of("a"),List.of(1L)),42L));
        verify(manager).getTransaction(any()); verify(manager).rollback(any()); verify(manager,never()).commit(any());
    }
    @Test void validatesBothListsAndTheirElements() {
        try(var factory=Validation.buildDefaultValidatorFactory()) {
            var validator=factory.getValidator();
            for(var request:List.of(new BookshelfBulkRequestDTO(null,List.of(1L)),new BookshelfBulkRequestDTO(List.of(),List.of(1L)),
                    new BookshelfBulkRequestDTO(List.of(" "),List.of(1L)),new BookshelfBulkRequestDTO(List.of("a"),List.of(-1L)),
                    new BookshelfBulkRequestDTO(Collections.nCopies(21,"a"),List.of(1L)),
                    new BookshelfBulkRequestDTO(List.of("a"),Collections.nCopies(21,1L)),
                    new BookshelfBulkRequestDTO(List.of("a"),Arrays.asList((Long)null))))
                assertFalse(validator.validate(request).isEmpty());
            assertTrue(validator.validate(new BookshelfBulkRequestDTO(List.of("a"),List.of(1L))).isEmpty());
        }
    }
}
