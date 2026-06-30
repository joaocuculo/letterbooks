package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.request.RatingRequestDTO;
import com.joaocuculo.letterbooks.dto.response.RatingResponseDTO;
import com.joaocuculo.letterbooks.entities.Book;
import com.joaocuculo.letterbooks.entities.Rating;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.mapper.BookMapper;
import com.joaocuculo.letterbooks.mapper.RatingMapper;
import com.joaocuculo.letterbooks.repositories.RatingRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserService userService;
    private final BookService bookService;

    public RatingService(RatingRepository ratingRepository, UserService userService, BookService bookService) {
        this.ratingRepository = ratingRepository;
        this.userService = userService;
        this.bookService = bookService;
    }

    public RatingResponseDTO findById(Long id) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada."));
        return RatingMapper.fromEntity(rating);
    }

    public Page<RatingResponseDTO> findByUserId(Long userId, Pageable pageable) {
        Page<Rating> ratings = ratingRepository.findByUserId(userId, pageable);
        return ratings.map(RatingMapper::fromEntity);
    }

    public Page<RatingResponseDTO> findByBookId(Long bookId, Pageable pageable) {
        Page<Rating> ratings = ratingRepository.findByBookId(bookId, pageable);
        return ratings.map(RatingMapper::fromEntity);
    }

    public RatingResponseDTO create(RatingRequestDTO dto) {
        User user = userService.getByIdOrThrow(dto.userId());
        Book book = bookService.findOrCreateByGoogleBooksId(dto.googleBooksId());

        if (ratingRepository.existsByUserIdAndBookId(user.getId(), book.getId()).isPresent()) {
            throw new BusinessException("O usuário já avaliou esse livro.");
        }

        Rating rating = ratingRepository.save(new Rating(dto.score(), dto.comment(), user, book));

        return RatingMapper.fromEntity(rating);
    }
}
