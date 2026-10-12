package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.dto.request.BookshelfItemRequestDTO;
import com.joaocuculo.letterbooks.entities.*;
import com.joaocuculo.letterbooks.entities.enums.UserBookStatus;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.ForbiddenException;
import com.joaocuculo.letterbooks.repositories.*;
import com.joaocuculo.letterbooks.services.*;
import org.junit.jupiter.api.Test;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.AnnotationTransactionAttributeSource;
import org.springframework.transaction.interceptor.TransactionInterceptor;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.mockito.ArgumentCaptor;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BookshelfLibraryTests {
    private User owner() { var user = new User(); ReflectionTestUtils.setField(user, "id", 42L); return user; }
    private Book book(Long id) { var book = new Book(); ReflectionTestUtils.setField(book,"id",id); ReflectionTestUtils.setField(book,"googleBooksId","google-"+id); return book; }
    private Bookshelf shelf(Long id) { var shelf = spy(new Bookshelf("Clássicos",null,false,owner())); ReflectionTestUtils.setField(shelf,"id",id); return shelf; }

    @Test void summariesUseTwoBatchedQueriesWithoutLoadingCollections() {
        var repository=mock(BookshelfRepository.class);var items=mock(BookshelfItemRepository.class);var users=mock(UserService.class);
        var first=shelf(1L);var second=shelf(2L);var pageable=PageRequest.of(0,20);
        when(repository.findByUserId(42L,pageable)).thenReturn(new PageImpl<>(List.of(first,second),pageable,2));
        var count=mock(BookshelfItemRepository.ShelfCount.class);when(count.getShelfId()).thenReturn(1L);when(count.getBooksCount()).thenReturn(8L);
        when(items.countByShelves(List.of(1L,2L))).thenReturn(List.of(count));
        when(items.findPreviews(List.of(1L,2L))).thenReturn(List.of(new BookshelfItem(first,book(1L)),new BookshelfItem(first,book(2L)),new BookshelfItem(first,book(3L)),new BookshelfItem(first,book(4L))));
        var result=new BookshelfService(repository,users,items,mock(UserBookRepository.class)).findByUserId(42L,42L,pageable);
        assertEquals(8,result.getContent().getFirst().booksCount());assertEquals(4,result.getContent().getFirst().previewBooks().size());assertEquals(0,result.getContent().getLast().booksCount());
        verify(first,never()).getItems();verify(second,never()).getItems();verify(items).countByShelves(List.of(1L,2L));verify(items).findPreviews(List.of(1L,2L));verifyNoMoreInteractions(items);
    }

    @Test void privateShelfIsRejectedBeforeItemsAreRead() {
        var repository=mock(BookshelfRepository.class);var items=mock(BookshelfItemRepository.class);when(repository.findById(1L)).thenReturn(Optional.of(shelf(1L)));
        var service=new BookshelfService(repository,null,items,mock(UserBookRepository.class));
        assertThrows(ForbiddenException.class,()->service.findBooks(1L,99L,PageRequest.of(0,20)));verifyNoInteractions(items);
    }

    @Test void booksArePagedAndRelationsBelongToTheRequester() {
        var repository=mock(BookshelfRepository.class);var items=mock(BookshelfItemRepository.class);var relations=mock(UserBookRepository.class);var shelf=shelf(1L);shelf.setPublicShelf(true);
        when(repository.findById(1L)).thenReturn(Optional.of(shelf));var pageable=PageRequest.of(1,20);
        when(items.findBooks(1L,pageable)).thenReturn(new PageImpl<>(List.of(new BookshelfItem(shelf,book(7L))),pageable,21));
        when(relations.findByUserIdAndBookGoogleBooksIdIn(99L,List.of("google-7"))).thenReturn(List.of());
        var result=new BookshelfService(repository,null,items,relations).findBooks(1L,99L,pageable);
        assertEquals(21,result.getTotalElements());assertEquals(1,result.getNumber());assertNull(result.getContent().getFirst().userBook());
        verify(relations).findByUserIdAndBookGoogleBooksIdIn(99L,List.of("google-7"));
    }

    @Test void missingLibraryRelationStartsAsWantToRead() {
        var repository=mock(UserBookRepository.class);var users=mock(UserService.class);when(users.getByIdOrThrow(42L)).thenReturn(owner());
        new UserBookService(repository,users,null).ensureInLibrary(42L,book(7L));
        var captured=ArgumentCaptor.forClass(UserBook.class);verify(repository).save(captured.capture());
        assertEquals(UserBookStatus.WANT_TO_READ,captured.getValue().getStatus());assertFalse(captured.getValue().isFavorite());assertNull(captured.getValue().getCurrentPage());
    }

    @Test void existingLibraryRelationIsNeverOverwritten() {
        var repository=mock(UserBookRepository.class);when(repository.existsByUserIdAndBookId(42L,7L)).thenReturn(true);
        new UserBookService(repository,null,null).ensureInLibrary(42L,book(7L));verify(repository,never()).save(any());
    }

    @Test void duplicateIsRejectedBeforeLibraryChanges() {
        var items=mock(BookshelfItemRepository.class);var shelves=mock(BookshelfService.class);var books=mock(BookService.class);var library=mock(UserBookService.class);
        when(shelves.getOwnedBookshelf(1L,42L)).thenReturn(shelf(1L));when(books.findOrCreateByGoogleBooksId("google-7")).thenReturn(book(7L));when(items.existsByIdBookshelfIdAndIdBookId(1L,7L)).thenReturn(true);
        assertThrows(BusinessException.class,()->new BookshelfItemService(items,shelves,books,library).add(1L,new BookshelfItemRequestDTO("google-7"),42L));verifyNoInteractions(library);verify(items,never()).save(any());
    }

    @Test void failedAssociationRollsBackTheTransactionCoveringLibraryInclusion() {
        var items=mock(BookshelfItemRepository.class);var shelves=mock(BookshelfService.class);var books=mock(BookService.class);var library=mock(UserBookService.class);
        when(shelves.getOwnedBookshelf(1L,42L)).thenReturn(shelf(1L));var book=book(7L);when(books.findOrCreateByGoogleBooksId("google-7")).thenReturn(book);
        when(items.save(any())).thenThrow(new IllegalStateException("simulated save failure"));
        var manager=mock(PlatformTransactionManager.class);var transaction=new SimpleTransactionStatus();when(manager.getTransaction(any())).thenReturn(transaction);
        var proxy=new ProxyFactory(new BookshelfItemService(items,shelves,books,library));proxy.setProxyTargetClass(true);
        proxy.addAdvice(new TransactionInterceptor(manager,new AnnotationTransactionAttributeSource()));
        assertThrows(IllegalStateException.class,()->((BookshelfItemService)proxy.getProxy()).add(1L,new BookshelfItemRequestDTO("google-7"),42L));
        verify(library).ensureInLibrary(42L,book);verify(manager).rollback(transaction);verify(manager,never()).commit(any());
    }
}
