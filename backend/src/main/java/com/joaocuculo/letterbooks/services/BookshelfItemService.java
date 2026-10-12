package com.joaocuculo.letterbooks.services;

import org.springframework.transaction.annotation.Transactional;
import com.joaocuculo.letterbooks.dto.request.BookshelfItemRequestDTO;
import com.joaocuculo.letterbooks.entities.Book;
import com.joaocuculo.letterbooks.entities.Bookshelf;
import com.joaocuculo.letterbooks.entities.BookshelfItem;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.DatabaseException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.repositories.BookshelfItemRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class BookshelfItemService {

    private final BookshelfItemRepository bookshelfItemRepository;
    private final BookshelfService bookshelfService;
    private final BookService bookService;
    private final UserBookService userBookService;

    public BookshelfItemService(BookshelfItemRepository bookshelfItemRepository, BookshelfService bookshelfService, BookService bookService, UserBookService userBookService) {
        this.bookshelfItemRepository = bookshelfItemRepository;
        this.bookshelfService = bookshelfService;
        this.bookService = bookService;
        this.userBookService = userBookService;
    }

    @Transactional
    public void add(Long bookshelfId, BookshelfItemRequestDTO dto, Long userId) {
        Bookshelf bookshelf = bookshelfService.getOwnedBookshelf(bookshelfId, userId);
        Book book = bookService.findOrCreateByGoogleBooksId(dto.googleBooksId());
        if (bookshelfItemRepository.existsByIdBookshelfIdAndIdBookId(bookshelfId, book.getId())) {
            throw new BusinessException("Este livro já está nesta estante.");
        }
        userBookService.ensureInLibrary(userId, book);
        bookshelfItemRepository.save(new BookshelfItem(bookshelf, book));
    }

    public void remove(Long bookshelfId, Long bookId, Long userId) {
        bookshelfService.getOwnedBookshelf(bookshelfId, userId);
        BookshelfItem item = bookshelfItemRepository.findByIdBookshelfIdAndIdBookId(bookshelfId, bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Item não encontrado nesta estante."));
        try {
            bookshelfItemRepository.delete(item);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException(e.getMessage());
        }
    }
}
