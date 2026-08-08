package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.dto.request.UserRequestDTO;
import com.joaocuculo.letterbooks.dto.request.UserStatusUpdateDTO;
import com.joaocuculo.letterbooks.dto.response.UserResponseDTO;
import com.joaocuculo.letterbooks.services.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponseDTO>> findAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<UserResponseDTO> page = service.findAll(pageable);
        return ResponseEntity.ok().body(page);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<UserResponseDTO> findById(@PathVariable Long id) {
        UserResponseDTO user = service.findById(id);
        return ResponseEntity.ok().body(user);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<UserResponseDTO> update(
            @PathVariable Long id, @RequestBody @Valid UserRequestDTO request, @AuthenticationPrincipal JWTUserData authUser) {
        UserResponseDTO user = service.update(id, request, authUser);
        return ResponseEntity.ok().body(user);
    }

    @PutMapping(value = "/{id}/role-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> updateRoleAndStatus(
            @PathVariable Long id, @RequestBody @Valid UserStatusUpdateDTO request, @AuthenticationPrincipal JWTUserData authUser) {
        UserResponseDTO user = service.updateRoleAndStatus(id, request, authUser.userId());
        return ResponseEntity.ok().body(user);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id, @AuthenticationPrincipal JWTUserData authUser) {
        service.delete(id, authUser);
        return ResponseEntity.noContent().build();
    }
}
