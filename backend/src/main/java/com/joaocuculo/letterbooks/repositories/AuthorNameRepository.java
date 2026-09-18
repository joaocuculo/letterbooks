package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.AuthorName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorNameRepository extends JpaRepository<AuthorName, Long> {
    Optional<AuthorName> findByNormalizedName(String normalizedName);
    List<AuthorName> findByAuthorId(Long authorId);

    @Modifying 
    @Query(value = """
        UPDATE author_alias
        SET author_id = :targetAuthorId
        WHERE author_id = :sourceAuthorId
        """, nativeQuery = true)
    void transferAliases(
        @Param("sourceAuthorId") Long sourceAuthorId, 
        @Param("targetAuthorId") Long targetAuthorId
    );
}
