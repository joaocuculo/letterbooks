package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.CategoryName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryNameRepository extends JpaRepository<CategoryName, Long> {
    Optional<CategoryName> findByNormalizedName(String normalizedName);
}
