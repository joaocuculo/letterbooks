package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.UserBook;
import com.joaocuculo.letterbooks.entities.enums.UserBookStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserBookRepository extends JpaRepository<UserBook, Long> {
    Page<UserBook> findByUserId(Long userId, Pageable pageable);
    Page<UserBook> findByUserIdAndStatus(Long userId, UserBookStatus status, Pageable pageable);
}
