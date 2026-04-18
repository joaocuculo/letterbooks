package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.Bookshelf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookshelfRepository extends JpaRepository<Bookshelf, Long> {
}
