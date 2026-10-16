package com.joaocuculo.letterbooks.repositories;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import java.util.List;
import java.util.Collection;
import org.springframework.data.jpa.repository.Modifying;
import com.joaocuculo.letterbooks.entities.BookshelfItem;
import com.joaocuculo.letterbooks.entities.pk.BookshelfItemPK;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookshelfItemRepository extends JpaRepository<BookshelfItem, BookshelfItemPK> {
    @Modifying
    @Query("delete from BookshelfItem i where i.id.bookshelf.id in (select s.id from Bookshelf s where s.user.id = :userId)")
    int deleteAllByUserId(@Param("userId") Long userId);

    interface ShelfCount { Long getShelfId(); Long getBooksCount(); }

    @Query("""
        select i.id.bookshelf.id as shelfId, count(i) as booksCount from BookshelfItem i
        where i.id.bookshelf.id in :ids group by i.id.bookshelf.id
        """)
    List<ShelfCount> countByShelves(@Param("ids") Collection<Long> ids);

    @Query("""
        select i from BookshelfItem i join fetch i.id.book b
        where i.id.bookshelf.id in :ids and
        (select count(p) from BookshelfItem p where p.id.bookshelf.id = i.id.bookshelf.id
          and p.id.book.id <= b.id) <= 4
        order by i.id.bookshelf.id, b.id
        """)
    List<BookshelfItem> findPreviews(@Param("ids") Collection<Long> ids);

    @Query(value = "select i from BookshelfItem i join fetch i.id.book where i.id.bookshelf.id = :id order by i.id.book.id",
        countQuery = "select count(i) from BookshelfItem i where i.id.bookshelf.id = :id")
    Page<BookshelfItem> findBooks(@Param("id") Long id, Pageable pageable);
    Optional<BookshelfItem> findByIdBookshelfIdAndIdBookId(Long bookshelfId, Long bookId);
    boolean existsByIdBookshelfIdAndIdBookId(Long bookshelfId, Long bookId);
}
