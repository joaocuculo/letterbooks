package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.request.BookshelfRequestDTO;
import com.joaocuculo.letterbooks.dto.request.BookshelfUpdateDTO;
import com.joaocuculo.letterbooks.dto.response.BookshelfResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookshelfSummaryDTO;
import com.joaocuculo.letterbooks.entities.Bookshelf;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.DatabaseException;
import com.joaocuculo.letterbooks.exceptions.ForbiddenException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.mapper.BookshelfMapper;
import com.joaocuculo.letterbooks.repositories.BookshelfRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookshelfService {

    private final BookshelfRepository bookshelfRepository;
    private final UserService userService;

    public BookshelfService(BookshelfRepository bookshelfRepository, UserService userService) {
        this.bookshelfRepository = bookshelfRepository;
        this.userService = userService;
    }

    public BookshelfResponseDTO findById(Long id, Long userId) {
        Bookshelf bookshelf = getByIdOrThrow(id);
        if (!bookshelf.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Você não tem permissão para visualizar essa estante.");
        }
        return BookshelfMapper.toResponseDTO(bookshelf);
    }

    public Bookshelf getByIdOrThrow(Long id) {
        return bookshelfRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estante não encontrada."));
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

    public List<BookshelfResponseDTO> findByUserIdAndBookId(Long userId, Long bookId) {
        List<Bookshelf> bookshelves = bookshelfRepository.findByUserIdAndItemsIdBookId(userId, bookId);
        return bookshelves.stream()
                .map(BookshelfMapper::toResponseDTO)
                .toList();
    }

    public BookshelfResponseDTO create(Long userId, BookshelfRequestDTO dto) {
        User user = userService.getByIdOrThrow(userId);
        if (bookshelfRepository.existsByUserIdAndName(userId, dto.name())){
            throw new BusinessException("Você já possui uma estante com esse nome.");
        }
        Bookshelf bookshelf = bookshelfRepository.save(BookshelfMapper.toEntity(dto, user));
        return BookshelfMapper.toResponseDTO(bookshelf);
    }

    public void delete(Long id, Long userId) {
        Bookshelf bookshelf = bookshelfRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estante não encontrada."));
        if (!bookshelf.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Você não tem permissão para deletar essa estante.");
        }
        try {
            bookshelfRepository.delete(bookshelf);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException(e.getMessage());
        }
    }

    public BookshelfResponseDTO update(Long id, BookshelfUpdateDTO dto, Long userId) {
        Bookshelf bookshelf = bookshelfRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estante não encontrada."));
        if (!bookshelf.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Você não tem permissão para alterar essa estante");
        }
        if (dto.name() != null
                && bookshelfRepository.existsByUserIdAndName(userId, dto.name())
                && !bookshelf.getName().equals(dto.name())){
            throw new BusinessException("Você já possui uma estante com esse nome.");
        }
        BookshelfMapper.updateEntity(bookshelf, dto);
        return BookshelfMapper.toResponseDTO(bookshelfRepository.save(bookshelf));
    }
}
