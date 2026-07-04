package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.dto.request.RatingRequestDTO;
import com.joaocuculo.letterbooks.dto.response.RatingResponseDTO;
import com.joaocuculo.letterbooks.services.RatingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<RatingResponseDTO> create(@RequestBody @Valid RatingRequestDTO request) {
        RatingResponseDTO rating = ratingService.create(request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(rating.id()).toUri();
        return ResponseEntity.created(uri).body(rating);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ratingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
