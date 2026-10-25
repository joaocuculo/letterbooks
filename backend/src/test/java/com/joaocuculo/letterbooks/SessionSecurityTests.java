package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.config.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Optional;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SessionSecurityTests.Endpoints.class)
@Import({SecurityConfig.class, SecurityFilter.class, SessionSecurityTests.Endpoints.class})
class SessionSecurityTests {
    @Autowired MockMvc mvc;
    @MockitoBean TokenConfig tokens;
    @MockitoBean AuthorizationService authorization;

    @RestController
    static class Endpoints {
        @GetMapping("/session-test/private") String privatePage() { return "ok"; }
        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping("/session-test/admin") String admin() { return "ok"; }
        @GetMapping("/books/session-test") String publicPage() { return "ok"; }
    }
    @Test void missingCredentialReturns401() throws Exception {
        mvc.perform(get("/session-test/private")).andExpect(status().isUnauthorized())
                .andExpect(header().string("WWW-Authenticate", "Bearer"));
    }
    @Test void expiredCredentialReturns401() throws Exception {
        when(tokens.validateToken("expired")).thenReturn(Optional.empty());
        mvc.perform(get("/session-test/private").header("Authorization", "Bearer expired"))
                .andExpect(status().isUnauthorized());
    }
    @Test void authenticatedButForbiddenReturns403() throws Exception {
        mvc.perform(get("/session-test/admin").with(user("reader").roles("USER")))
                .andExpect(status().isForbidden());
    }
    @Test void publicPagesRemainAvailableWithExpiredCredential() throws Exception {
        when(tokens.validateToken("expired")).thenReturn(Optional.empty());
        mvc.perform(get("/books/session-test").header("Authorization", "Bearer expired"))
                .andExpect(status().isOk());
    }
}
