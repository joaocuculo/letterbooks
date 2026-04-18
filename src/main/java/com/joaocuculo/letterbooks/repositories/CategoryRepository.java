package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
