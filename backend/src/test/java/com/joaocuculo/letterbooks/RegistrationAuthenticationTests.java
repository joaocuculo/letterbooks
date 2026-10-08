package com.joaocuculo.letterbooks;

import com.auth0.jwt.JWT;
import com.joaocuculo.letterbooks.config.TokenConfig;
import com.joaocuculo.letterbooks.controllers.AuthController;
import com.joaocuculo.letterbooks.dto.request.RegisterRequestDTO;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.entities.enums.UserStatus;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.services.PasswordResetService;
import com.joaocuculo.letterbooks.services.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RegistrationAuthenticationTests {
    @AfterEach
    void clearRequestContext() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void returnsCreatedUserAndValidJwtWithoutLoggingInAgain() {
        var service = mock(UserService.class);
        var authenticationManager = mock(AuthenticationManager.class);
        var tokens = new TokenConfig();
        ReflectionTestUtils.setField(tokens, "secret", "registration-test-secret-not-for-production");
        var controller = new AuthController(service, authenticationManager, tokens, mock(PasswordResetService.class));
        var request = new RegisterRequestDTO("Leitor", "leitor@example.com", "Leitura1!", "Leitura1!");
        var user = new User(request.name(), request.email(), "encoded-password", UserRole.USER, UserStatus.ACTIVE);
        ReflectionTestUtils.setField(user, "id", 42L);
        when(service.register(request)).thenReturn(user);
        var httpRequest = new MockHttpServletRequest("POST", "/auth/register");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(httpRequest));

        var response = controller.register(request);
        var body = response.getBody();

        assertEquals(201, response.getStatusCode().value());
        assertNotNull(body);
        assertEquals(42L, body.id());
        assertEquals(user.getName(), body.name());
        assertEquals(user.getEmail(), body.email());
        assertTrue(response.getHeaders().getLocation().getPath().endsWith("/auth/register/42"));
        var authenticated = tokens.validateToken(body.token()).orElseThrow();
        assertEquals(42L, authenticated.userId());
        assertEquals(UserRole.USER, authenticated.role());
        assertEquals(user.getTokenVersion(), authenticated.tokenVersion());
        var decoded = JWT.decode(body.token());
        assertEquals(user.getEmail(), decoded.getClaim("userEmail").asString());
        assertEquals("letterbooks", decoded.getIssuer());
        assertTrue(decoded.getExpiresAtAsInstant().isAfter(Instant.now().plusSeconds(7100)));
        assertTrue(decoded.getExpiresAtAsInstant().isBefore(Instant.now().plusSeconds(7300)));
        verifyNoInteractions(authenticationManager);
    }

    @Test
    void failedRegistrationDoesNotIssueToken() {
        var service = mock(UserService.class);
        var tokens = mock(TokenConfig.class);
        var authenticationManager = mock(AuthenticationManager.class);
        var controller = new AuthController(service, authenticationManager, tokens, mock(PasswordResetService.class));
        var request = new RegisterRequestDTO("Leitor", "leitor@example.com", "Leitura1!", "Leitura1!");
        when(service.register(request)).thenThrow(new BusinessException("Este e-mail já está cadastrado."));

        assertThrows(BusinessException.class, () -> controller.register(request));

        verifyNoInteractions(tokens, authenticationManager);
    }
}
