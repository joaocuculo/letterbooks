package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.Bookshelf;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookshelfRepository extends JpaRepository<Bookshelf, Long> {
}
