package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.Bookshelf;
import com.joaocuculo.letterbooks.dto.response.BookshelfMembershipDTO;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    @Query("""
            select distinct new com.joaocuculo.letterbooks.dto.response.BookshelfMembershipDTO(s.id, s.name)
            from Bookshelf s join s.items item
            where s.user.id = :userId and item.id.book.googleBooksId = :googleBooksId
            order by s.name
            """)
    List<BookshelfMembershipDTO> findMembershipsByUserIdAndGoogleBooksId(
            @Param("userId") Long userId, @Param("googleBooksId") String googleBooksId);
}
