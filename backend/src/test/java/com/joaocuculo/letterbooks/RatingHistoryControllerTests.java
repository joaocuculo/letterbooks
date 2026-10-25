package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.config.*;
import com.joaocuculo.letterbooks.controllers.RatingController;
import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.services.RatingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RatingController.class)
@Import({SecurityConfig.class, SecurityFilter.class})
class RatingHistoryControllerTests {
    @Autowired MockMvc mvc;
    @MockitoBean RatingService ratings;
    @MockitoBean TokenConfig tokens;
    @MockitoBean AuthorizationService authorization;

    @Test void anonymousHistoryIsUnauthorized() throws Exception {
        mvc.perform(get("/ratings/user")).andExpect(status().isUnauthorized());
        verifyNoInteractions(ratings);
    }
    @Test void searchUsesPrincipalNotAUserIdFromTheRequest() throws Exception {
        when(ratings.findByUserId(eq(42L),eq("Livro"),any())).thenReturn(Page.empty());
        var principal = new JWTUserData(42L,"reader@example.test",UserRole.USER,0);
        var auth = new UsernamePasswordAuthenticationToken(principal,null,List.of(new SimpleGrantedAuthority("ROLE_USER")));
        mvc.perform(get("/ratings/user").param("q","Livro").param("userId","999").param("page","1").param("sort","score,desc")
                .with(authentication(auth))).andExpect(status().isOk());
        verify(ratings).findByUserId(eq(42L),eq("Livro"),argThat(p -> p.getPageNumber()==1 && p.getPageSize()==20 && p.getSort().getOrderFor("score").isDescending()));
    }
    @Test void requestWithoutSearchRemainsCompatible() throws Exception {
        when(ratings.findByUserId(eq(42L),isNull(),any())).thenReturn(Page.empty());
        var auth = new UsernamePasswordAuthenticationToken(new JWTUserData(42L,"reader@example.test",UserRole.USER,0),null,List.of(new SimpleGrantedAuthority("ROLE_USER")));
        mvc.perform(get("/ratings/user").with(authentication(auth))).andExpect(status().isOk());
        verify(ratings).findByUserId(eq(42L),isNull(),any());
    }
}
