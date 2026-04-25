package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<UserDetails> findUserByEmail(String username);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
