package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.BookshelfItem;
import com.joaocuculo.letterbooks.entities.pk.BookshelfItemPK;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookshelfItemRepository extends JpaRepository<BookshelfItem, BookshelfItemPK> {
}
