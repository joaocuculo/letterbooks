package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.Bookshelf;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookshelfRepository extends JpaRepository<Bookshelf, Long> {
    Page<Bookshelf> findByUserId(Long userId, Pageable pageable);
    Page<Bookshelf> findByUserIdAndIsPublicShelfTrue(Long userId, Pageable pageable);
    boolean existsByUserIdAndName(Long userId, String name);
    List<Bookshelf> findByUserIdAndItemsIdBookId(Long userId, Long bookId);
}
