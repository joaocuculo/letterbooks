package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.dto.request.RatingRequestDTO;
import com.joaocuculo.letterbooks.dto.request.RatingUpdateDTO;
import com.joaocuculo.letterbooks.dto.response.RatingResponseDTO;
import com.joaocuculo.letterbooks.entities.Book;
import com.joaocuculo.letterbooks.entities.Rating;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.DatabaseException;
import com.joaocuculo.letterbooks.exceptions.ForbiddenException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.mapper.RatingMapper;
import com.joaocuculo.letterbooks.repositories.RatingRepository;
import org.springframework.dao.DataIntegrityViolationException;
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
        return RatingMapper.toResponseDTO(rating);
    }

    public Page<RatingResponseDTO> findByUserId(Long userId, Pageable pageable) {
        Page<Rating> ratings = ratingRepository.findByUserId(userId, pageable);
        return ratings.map(RatingMapper::toResponseDTO);
    }

    public Page<RatingResponseDTO> findByBookId(Long bookId, Pageable pageable) {
        Page<Rating> ratings = ratingRepository.findByBookId(bookId, pageable);
        return ratings.map(RatingMapper::toResponseDTO);
    }

    public RatingResponseDTO create(Long userId, RatingRequestDTO dto) {
        User user = userService.getByIdOrThrow(userId);
        Book book = bookService.findOrCreateByGoogleBooksId(dto.googleBooksId());

        if (ratingRepository.existsByUserIdAndBookId(user.getId(), book.getId())) {
            throw new BusinessException("Você já avaliou esse livro.");
        }

        Rating rating = ratingRepository.save(new Rating(dto.score(), dto.comment(), user, book));

        return RatingMapper.toResponseDTO(rating);
    }

    public void delete(Long id, JWTUserData user) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada."));

        if (!rating.getUser().getId().equals(user.userId()) && user.role() != UserRole.ADMIN) {
            throw new ForbiddenException("Você não tem permissão para deletar essa avaliação.");
        }

        try {
            ratingRepository.delete(rating);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException(e.getMessage());
        }
    }

    public RatingResponseDTO update(Long id, RatingUpdateDTO dto, Long userId) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada."));

        if (!rating.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Você não tem permissão para alterar essa avaliação.");
        }

        RatingMapper.updateEntity(rating, dto);
        return RatingMapper.toResponseDTO(ratingRepository.save(rating));
    }
}
