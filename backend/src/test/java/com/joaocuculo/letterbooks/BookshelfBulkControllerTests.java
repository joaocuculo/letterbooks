package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.controllers.BookshelfController;
import com.joaocuculo.letterbooks.dto.request.BookshelfBulkRequestDTO;
import com.joaocuculo.letterbooks.dto.response.*;
import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.exceptions.ForbiddenException;
import com.joaocuculo.letterbooks.infra.RestExceptionHandler;
import com.joaocuculo.letterbooks.services.BookshelfBulkService;
import org.junit.jupiter.api.*;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.List;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class BookshelfBulkControllerTests {
    BookshelfBulkService bulk;
    MockMvc mvc;
    @BeforeEach void setup() {
        bulk=mock(BookshelfBulkService.class);
        mvc=MockMvcBuilders.standaloneSetup(new BookshelfController(null,null,bulk))
                .setControllerAdvice(new RestExceptionHandler())
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver()).build();
        var user=new JWTUserData(42L,"bulk@example.test",UserRole.USER,0);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(user,null,List.of()));
    }
    @AfterEach void clear() { SecurityContextHolder.clearContext(); }
    @Test void exposesSummaryAndWriteContractsForAuthenticatedOwner() throws Exception {
        var request=new BookshelfBulkRequestDTO(List.of("a","b"),List.of(1L));
        when(bulk.summary(request,42L)).thenReturn(new BookshelfBulkSummaryDTO(2,List.of(new BookshelfBulkSummaryDTO.Shelf(1L,1))));
        when(bulk.add(request,42L)).thenReturn(new BookshelfBulkResultDTO(2,List.of(new BookshelfBulkResultDTO.Shelf(1L,1,1))));
        String json="{\"googleBooksIds\":[\"a\",\"b\"],\"bookshelfIds\":[1]}";
        mvc.perform(post("/bookshelves/books/membership-summary").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isOk()).andExpect(jsonPath("$.booksCount").value(2))
                .andExpect(jsonPath("$.shelves[0].existingCount").value(1));
        mvc.perform(post("/bookshelves/books/batch").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isOk()).andExpect(jsonPath("$.shelves[0].addedCount").value(1))
                .andExpect(jsonPath("$.shelves[0].alreadyPresentCount").value(1));
        verify(bulk).summary(request,42L);verify(bulk).add(request,42L);
    }
    @Test void rejectsInvalidRequestBeforeServiceAndUsesExistingForbiddenResponse() throws Exception {
        mvc.perform(post("/bookshelves/books/batch").contentType(MediaType.APPLICATION_JSON)
                .content("{\"googleBooksIds\":[],\"bookshelfIds\":[-1]}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(bulk);
        when(bulk.add(any(),eq(42L))).thenThrow(new ForbiddenException("Destino não autorizado."));
        mvc.perform(post("/bookshelves/books/batch").contentType(MediaType.APPLICATION_JSON)
                .content("{\"googleBooksIds\":[\"a\"],\"bookshelfIds\":[1]}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.message").value("Destino não autorizado."));
    }
}
