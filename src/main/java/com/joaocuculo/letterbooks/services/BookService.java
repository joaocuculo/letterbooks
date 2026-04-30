package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.repositories.BookRepository;
import org.springframework.stereotype.Service;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

}
