package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.UserRequestDTO;
import com.joaocuculo.letterbooks.dto.UserResponseDTO;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.entities.enums.UserStatus;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.DatabaseException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public Page<UserResponseDTO> findAll(Pageable pageable) {
        Page<User> users = repository.findAll(pageable);
        return users.map(user -> new UserResponseDTO(user.getId(), user.getUsername(), user.getEmail()));
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

    public void delete(Long id) {
        try {
            repository.deleteById(id);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Usuário com id " + id + " não encotrado.");
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException(e.getMessage());
        }
    }

    public UserResponseDTO update(Long id, UserRequestDTO dto) {
        try {
            User user = repository.getReferenceById(id);
            updateData(user, dto);
            repository.save(user);
            return new UserResponseDTO(user.getId(), user.getUsername(), user.getEmail());
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Usuário com id " + id + " não encotrado.");
        }
    }

    public void updateData(User entity, UserRequestDTO obj) {
        entity.setUsername(obj.username());
        entity.setEmail(obj.email());
        if (obj.password() != null) {
            entity.setPassword(obj.password());
        }
    }
}
