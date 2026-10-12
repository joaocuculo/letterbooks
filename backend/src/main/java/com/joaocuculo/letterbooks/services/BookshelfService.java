package com.joaocuculo.letterbooks.services;

import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import com.joaocuculo.letterbooks.repositories.UserBookRepository;
import com.joaocuculo.letterbooks.repositories.BookshelfItemRepository;
import com.joaocuculo.letterbooks.mapper.UserBookMapper;
import com.joaocuculo.letterbooks.mapper.BookMapper;
import com.joaocuculo.letterbooks.dto.response.UserBookResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookshelfBookDTO;
import com.joaocuculo.letterbooks.dto.response.BookSummaryDTO;
import com.joaocuculo.letterbooks.dto.request.BookshelfRequestDTO;
import com.joaocuculo.letterbooks.dto.request.BookshelfUpdateDTO;
import com.joaocuculo.letterbooks.dto.response.BookshelfResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookshelfMembershipDTO;
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
    private final BookshelfItemRepository itemRepository;
    private final UserBookRepository userBookRepository;

    public BookshelfService(BookshelfRepository bookshelfRepository, UserService userService,
            BookshelfItemRepository itemRepository,
            UserBookRepository userBookRepository) {
        this.bookshelfRepository = bookshelfRepository;
        this.userService = userService;
        this.itemRepository = itemRepository;
        this.userBookRepository = userBookRepository;
    }

    public List<BookshelfMembershipDTO> findMineByGoogleBooksId(Long userId, String googleBooksId) {
        return bookshelfRepository.findMembershipsByUserIdAndGoogleBooksId(userId, googleBooksId);
    }

    public BookshelfResponseDTO findById(Long id, Long userId) {
        Bookshelf bookshelf = getByIdOrThrow(id);
        if (!bookshelf.getUser().getId().equals(userId) && !bookshelf.isPublicShelf()) {
            throw new ForbiddenException("Você não tem permissão para visualizar essa estante.");
        }
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
        var summaries = summarize(bookshelves.getContent());
        return bookshelves.map(shelf -> summaries.get(shelf.getId()));
    }

    @Transactional(readOnly = true)
    public BookshelfSummaryDTO findSummary(Long id, Long userId) {
        var shelf = getAccessibleBookshelf(id, userId);
        return summarize(List.of(shelf)).get(id);
    }

    @Transactional(readOnly = true)
    public Page<BookshelfBookDTO> findBooks(Long id, Long userId, Pageable pageable) {
        getAccessibleBookshelf(id, userId);
        var items = itemRepository.findBooks(id, pageable);
        var ids = items.stream().map(i -> i.getBook().getGoogleBooksId()).toList();
        var relations = new HashMap<String, UserBookResponseDTO>();
        if (!ids.isEmpty()) userBookRepository.findByUserIdAndBookGoogleBooksIdIn(userId, ids)
            .forEach(ub -> relations.put(ub.getBook().getGoogleBooksId(), UserBookMapper.toResponseDTO(ub)));
        return items.map(i -> new BookshelfBookDTO(
            BookMapper.toSummaryDTO(i.getBook()), relations.get(i.getBook().getGoogleBooksId())));
    }

    private Map<Long, BookshelfSummaryDTO> summarize(List<Bookshelf> shelves) {
        var result = new HashMap<Long, BookshelfSummaryDTO>();
        if (shelves.isEmpty()) return result;
        var ids = shelves.stream().map(Bookshelf::getId).toList();
        var counts = new HashMap<Long, Integer>();
        itemRepository.countByShelves(ids).forEach(c -> counts.put(c.getShelfId(), c.getBooksCount().intValue()));
        var previews = new HashMap<Long, List<BookSummaryDTO>>();
        itemRepository.findPreviews(ids).forEach(i -> previews.computeIfAbsent(i.getBookshelf().getId(), ignored -> new ArrayList<>())
            .add(BookMapper.toSummaryDTO(i.getBook())));
        shelves.forEach(s -> result.put(s.getId(), new BookshelfSummaryDTO(s.getId(), s.getName(), s.getDescription(), s.isPublicShelf(),
            counts.getOrDefault(s.getId(), 0), s.getCreatedAt(), s.getUpdatedAt(), previews.getOrDefault(s.getId(), List.of()))));
        return result;
    }

    private Bookshelf getAccessibleBookshelf(Long id, Long userId) {
        var shelf = getByIdOrThrow(id);
        if (!shelf.getUser().getId().equals(userId) && !shelf.isPublicShelf())
            throw new ForbiddenException("Você não tem permissão para visualizar essa estante.");
        return shelf;
    }

    public List<BookshelfResponseDTO> findByUserIdAndBookId(Long userId, Long bookId) {
        List<Bookshelf> bookshelves = bookshelfRepository.findByUserIdAndItemsIdBookId(userId, bookId);
        return bookshelves.stream()
                .map(BookshelfMapper::toResponseDTO)
                .toList();
    }

    public BookshelfResponseDTO create(Long userId, BookshelfRequestDTO dto) {
        User user = userService.getByIdOrThrow(userId);
        if (bookshelfRepository.existsByUserIdAndName(userId, dto.name())) {
            throw new BusinessException("Você já possui uma estante com esse nome.");
        }
        Bookshelf bookshelf = bookshelfRepository.save(BookshelfMapper.toEntity(dto, user));
        return BookshelfMapper.toResponseDTO(bookshelf);
    }

    public void delete(Long id, Long userId) {
        Bookshelf bookshelf = getOwnedBookshelf(id, userId);
        try {
            bookshelfRepository.delete(bookshelf);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException(e.getMessage());
        }
    }

    public BookshelfResponseDTO update(Long id, BookshelfUpdateDTO dto, Long userId) {
        Bookshelf bookshelf = getOwnedBookshelf(id, userId);
        if (dto.name() != null
                && bookshelfRepository.existsByUserIdAndName(userId, dto.name())
                && !bookshelf.getName().equals(dto.name())) {
            throw new BusinessException("Você já possui uma estante com esse nome.");
        }
        BookshelfMapper.updateEntity(bookshelf, dto);
        return BookshelfMapper.toResponseDTO(bookshelfRepository.save(bookshelf));
    }

    public Bookshelf getOwnedBookshelf(Long id, Long userId) {
        Bookshelf bookshelf = getByIdOrThrow(id);
        if (!bookshelf.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Você não tem permissão para acessar esta estante.");
        }
        return bookshelf;
    }

    public Bookshelf getByIdOrThrow(Long id) {
        return bookshelfRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estante não encontrada."));
    }
}
