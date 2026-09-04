package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.request.UserBookRequestDTO;
import com.joaocuculo.letterbooks.dto.request.UserBookUpdateDTO;
import com.joaocuculo.letterbooks.dto.response.UserBookResponseDTO;
import com.joaocuculo.letterbooks.entities.Book;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.entities.UserBook;
import com.joaocuculo.letterbooks.entities.enums.UserBookStatus;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.DatabaseException;
import com.joaocuculo.letterbooks.exceptions.ForbiddenException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.mapper.UserBookMapper;
import com.joaocuculo.letterbooks.repositories.UserBookRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UserBookService {

    private final UserBookRepository userBookRepository;
    private final UserService userService;
    private final BookService bookService;

    public UserBookService(UserBookRepository userBookRepository, UserService userService, BookService bookService) {
        this.userBookRepository = userBookRepository;
        this.userService = userService;
        this.bookService = bookService;
    }

    public Page<UserBookResponseDTO> findByUserId(Long userId, UserBookStatus status, Boolean favorite, Pageable pageable) {
        userService.getByIdOrThrow(userId);
        Page<UserBook> userBooks;
        if (status != null && favorite != null) {
            userBooks = userBookRepository.findByUserIdAndStatusAndIsFavorite(userId, status, favorite, pageable);
        } else if (status != null) {
            userBooks = userBookRepository.findByUserIdAndStatus(userId, status, pageable);
        } else if (favorite != null) {
            userBooks = userBookRepository.findByUserIdAndIsFavorite(userId, favorite, pageable);
        } else {
            userBooks = userBookRepository.findByUserId(userId, pageable);
        }
        return userBooks.map(UserBookMapper::toResponseDTO);
    }

    public UserBookResponseDTO findByUserIdAndGoogleBooksId(Long userId, String googleBooksId) {
        return userBookRepository.findByUserIdAndBookGoogleBooksId(userId, googleBooksId)
                .map(UserBookMapper::toResponseDTO)
                .orElse(null);
    }

    public UserBookResponseDTO create(Long userId, UserBookRequestDTO dto) {
        User user = userService.getByIdOrThrow(userId);
        Book book = bookService.findOrCreateByGoogleBooksId(dto.googleBooksId());

        if (userBookRepository.existsByUserIdAndBookId(user.getId(), book.getId())) {
            throw new BusinessException("Você já possui relação com esse livro.");
        }

        validateCurrentPage(dto.currentPage(), book.getPageCount());

        UserBookStatus status = dto.status() != null ? dto.status() : UserBookStatus.WANT_TO_READ;
        UserBook userBook = userBookRepository.save(UserBookMapper.toEntity(dto, user, book, status));

        return UserBookMapper.toResponseDTO(userBook);
    }

    public void delete(Long id, Long userId) {
        UserBook userBook = userBookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Relação não encontrada."));

        if (!userBook.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Você não tem permissão para deletar essa relação.");
        }

        try {
            userBookRepository.delete(userBook);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException(e.getMessage());
        }
    }

    public UserBookResponseDTO update(Long id, UserBookUpdateDTO dto, Long userId) {
        UserBook userBook = userBookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Relação não encontrada."));

        if (!userBook.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Você não tem permissão para alterar essa relação.");
        }
        validateCurrentPage(dto.currentPage(), userBook.getBook().getPageCount());
        UserBookMapper.updateEntity(userBook, dto);
        return UserBookMapper.toResponseDTO(userBookRepository.save(userBook));
    }

    private void validateCurrentPage(Integer currentPage, Integer totalPages) {
        if (totalPages != null && currentPage != null && (currentPage < 0 || currentPage > totalPages)) {
            throw new BusinessException("A página atual não pode ser menor que zero ou maior que o número total de páginas do livro.");
        }
    }
}
