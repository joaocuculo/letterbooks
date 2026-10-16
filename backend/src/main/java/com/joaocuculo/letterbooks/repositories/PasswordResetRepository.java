package com.joaocuculo.letterbooks.repositories;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import com.joaocuculo.letterbooks.entities.PasswordReset;
import com.joaocuculo.letterbooks.entities.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
    @Modifying
    @Query("delete from PasswordReset r where r.user.id = :userId")
    int deleteAllByUserId(@Param("userId") Long userId);


    Optional<PasswordReset> findByTokenHash(String tokenHash);

    @Transactional
    void deleteByUser(User user);
}
