package com.joaocuculo.letterbooks.config;

import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.entities.enums.UserStatus;
import com.joaocuculo.letterbooks.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements ApplicationRunner {

    @Value("${app.data-seeder.admin.email}")
    private String email;

    @Value("${app.data-seeder.admin.password}")
    private String password;

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (!repository.existsByEmail(email)) {
            User admin = new User(
                    "admin",
                    email,
                    passwordEncoder.encode(password),
                    UserRole.ADMIN,
                    UserStatus.ACTIVE
            );
            repository.save(admin);
        }
    }
}
