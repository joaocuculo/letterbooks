package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.BookshelfItem;
import com.joaocuculo.letterbooks.entities.pk.BookshelfItemPK;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookshelfItemRepository extends JpaRepository<BookshelfItem, BookshelfItemPK> {
    Optional<BookshelfItem> findByIdBookshelfIdAndIdBookId(Long bookshelfId, Long bookId);
    boolean existsByIdBookshelfIdAndIdBookId(Long bookshelfId, Long bookId);
}
