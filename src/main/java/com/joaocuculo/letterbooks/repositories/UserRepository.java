package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
