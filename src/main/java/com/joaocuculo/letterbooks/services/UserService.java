package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.UserRequestDTO;
import com.joaocuculo.letterbooks.dto.UserResponseDTO;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.entities.enums.UserStatus;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.repositories.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public UserResponseDTO findById(Long id) {
        User user = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
        return new UserResponseDTO(user.getId(), user.getUsername(), user.getEmail());
    }

    public UserResponseDTO register(UserRequestDTO dto) {
        if (repository.existsByEmail(dto.email())) {
            throw new BusinessException("Este e-mail já está cadastrado.");
        }
        if (repository.existsByUsername(dto.username())) {
            throw new BusinessException("Este username já está sendo usado.");
        }

        User user = new User(
                dto.username(),
                dto.email(),
                dto.password(),
                UserRole.USER,
                UserStatus.ACTIVE
        );

        repository.save(user);

        return new UserResponseDTO(user.getId(), user.getUsername(), user.getEmail());
    }
}
