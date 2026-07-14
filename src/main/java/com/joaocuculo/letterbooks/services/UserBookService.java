package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.request.UserBookRequestDTO;
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

    public Page<UserBookResponseDTO> findByUserId(Long id, UserBookStatus status, Pageable pageable) {
        Page<UserBook> userBooks;
        if (status == null) {
            userBooks = userBookRepository.findByUserId(id, pageable);
        } else {
            userBooks = userBookRepository.findByUserIdAndStatus(id, status, pageable);
        }
        return userBooks.map(UserBookMapper::toResponseDTO);
    }

    public UserBookResponseDTO create(Long userId, UserBookRequestDTO dto) {
        User user = userService.getByIdOrThrow(userId);
        Book book = bookService.findOrCreateByGoogleBooksId(dto.googleBooksId());

        if (userBookRepository.existsByUserIdAndBookId(user.getId(), book.getId())) {
            throw new BusinessException("Você já possui relação com esse livro.");
        }

        UserBook userBook = userBookRepository.save(
                new UserBook(
                        dto.status(),
                        dto.isFavorite(),
                        dto.currentPage(),
                        dto.startedAt(),
                        dto.finishedAt(),
                        user,
                        book
                ));

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
}
