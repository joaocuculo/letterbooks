package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.dto.request.UserRequestDTO;
import com.joaocuculo.letterbooks.dto.request.UserStatusUpdateDTO;
import com.joaocuculo.letterbooks.dto.response.RegisterResponseDTO;
import com.joaocuculo.letterbooks.dto.response.UserResponseDTO;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.entities.enums.UserStatus;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.DatabaseException;
import com.joaocuculo.letterbooks.exceptions.ForbiddenException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.mapper.UserMapper;
import com.joaocuculo.letterbooks.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<UserResponseDTO> findAll(Pageable pageable) {
        Page<User> users = repository.findAll(pageable);
        return users.map(UserMapper::toResponseDTO);
    }

    public UserResponseDTO findById(Long id) {
        User user = getByIdOrThrow(id);
        return UserMapper.toResponseDTO(user);
    }

    public User getByIdOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    }

    public RegisterResponseDTO register(UserRequestDTO dto) {
        if (repository.existsByEmail(dto.email())) {
            throw new BusinessException("Este e-mail já está cadastrado.");
        }

        User user = new User(
                dto.name(),
                dto.email(),
                passwordEncoder.encode(dto.password()),
                UserRole.USER,
                UserStatus.ACTIVE
        );

        repository.save(user);

        return new RegisterResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }

    public void delete(Long id, JWTUserData authUser) {
        User user = getByIdOrThrow(id);
        if (!user.getId().equals(authUser.userId()) && authUser.role() != UserRole.ADMIN) {
            throw new ForbiddenException("Você não tem permissão para deletar este usuário.");
        }
        try {
            repository.delete(user);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException(e.getMessage());
        }
    }

    public UserResponseDTO update(Long id, UserRequestDTO dto, JWTUserData authUser) {
        User user = getByIdOrThrow(id);
        if (!user.getId().equals(authUser.userId()) && authUser.role() != UserRole.ADMIN) {
            throw new ForbiddenException("Você não tem permissão para alterar este usuário.");
        }
        if (!user.getEmail().equals(dto.email()) && repository.existsByEmail(dto.email())) {
            throw new BusinessException("Este e-mail já está cadastrado.");
        }

        user.setName(dto.name());
        user.setEmail(dto.email());
        repository.save(user);

        return UserMapper.toResponseDTO(user);
    }

    public UserResponseDTO updateRoleAndStatus(Long id, UserStatusUpdateDTO dto, Long authUserId) {
        User user = getByIdOrThrow(id);
        if (user.getId().equals(authUserId)) {
            throw new BusinessException("Você não pode alterar suas próprias permissões.");
        }
        user.setRole(dto.role());
        user.setStatus(dto.status());
        repository.save(user);
        return UserMapper.toResponseDTO(user);
    }
}
