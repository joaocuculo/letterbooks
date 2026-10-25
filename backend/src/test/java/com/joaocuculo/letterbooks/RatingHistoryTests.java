package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.repositories.RatingRepository;
import com.joaocuculo.letterbooks.services.*;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import org.mockito.ArgumentCaptor;

class RatingHistoryTests {
    RatingRepository repository = mock(RatingRepository.class);
    UserService users = mock(UserService.class);
    BookService books = mock(BookService.class);
    RatingService service = new RatingService(repository, users, books);

    @Test void filtersByAuthenticatedUserAndEscapesLiteralSearchCharacters() {
        when(repository.searchByUserId(anyLong(), anyString(), any())).thenReturn(Page.empty());
        service.findByUserId(42L, "  100%_!  ", PageRequest.of(2, 20));
        var page = ArgumentCaptor.forClass(Pageable.class);
        verify(repository).searchByUserId(eq(42L), eq("%100!%!_!!%"), page.capture());
        assertEquals(2, page.getValue().getPageNumber());
        assertEquals(Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")), page.getValue().getSort());
        verifyNoInteractions(users, books);
    }
    @Test void scoreSortHasStableCreationAndIdTieBreakers() {
        when(repository.searchByUserId(anyLong(), anyString(), any())).thenReturn(Page.empty());
        service.findByUserId(5L, null, PageRequest.of(0, 20, Sort.by("score")));
        var page = ArgumentCaptor.forClass(Pageable.class);
        verify(repository).searchByUserId(eq(5L), eq("%%"), page.capture());
        assertEquals(Sort.by(Sort.Order.asc("score"), Sort.Order.desc("createdAt"), Sort.Order.desc("id")), page.getValue().getSort());
    }
    @Test void existingServiceSignatureStillListsAllRatings() {
        when(repository.searchByUserId(anyLong(), anyString(), any())).thenReturn(Page.empty());
        service.findByUserId(5L, PageRequest.of(0, 20, Sort.by("createdAt")));
        var page = ArgumentCaptor.forClass(Pageable.class);
        verify(repository).searchByUserId(eq(5L), eq("%%"), page.capture());
        assertEquals(Sort.Direction.ASC, page.getValue().getSort().getOrderFor("createdAt").getDirection());
    }
}
