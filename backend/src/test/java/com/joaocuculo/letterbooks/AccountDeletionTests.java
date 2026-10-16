package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.dto.request.AccountDeletionRequestDTO;
import com.joaocuculo.letterbooks.dto.request.UserStatusUpdateDTO;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.entities.enums.*;
import com.joaocuculo.letterbooks.exceptions.*;
import com.joaocuculo.letterbooks.repositories.*;
import com.joaocuculo.letterbooks.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AccountDeletionTests {
    final UserRepository users = mock(UserRepository.class);
    final PasswordEncoder encoder = mock(PasswordEncoder.class);
    final BookshelfItemRepository items = mock(BookshelfItemRepository.class);
    final BookshelfRepository shelves = mock(BookshelfRepository.class);
    final RatingRepository ratings = mock(RatingRepository.class);
    final UserBookRepository books = mock(UserBookRepository.class);
    final PasswordResetRepository resets = mock(PasswordResetRepository.class);
    final UserService service = new UserService(users, encoder, items, shelves, ratings, books, resets);
    User owner;
    JWTUserData caller;

    @BeforeEach void setup() {
        owner = user(1L, UserRole.USER, UserStatus.ACTIVE);
        caller = new JWTUserData(1L, owner.getEmail(), UserRole.USER, 0);
        when(users.findById(1L)).thenReturn(Optional.of(owner));
        when(encoder.matches("old", "hash")).thenReturn(true);
    }

    @Test void missingAndWrongPasswordNeverDeleteAnything() {
        assertThrows(BusinessException.class, () -> service.delete(1L, null, caller));
        assertThrows(BusinessException.class, () -> service.delete(1L, new AccountDeletionRequestDTO(" "), caller));
        assertThrows(BusinessException.class, () -> service.delete(1L, new AccountDeletionRequestDTO("wrong"), caller));
        verifyNoInteractions(items, shelves, ratings, books, resets);
        verify(users, never()).delete(any());
    }

    @Test void acceptsExistingShortPasswordAndDeletesInForeignKeyOrder() {
        service.delete(1L, new AccountDeletionRequestDTO("old"), caller);
        var order = inOrder(items, shelves, ratings, books, resets, users);
        order.verify(items).deleteAllByUserId(1L);
        order.verify(shelves).deleteAllByUserId(1L);
        order.verify(ratings).deleteAllByUserId(1L);
        order.verify(books).deleteAllByUserId(1L);
        order.verify(resets).deleteAllByUserId(1L);
        order.verify(users).delete(owner);
        order.verify(users).flush();
    }

    @Test void ordinaryUserCannotDeleteSomeoneElse() {
        when(users.findById(2L)).thenReturn(Optional.of(user(2L, UserRole.USER, UserStatus.ACTIVE)));
        assertThrows(ForbiddenException.class, () -> service.delete(2L, null, caller));
        verifyNoInteractions(items);
    }

    @Test void persistedRoleOverridesStaleAdministrativeClaim() {
        when(users.findById(2L)).thenReturn(Optional.of(user(2L, UserRole.USER, UserStatus.ACTIVE)));
        var stale = new JWTUserData(1L, owner.getEmail(), UserRole.ADMIN, 0);
        assertThrows(ForbiddenException.class, () -> service.delete(2L, null, stale));
        assertThrows(ForbiddenException.class, () -> service.updateRoleAndStatus(2L, new UserStatusUpdateDTO(UserRole.ADMIN, UserStatus.ACTIVE), 1L));
    }

    @Test void lastActiveAdminCannotDeleteOwnAccount() {
        owner.setRole(UserRole.ADMIN);
        assertThrows(BusinessException.class, () -> service.delete(1L, new AccountDeletionRequestDTO("old"), caller));
        verify(users).countByRoleAndStatusAndIdNot(UserRole.ADMIN, UserStatus.ACTIVE, 1L);
        verifyNoInteractions(items);
    }

    @Test void anotherActiveAdminAllowsDeletion() {
        owner.setRole(UserRole.ADMIN);
        when(users.countByRoleAndStatusAndIdNot(UserRole.ADMIN, UserStatus.ACTIVE, 1L)).thenReturn(1L);
        service.delete(1L, new AccountDeletionRequestDTO("old"), caller);
        verify(users).delete(owner);
    }

    @Test void administrativeDeletionStillProtectsLastActiveAdmin() {
        owner.setRole(UserRole.ADMIN);
        var target = user(2L, UserRole.ADMIN, UserStatus.ACTIVE);
        when(users.findById(2L)).thenReturn(Optional.of(target));
        assertThrows(BusinessException.class, () -> service.delete(2L, null, caller));
        when(users.countByRoleAndStatusAndIdNot(UserRole.ADMIN, UserStatus.ACTIVE, 2L)).thenReturn(1L);
        service.delete(2L, null, caller);
        verify(users).delete(target);
        verifyNoInteractions(encoder);
    }

    @Test void permissionChangesProtectActiveAdministratorAndOwnAccount() {
        owner.setRole(UserRole.ADMIN);
        var target = user(2L, UserRole.ADMIN, UserStatus.ACTIVE);
        when(users.findById(2L)).thenReturn(Optional.of(target));
        assertThrows(BusinessException.class, () -> service.updateRoleAndStatus(2L, new UserStatusUpdateDTO(UserRole.ADMIN, UserStatus.INACTIVE), 1L));
        assertThrows(BusinessException.class, () -> service.updateRoleAndStatus(2L, new UserStatusUpdateDTO(UserRole.USER, UserStatus.ACTIVE), 1L));
        assertThrows(BusinessException.class, () -> service.updateRoleAndStatus(1L, new UserStatusUpdateDTO(UserRole.USER, UserStatus.ACTIVE), 1L));
        assertEquals(UserRole.ADMIN, target.getRole());
        assertEquals(UserStatus.ACTIVE, target.getStatus());
    }

    @Test void inactiveCallerAndMissingAccountAreRejected() {
        owner.setStatus(UserStatus.INACTIVE);
        assertThrows(ForbiddenException.class, () -> service.delete(1L, new AccountDeletionRequestDTO("old"), caller));
        when(users.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.delete(1L, null, caller));
    }

    @Test void httpEndpointRequiresPasswordAndValidatesRequest() throws Exception {
        mvc().perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/users/1"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isConflict());
        mvc().perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/users/1")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isBadRequest());
        verify(users, never()).delete(any());
        mvc().perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/users/1")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON).content("{\"currentPassword\":\"old\"}"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isNoContent());
    }

    @Test void concurrencyFailureReturnsSafeConflictMessage() throws Exception {
        when(users.findById(1L)).thenThrow(new org.springframework.dao.CannotSerializeTransactionException("private SQL details"));
        var response = mvc().perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/users/1")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON).content("{\"currentPassword\":\"old\"}"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isConflict())
                .andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        assertTrue(response.contains("Tente novamente"));
        assertFalse(response.contains("private SQL"));
    }

    private org.springframework.test.web.servlet.MockMvc mvc() {
        return org.springframework.test.web.servlet.setup.MockMvcBuilders
                .standaloneSetup(new com.joaocuculo.letterbooks.controllers.UserController(service))
                .setControllerAdvice(new com.joaocuculo.letterbooks.infra.RestExceptionHandler())
                .setCustomArgumentResolvers(new org.springframework.web.method.support.HandlerMethodArgumentResolver() {
                    public boolean supportsParameter(org.springframework.core.MethodParameter p) { return p.getParameterType() == JWTUserData.class; }
                    public Object resolveArgument(org.springframework.core.MethodParameter p,
                            org.springframework.web.method.support.ModelAndViewContainer c,
                            org.springframework.web.context.request.NativeWebRequest r,
                            org.springframework.web.bind.support.WebDataBinderFactory f) { return caller; }
                }).build();
    }

    private User user(Long id, UserRole role, UserStatus status) {
        var user = new User("Test", "test" + id + "@example.com", "hash", role, status);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }
}
