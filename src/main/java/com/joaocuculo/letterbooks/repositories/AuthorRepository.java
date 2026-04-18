package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {
}
