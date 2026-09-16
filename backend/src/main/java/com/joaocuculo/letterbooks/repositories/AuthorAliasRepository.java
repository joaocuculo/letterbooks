package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.AuthorAlias;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorAliasRepository extends JpaRepository<AuthorAlias, Long> {
    Optional<AuthorAlias> findByNormalizedName(String normalizedName);
    Optional<List<AuthorAlias>> findByAuthorId(Long authorId);
}
