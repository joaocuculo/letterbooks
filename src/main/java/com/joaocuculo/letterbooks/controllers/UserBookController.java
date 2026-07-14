package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.dto.request.UserBookRequestDTO;
import com.joaocuculo.letterbooks.dto.response.UserBookResponseDTO;
import com.joaocuculo.letterbooks.entities.enums.UserBookStatus;
import com.joaocuculo.letterbooks.services.UserBookService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/user-books")
public class UserBookController {

    private final UserBookService userBookService;

    public UserBookController(UserBookService userBookService) {
        this.userBookService = userBookService;
    }

    @GetMapping(value = "/user/{userId}")
    public ResponseEntity<Page<UserBookResponseDTO>> findByUserId(
            @PathVariable Long id,
            UserBookStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<UserBookResponseDTO> userBooks = userBookService.findByUserId(id, status, pageable);
        return ResponseEntity.ok().body(userBooks);
    }

    @PostMapping
    public ResponseEntity<UserBookResponseDTO> create(@AuthenticationPrincipal JWTUserData user, @RequestBody @Valid UserBookRequestDTO request) {
        UserBookResponseDTO userBook = userBookService.create(user.userId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(userBook);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal JWTUserData user) {
        userBookService.delete(id, user.userId());
        return ResponseEntity.noContent().build();
    }

    //update
}
