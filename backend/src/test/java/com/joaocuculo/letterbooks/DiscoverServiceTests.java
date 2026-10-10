package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchResponseDTO;
import com.joaocuculo.letterbooks.entities.Book;
import com.joaocuculo.letterbooks.entities.UserBook;
import com.joaocuculo.letterbooks.repositories.BookRepository;
import com.joaocuculo.letterbooks.repositories.UserBookRepository;
import com.joaocuculo.letterbooks.services.DiscoverService;
import com.joaocuculo.letterbooks.services.GoogleBooksService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class DiscoverServiceTests {
    private GoogleBooksService google;
    private BookRepository books;
    private UserBookRepository userBooks;
    private DiscoverService service;

    @BeforeEach
    void configureService() {
        google = mock(GoogleBooksService.class);
        books = mock(BookRepository.class);
        userBooks = mock(UserBookRepository.class);
        service = new DiscoverService(google, userBooks, books);
    }

    @Test
    void successfulThematicSearchDoesNotReadOrWriteLocalBooks() {
        when(google.search(anyString(), eq(12), eq(0))).thenReturn(response(googleBook("google-1")));
        var sections = service.discover(null).sections();
        assertEquals(3, sections.size());
        assertEquals("google-1", sections.getFirst().books().getFirst().id());
        verify(google).search("fiction", 12, 0);
        verify(google).search("technology", 12, 0);
        verify(google).search("biographies", 12, 0);
        verifyNoInteractions(books, userBooks);
    }

    @ParameterizedTest
    @ValueSource(strings = {"unavailable", "empty", "missing-items", "exception", "malformed"})
    void failedOrEmptyGoogleUsesLocalSections(String mode) {
        switch (mode) {
            case "empty" -> when(google.search(anyString(), anyInt(), anyInt())).thenReturn(new GoogleBooksSearchResponseDTO(0, List.of()));
            case "missing-items" -> when(google.search(anyString(), anyInt(), anyInt())).thenReturn(new GoogleBooksSearchResponseDTO(0, null));
            case "exception" -> when(google.search(anyString(), anyInt(), anyInt())).thenThrow(new IllegalStateException("failure"));
            case "malformed" -> when(google.search(anyString(), anyInt(), anyInt())).thenReturn(response(new GoogleBooksResponseDTO("invalid", null)));
            default -> { }
        }
        when(books.findAll(any(Specification.class), any(PageRequest.class))).thenReturn(new PageImpl<>(List.of(localBook("local-1"))));
        var sections = service.discover(null).sections();
        assertEquals(3, sections.size());
        assertEquals("local-1", sections.getFirst().books().getFirst().id());
        assertFalse(sections.getFirst().books().getFirst().isFavorite());
        assertNull(sections.getFirst().books().getFirst().userBookId());
        verify(books, never()).findAll(any(PageRequest.class));
        verify(books, never()).save(any());
        var page = ArgumentCaptor.forClass(PageRequest.class);
        verify(books, times(3)).findAll(any(Specification.class), page.capture());
        assertEquals(12, page.getValue().getPageSize());
        assertEquals(0, page.getValue().getPageNumber());
        assertEquals(Sort.Direction.DESC, page.getValue().getSort().getOrderFor("createdAt").getDirection());
        assertNotNull(page.getValue().getSort().getOrderFor("id"));
        verifyNoInteractions(userBooks);
    }

    @Test
    void combinesGoogleAndLocalSectionsAndKeepsUserFavorites() {
        when(google.search("fiction", 12, 0)).thenReturn(response(googleBook("google-1")));
        Book local = localBook("local-1");
        UserBook favorite = new UserBook();
        ReflectionTestUtils.setField(favorite, "book", local);
        favorite.setFavorite(true);
        ReflectionTestUtils.setField(favorite, "id", 99L);
        when(userBooks.findByUserIdAndBookGoogleBooksIdIn(7L, List.of("local-1"))).thenReturn(List.of(favorite));
        when(userBooks.findByUserIdAndBookGoogleBooksIdIn(7L, List.of("google-1"))).thenReturn(List.of());
        when(books.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(local)), Page.empty());
        var sections = service.discover(7L).sections();
        assertEquals(List.of("fiction", "technology"), sections.stream().map(section -> section.key()).toList());
        var card = sections.get(1).books().getFirst();
        assertTrue(card.isFavorite());
        assertEquals(99L, card.userBookId());
        verify(books, never()).findAll(any(PageRequest.class));
    }

    @Test
    void uncategorizedCatalogHasItsOwnHonestSection() {
        when(books.findAll(any(Specification.class), any(PageRequest.class))).thenReturn(Page.empty());
        when(books.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of(localBook("uncategorized"))));
        var sections = service.discover(null).sections();
        assertEquals(1, sections.size());
        assertEquals("catalog", sections.getFirst().key());
        assertEquals("Do nosso catálogo", sections.getFirst().title());
        verify(books, never()).save(any());
    }

    @Test
    void malformedItemDoesNotDiscardValidItemsInSameSection() {
        when(google.search(anyString(), anyInt(), anyInt())).thenReturn(response(null, new GoogleBooksResponseDTO("bad", null), googleBook("good")));
        assertEquals("good", service.discover(null).sections().getFirst().books().getFirst().id());
        verifyNoInteractions(books);
    }

    private Book localBook(String id) {
        Book book = new Book();
        book.setGoogleBooksId(id);
        book.setTitle("Livro persistido");
        return book;
    }

    private GoogleBooksResponseDTO googleBook(String id) {
        return new GoogleBooksResponseDTO(id, new GoogleBooksResponseDTO.VolumeInfo(
                "Livro do Google", null, List.of("Autor"), null, null, null, null, null, null, null, null, null));
    }

    private GoogleBooksSearchResponseDTO response(GoogleBooksResponseDTO... items) {
        return new GoogleBooksSearchResponseDTO(items.length, Arrays.asList(items));
    }
}
