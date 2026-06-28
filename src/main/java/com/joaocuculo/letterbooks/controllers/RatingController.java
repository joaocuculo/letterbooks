package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.dto.response.RatingResponseDTO;
import com.joaocuculo.letterbooks.services.RatingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @GetMapping(value = "/user/{userId}")
    public ResponseEntity<Page<RatingResponseDTO>> findByUserId(
            @PathVariable Long userId, @PageableDefault(size = 20) Pageable pageable) {
        Page<RatingResponseDTO> ratings = ratingService.findByUserId(userId, pageable);
        return ResponseEntity.ok().body(ratings);
    }

    @GetMapping(value = "/book/{bookId}")
    public ResponseEntity<Page<RatingResponseDTO>> findByBookId(
            @PathVariable Long bookId, @PageableDefault(size = 20) Pageable pageable) {
        Page<RatingResponseDTO> ratings = ratingService.findByBookId(bookId, pageable);
        return ResponseEntity.ok().body(ratings);
    }
}
