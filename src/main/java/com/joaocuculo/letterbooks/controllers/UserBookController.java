package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.dto.response.UserBookResponseDTO;
import com.joaocuculo.letterbooks.entities.enums.UserBookStatus;
import com.joaocuculo.letterbooks.services.UserBookService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    //create
    //delete
    //update
}
