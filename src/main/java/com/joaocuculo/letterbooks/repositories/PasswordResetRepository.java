package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.PasswordReset;
import com.joaocuculo.letterbooks.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {

    Optional<PasswordReset> findPasswordResetByToken(String token);
    void deleteByUser(User user);
}
