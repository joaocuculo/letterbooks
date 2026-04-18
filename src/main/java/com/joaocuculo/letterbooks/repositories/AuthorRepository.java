package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.Author;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorRepository extends JpaRepository<Author, Long> {
}
