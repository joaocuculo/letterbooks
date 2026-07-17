package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.response.BookshelfResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookshelfSummaryDTO;
import com.joaocuculo.letterbooks.entities.Bookshelf;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.mapper.BookshelfMapper;
import com.joaocuculo.letterbooks.repositories.BookshelfRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class BookshelfService {

    private final BookshelfRepository bookshelfRepository;
    private final UserService userService;

    public BookshelfService(BookshelfRepository bookshelfRepository, UserService userService) {
        this.bookshelfRepository = bookshelfRepository;
        this.userService = userService;
    }

    public BookshelfResponseDTO findById(Long id) {
        Bookshelf bookshelf = bookshelfRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estante não encontrada."));
        return BookshelfMapper.toResponseDTO(bookshelf);
    }

    public Page<BookshelfSummaryDTO> findByUserId(Long userId, Long authUserId, Pageable pageable) {
        userService.getByIdOrThrow(userId);
        Page<Bookshelf> bookshelves;
        if (userId.equals(authUserId)) {
            bookshelves = bookshelfRepository.findByUserId(userId, pageable);
        } else {
            bookshelves = bookshelfRepository.findByUserIdAndIsPublicShelfTrue(userId, pageable);
        }
        return bookshelves.map(BookshelfMapper::toSummaryDTO);
    }
}
