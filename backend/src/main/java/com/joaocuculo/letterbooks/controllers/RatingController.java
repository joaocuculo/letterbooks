package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.dto.request.RatingRequestDTO;
import com.joaocuculo.letterbooks.dto.request.RatingUpdateDTO;
import com.joaocuculo.letterbooks.dto.response.RatingResponseDTO;
import com.joaocuculo.letterbooks.services.RatingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping(value = "/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<RatingResponseDTO> findById(@PathVariable Long id) {
        RatingResponseDTO rating = ratingService.findById(id);
        return ResponseEntity.ok().body(rating);
    }

    @GetMapping(value = "/user")
    public ResponseEntity<Page<RatingResponseDTO>> findByUserId(
            @AuthenticationPrincipal JWTUserData user, @PageableDefault(size = 20) Pageable pageable) {
        Page<RatingResponseDTO> ratings = ratingService.findByUserId(user.userId(), pageable);
        return ResponseEntity.ok().body(ratings);
    }

    @GetMapping(value = "/book/google/{googleBooksId}")
    public ResponseEntity<Page<RatingResponseDTO>> findByGoogleBooksId(
            @PathVariable String googleBooksId, @PageableDefault(size = 20) Pageable pageable) {
        Page<RatingResponseDTO> ratings = ratingService.findByGoogleBooksId(googleBooksId, pageable);
        return ResponseEntity.ok().body(ratings);
    }

    @GetMapping(value = "/book/google/{googleBooksId}/me")
    public ResponseEntity<RatingResponseDTO> findByGoogleBooksIdAndUserId(
            @PathVariable String googleBooksId, @AuthenticationPrincipal JWTUserData user) {
        RatingResponseDTO rating = ratingService.findByGoogleBooksIdAndUserId(googleBooksId, user.userId());
        if (rating == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().body(rating);
    }

    @PostMapping
    public ResponseEntity<RatingResponseDTO> create(@AuthenticationPrincipal JWTUserData user, @RequestBody @Valid RatingRequestDTO request) {
        RatingResponseDTO rating = ratingService.create(user.userId(), request);
        URI uri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(rating.id())
                .toUri();
        return ResponseEntity.created(uri).body(rating);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal JWTUserData user) {
        ratingService.delete(id, user);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping(value = "/{id}")
    public ResponseEntity<RatingResponseDTO> update(
            @PathVariable Long id, @RequestBody @Valid RatingUpdateDTO request, @AuthenticationPrincipal JWTUserData user) {
        RatingResponseDTO rating = ratingService.update(id, request, user.userId());
        return ResponseEntity.ok().body(rating);
    }
}
