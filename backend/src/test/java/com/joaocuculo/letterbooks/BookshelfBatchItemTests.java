package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.dto.request.BookshelfBatchItemRequestDTO;
import com.joaocuculo.letterbooks.entities.Book;
import com.joaocuculo.letterbooks.entities.Bookshelf;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.exceptions.ForbiddenException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.repositories.*;
import com.joaocuculo.letterbooks.services.*;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.List;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BookshelfBatchItemTests {
    private Bookshelf shelf(long id, long userId) {
        var user = new User(); ReflectionTestUtils.setField(user, "id", userId);
        var shelf = new Bookshelf("Estante " + id, null, false, user);
        ReflectionTestUtils.setField(shelf, "id", id); return shelf;
    }
    @Test void addsToSeveralShelvesResolvingBookAndLibraryOnlyOnce() {
        var repository = mock(BookshelfItemRepository.class);
        var shelves = mock(BookshelfService.class);
        var books = mock(BookService.class);
        var library = mock(UserBookService.class);
        var book = new Book(); ReflectionTestUtils.setField(book, "id", 9L);
        when(shelves.getOwnedBookshelves(Set.of(1L,2L,3L), 42L)).thenReturn(List.of(shelf(1,42),shelf(2,42),shelf(3,42)));
        when(books.findOrCreateByGoogleBooksId("google-id")).thenReturn(book);
        when(repository.findShelfIdsContainingBook(Set.of(1L,2L,3L),9L)).thenReturn(List.of(2L));
        doAnswer(call -> {
            List<com.joaocuculo.letterbooks.entities.BookshelfItem> items = call.getArgument(0);
            assertEquals(List.of(1L,3L),items.stream().map(i->i.getBookshelf().getId()).toList());
            assertTrue(items.stream().allMatch(i->i.getBook()==book)); return items;
        }).when(repository).saveAll(anyList());
        new BookshelfItemService(repository,shelves,books,library).addToShelves(new BookshelfBatchItemRequestDTO("google-id",List.of(1L,2L,3L,1L)),42L);
        verify(books,times(1)).findOrCreateByGoogleBooksId("google-id");
        verify(library,times(1)).ensureInLibrary(42L,book);
        verify(repository).saveAll(anyList());
        verify(repository,never()).existsByIdBookshelfIdAndIdBookId(anyLong(),anyLong());
    }
    @Test void checksEveryShelfBeforePersistingTheBook() {
        var repository=mock(BookshelfRepository.class);
        when(repository.findAllById(Set.of(1L,2L))).thenReturn(List.of(shelf(1,42),shelf(2,99)));
        var shelves=new BookshelfService(repository,null,null,null);
        var books=mock(BookService.class);var items=mock(BookshelfItemRepository.class);var library=mock(UserBookService.class);
        var service=new BookshelfItemService(items,shelves,books,library);
        assertThrows(ForbiddenException.class,()->service.addToShelves(new BookshelfBatchItemRequestDTO("google-id",List.of(1L,2L)),42L));
        verifyNoInteractions(books,items,library);
    }
    @Test void rejectsMissingShelfBeforeAnyBookWrite() {
        var repository=mock(BookshelfRepository.class);
        when(repository.findAllById(Set.of(1L,2L))).thenReturn(List.of(shelf(1,42)));
        var shelves=new BookshelfService(repository,null,null,null);
        assertThrows(ResourceNotFoundException.class,()->shelves.getOwnedBookshelves(Set.of(1L,2L),42L));
    }
    @Test void validatesEmptySelectionAndInvalidIds() {
        try(var factory=Validation.buildDefaultValidatorFactory()) {
            var validator=factory.getValidator();
            assertFalse(validator.validate(new BookshelfBatchItemRequestDTO("g",List.of())).isEmpty());
            assertFalse(validator.validate(new BookshelfBatchItemRequestDTO("g",List.of(-1L))).isEmpty());
            assertFalse(validator.validate(new BookshelfBatchItemRequestDTO(" ",List.of(1L))).isEmpty());
            assertTrue(validator.validate(new BookshelfBatchItemRequestDTO("g",List.of(1L,2L))).isEmpty());
        }
    }
    @Test void saveFailureRollsBackAllAssociationsAndLibraryInclusion() {
        var items=mock(BookshelfItemRepository.class);var shelves=mock(BookshelfService.class);var books=mock(BookService.class);var library=mock(UserBookService.class);
        when(shelves.getOwnedBookshelves(Set.of(1L,2L),42L)).thenReturn(List.of(shelf(1,42),shelf(2,42)));
        var book=new Book();ReflectionTestUtils.setField(book,"id",9L);when(books.findOrCreateByGoogleBooksId("g")).thenReturn(book);
        when(items.saveAll(anyList())).thenThrow(new IllegalStateException("simulated batch failure"));
        var manager=mock(org.springframework.transaction.PlatformTransactionManager.class);
        var transaction=new org.springframework.transaction.support.SimpleTransactionStatus();when(manager.getTransaction(any())).thenReturn(transaction);
        var proxy=new org.springframework.aop.framework.ProxyFactory(new BookshelfItemService(items,shelves,books,library));proxy.setProxyTargetClass(true);
        proxy.addAdvice(new org.springframework.transaction.interceptor.TransactionInterceptor(manager,new org.springframework.transaction.annotation.AnnotationTransactionAttributeSource()));
        assertThrows(IllegalStateException.class,()->((BookshelfItemService)proxy.getProxy()).addToShelves(new BookshelfBatchItemRequestDTO("g",List.of(1L,2L)),42L));
        verify(library).ensureInLibrary(42L,book);verify(manager).rollback(transaction);verify(manager,never()).commit(any());
    }
}
