package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.controllers.UserController;
import com.joaocuculo.letterbooks.dto.request.UserProfileUpdateDTO;
import com.joaocuculo.letterbooks.dto.request.UserRequestDTO;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.entities.enums.UserStatus;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.ForbiddenException;
import com.joaocuculo.letterbooks.infra.RestExceptionHandler;
import com.joaocuculo.letterbooks.repositories.UserRepository;
import com.joaocuculo.letterbooks.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserProfileUpdateTests {
    private UserRepository repository;
    private PasswordEncoder encoder;
    private UserService service;
    private User user;
    private JWTUserData caller;

    @BeforeEach
    void configureService() {
        repository = mock(UserRepository.class);
        encoder = mock(PasswordEncoder.class);
        service = new UserService(repository, encoder);
        user = existingUser(1L, "original@example.com", "user-hash", UserRole.USER);
        caller = new JWTUserData(1L, user.getEmail(), UserRole.USER, 0);
        when(repository.findById(1L)).thenReturn(Optional.of(user));
    }

    static Stream<Arguments> missingPasswords() {
        return Stream.of(true, false).flatMap(legacy -> Stream.of(null, "", "   ").map(password -> Arguments.of(legacy, password)));
    }

    @ParameterizedTest
    @MethodSource("missingPasswords")
    void changingEmailRequiresCurrentPasswordOnBothRoutes(boolean legacy, String password) {
        var error = assertThrows(BusinessException.class, () -> update(legacy, "New name", "new@example.com", password));
        assertEquals("Informe sua senha atual para alterar o e-mail.", error.getMessage());
        assertUnchanged();
        verifyNoInteractions(encoder);
        verify(repository, never()).existsByEmail(any());
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    void rejectsIncorrectPasswordBeforeChangingData(boolean legacy) {
        var error = assertThrows(BusinessException.class, () -> update(legacy, "New name", "new@example.com", "Wrong1!"));
        assertEquals("Senha atual incorreta.", error.getMessage());
        verify(encoder).matches("Wrong1!", "user-hash");
        verify(repository, never()).existsByEmail(any());
        assertUnchanged();
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    void rejectsDuplicateEmailAfterConfirmingPassword(boolean legacy) {
        when(encoder.matches("Current1!", "user-hash")).thenReturn(true);
        when(repository.existsByEmail("new@example.com")).thenReturn(true);
        assertThrows(BusinessException.class, () -> update(legacy, "New name", "new@example.com", "Current1!"));
        assertUnchanged();
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    void confirmsCurrentPasswordAndPreservesStoredPassword(boolean legacy) {
        when(encoder.matches("Current1!", "user-hash")).thenReturn(true);
        update(legacy, "  New name  ", "  new@example.com  ", "Current1!");
        assertEquals("New name", user.getName());
        assertEquals("new@example.com", user.getEmail());
        assertEquals("user-hash", user.getPassword());
        verify(repository).existsByEmail("new@example.com");
        verify(repository).save(user);
        verify(encoder, never()).encode(any());
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    void nameOnlyUpdateDoesNotRequirePassword(boolean legacy) {
        update(legacy, "New name", user.getEmail(), null);
        assertEquals("New name", user.getName());
        verifyNoInteractions(encoder);
        verify(repository, never()).existsByEmail(any());
        verify(repository).save(user);
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    void surroundingEmailWhitespaceDoesNotTriggerPasswordConfirmation(boolean legacy) {
        update(legacy, "New name", "  original@example.com  ", null);
        assertEquals("original@example.com", user.getEmail());
        verifyNoInteractions(encoder);
        verify(repository, never()).existsByEmail(any());
    }

    @Test
    void anotherRegularUserCannotUpdateProfile() {
        caller = new JWTUserData(2L, "other@example.com", UserRole.USER, 0);
        assertThrows(ForbiddenException.class, () -> update(true, "New name", "new@example.com", "Current1!"));
        assertUnchanged();
        verifyNoInteractions(encoder);
    }

    @Test
    void administratorUpdatingOwnEmailHasNoPasswordBypass() {
        caller = new JWTUserData(1L, user.getEmail(), UserRole.ADMIN, 0);
        assertThrows(BusinessException.class, () -> update(true, "New name", "new@example.com", null));
        assertUnchanged();
    }

    @Test
    void administratorConfirmsOwnPasswordToChangeAnotherUsersEmail() {
        configureAdministrator();
        when(encoder.matches("Admin1!", "admin-hash")).thenReturn(true);
        update(true, "New name", "new@example.com", "Admin1!");
        verify(encoder).matches("Admin1!", "admin-hash");
        verify(encoder, never()).matches(any(), eq("user-hash"));
        assertEquals("new@example.com", user.getEmail());
        verify(repository).save(user);
    }

    @Test
    void targetUsersPasswordCannotReplaceAdministratorConfirmation() {
        configureAdministrator();
        when(encoder.matches("Target1!", "user-hash")).thenReturn(true);
        assertThrows(BusinessException.class, () -> update(true, "New name", "new@example.com", "Target1!"));
        verify(encoder).matches("Target1!", "admin-hash");
        assertUnchanged();
    }

    @Test
    void administratorMayRenameAnotherUserWithoutPasswordWhenEmailIsUnchanged() {
        configureAdministrator();
        update(true, "New name", user.getEmail(), null);
        verify(repository, never()).findById(2L);
        verifyNoInteractions(encoder);
        verify(repository).save(user);
    }

    @Test
    void legacyHttpEndpointRejectsArbitraryPassword() throws Exception {
        var response = mvc().perform(put("/users/1").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"New name\",\"email\":\"new@example.com\",\"password\":\"Wrong1!\"}"))
                .andExpect(status().isConflict()).andReturn().getResponse();
        assertTrue(response.getContentAsString(StandardCharsets.UTF_8).contains("Senha atual incorreta."));
        assertUnchanged();
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    void bothHttpEndpointsRejectChangedEmailWithoutPassword(boolean legacy) throws Exception {
        var request = legacy ? put("/users/1") : patch("/users/me");
        var response = mvc().perform(request.contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"New name\",\"email\":\"new@example.com\"}"))
                .andExpect(status().isConflict()).andReturn().getResponse();
        assertTrue(response.getContentAsString(StandardCharsets.UTF_8).contains("Informe sua senha atual"));
        assertUnchanged();
    }

    @Test
    void legacyHttpEndpointAcceptsNameOnlyUpdateWithoutPassword() throws Exception {
        mvc().perform(put("/users/1").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"New name\",\"email\":\"original@example.com\"}"))
                .andExpect(status().isOk());
        assertEquals("New name", user.getName());
        verifyNoInteractions(encoder);
    }

    private void update(boolean legacy, String name, String email, String password) {
        if (legacy) service.update(1L, new UserRequestDTO(name, email, password), caller);
        else service.updateProfile(1L, new UserProfileUpdateDTO(name, email, password));
    }

    private void assertUnchanged() {
        assertEquals("Original name", user.getName());
        assertEquals("original@example.com", user.getEmail());
        assertEquals("user-hash", user.getPassword());
        verify(repository, never()).save(any());
    }

    private void configureAdministrator() {
        caller = new JWTUserData(2L, "admin@example.com", UserRole.ADMIN, 0);
        when(repository.findById(2L)).thenReturn(Optional.of(existingUser(2L, caller.email(), "admin-hash", UserRole.ADMIN)));
    }

    private MockMvc mvc() {
        return MockMvcBuilders.standaloneSetup(new UserController(service))
                .setControllerAdvice(new RestExceptionHandler())
                .setCustomArgumentResolvers(new HandlerMethodArgumentResolver() {
                    public boolean supportsParameter(MethodParameter parameter) { return parameter.getParameterType() == JWTUserData.class; }
                    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer container, NativeWebRequest request, WebDataBinderFactory factory) { return caller; }
                }).build();
    }

    private User existingUser(Long id, String email, String password, UserRole role) {
        User existing = new User("Original name", email, password, role, UserStatus.ACTIVE);
        ReflectionTestUtils.setField(existing, "id", id);
        return existing;
    }
}
