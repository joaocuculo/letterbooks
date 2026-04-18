package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.UserBook;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBookRepository extends JpaRepository<UserBook, Long> {
}
