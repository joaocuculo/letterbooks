package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.AuthorName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthorNameRepository extends JpaRepository<AuthorName, Long> {
    Optional<AuthorName> findByNormalizedName(String normalizedName);
}
