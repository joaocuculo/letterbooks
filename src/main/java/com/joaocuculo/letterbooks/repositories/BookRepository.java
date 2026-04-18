package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.Book;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {
}
