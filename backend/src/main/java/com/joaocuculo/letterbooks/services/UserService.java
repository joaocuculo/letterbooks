package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.dto.request.AccountDeletionRequestDTO;
import com.joaocuculo.letterbooks.dto.request.PasswordChangeRequestDTO;
import com.joaocuculo.letterbooks.dto.request.RegisterRequestDTO;
import com.joaocuculo.letterbooks.dto.request.UserProfileUpdateDTO;
import com.joaocuculo.letterbooks.dto.request.UserRequestDTO;
import com.joaocuculo.letterbooks.dto.request.UserStatusUpdateDTO;
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
import com.joaocuculo.letterbooks.repositories.BookshelfItemRepository;
import com.joaocuculo.letterbooks.repositories.BookshelfRepository;
import com.joaocuculo.letterbooks.repositories.RatingRepository;
import com.joaocuculo.letterbooks.repositories.UserBookRepository;
import com.joaocuculo.letterbooks.repositories.PasswordResetRepository;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final BookshelfItemRepository bookshelfItemRepository;
    private final BookshelfRepository bookshelfRepository;
    private final RatingRepository ratingRepository;
    private final UserBookRepository userBookRepository;
    private final PasswordResetRepository passwordResetRepository;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder,
            BookshelfItemRepository bookshelfItemRepository, BookshelfRepository bookshelfRepository,
            RatingRepository ratingRepository, UserBookRepository userBookRepository,
            PasswordResetRepository passwordResetRepository) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.bookshelfItemRepository = bookshelfItemRepository;
        this.bookshelfRepository = bookshelfRepository;
        this.ratingRepository = ratingRepository;
        this.userBookRepository = userBookRepository;
        this.passwordResetRepository = passwordResetRepository;
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

    public User register(RegisterRequestDTO dto) {
        validatePasswords(dto.password(), dto.confirmPassword());
        validateEmailAvailable(dto.email());

        User user = new User(
                dto.name(),
                dto.email(),
                passwordEncoder.encode(dto.password()),
                UserRole.USER,
                UserStatus.ACTIVE
        );

        repository.save(user);

        return user;
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void delete(Long id, AccountDeletionRequestDTO dto, JWTUserData authUser) {
        User caller = getByIdOrThrow(authUser.userId());
        validateActiveCaller(caller);
        User user = getByIdOrThrow(id);
        boolean ownAccount = user.getId().equals(caller.getId());
        if (!ownAccount && caller.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Você não tem permissão para deletar este usuário.");
        }
        if (ownAccount) {
            if (dto == null || dto.currentPassword() == null || dto.currentPassword().isBlank()) {
                throw new BusinessException("Informe sua senha atual.");
            }
            if (!passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
                throw new BusinessException("Senha atual incorreta.");
            }
        }
        validateRemainingActiveAdmin(user, false);
        try {
            bookshelfItemRepository.deleteAllByUserId(id);
            bookshelfRepository.deleteAllByUserId(id);
            ratingRepository.deleteAllByUserId(id);
            userBookRepository.deleteAllByUserId(id);
            passwordResetRepository.deleteAllByUserId(id);
            repository.delete(user);
            repository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException("Não foi possível excluir a conta. Tente novamente.");
        }
    }

    public UserResponseDTO update(Long id, UserRequestDTO dto, JWTUserData authUser) {
        User user = getByIdOrThrow(id);
        if (!user.getId().equals(authUser.userId()) && authUser.role() != UserRole.ADMIN) {
            throw new ForbiddenException("Você não tem permissão para alterar este usuário.");
        }
        return updateProfileData(user, dto.name(), dto.email(), dto.password(), authUser.userId());
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public UserResponseDTO updateRoleAndStatus(Long id, UserStatusUpdateDTO dto, Long authUserId) {
        User caller = getByIdOrThrow(authUserId);
        validateActiveCaller(caller);
        if (caller.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Você não tem permissão para alterar permissões de usuários.");
        }
        User user = getByIdOrThrow(id);
        if (user.getId().equals(authUserId)) {
            throw new BusinessException("Você não pode alterar suas próprias permissões.");
        }
        validateRemainingActiveAdmin(user, dto.role() == UserRole.ADMIN && dto.status() == UserStatus.ACTIVE);
        user.setRole(dto.role());
        user.setStatus(dto.status());
        repository.save(user);
        return UserMapper.toResponseDTO(user);
    }

    private void validateActiveCaller(User caller) {
        if (caller.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("Esta conta não está ativa.");
        }
    }

    private void validateRemainingActiveAdmin(User user, boolean remainsActiveAdmin) {
        if (user.getRole() == UserRole.ADMIN && user.getStatus() == UserStatus.ACTIVE
                && !remainsActiveAdmin
                && repository.countByRoleAndStatusAndIdNot(UserRole.ADMIN, UserStatus.ACTIVE, user.getId()) == 0) {
            throw new BusinessException("É necessário manter pelo menos um administrador ativo. Ative ou promova outro administrador antes de continuar.");
        }
    }

    public UserResponseDTO updateProfile(Long userId, UserProfileUpdateDTO dto) {
        User user = getByIdOrThrow(userId);
        return updateProfileData(user, dto.name(), dto.email(), dto.currentPassword(), userId);
    }

    private UserResponseDTO updateProfileData(User user, String name, String email,
            String currentPassword, Long authenticatedUserId) {
        String normalizedName = name.trim();
        String normalizedEmail = email.trim();

        if (!user.getEmail().equals(normalizedEmail)) {
            if (currentPassword == null || currentPassword.isBlank()) {
                throw new BusinessException("Informe sua senha atual para alterar o e-mail.");
            }

            // Administradores confirmam a própria senha ao editar outra conta.
            User authenticatedUser = user.getId().equals(authenticatedUserId)
                    ? user : getByIdOrThrow(authenticatedUserId);
            if (!passwordEncoder.matches(currentPassword, authenticatedUser.getPassword())) {
                throw new BusinessException("Senha atual incorreta.");
            }
            validateEmailAvailable(normalizedEmail);
        }

        user.setName(normalizedName);
        user.setEmail(normalizedEmail);
        repository.save(user);

        return UserMapper.toResponseDTO(user);
    }

    private void validatePasswords(String password, String confirmPassword) {
        if (password == null || password.isBlank() || !password.equals(confirmPassword)) {
            throw new BusinessException("As senhas devem ser iguais.");
        }
        validatePasswordLength(password);
    }

    private void validatePasswordLength(String password) {
        // BCrypt aceita no máximo 72 bytes; caracteres Unicode podem ocupar mais de um byte.
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BusinessException("Senha muito longa. Use uma senha mais curta.");
        }
    }

    private void validateEmailAvailable(String email) {
        if (repository.existsByEmail(email)) {
            throw new BusinessException("Este e-mail já está cadastrado.");
        }
    }

    public void changePassword(Long userId, PasswordChangeRequestDTO dto) {
        validatePasswordLength(dto.newPassword());
        User user = getByIdOrThrow(userId);

        if (!passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
            throw new BusinessException("Senha atual incorreta.");
        }
        if (passwordEncoder.matches(dto.newPassword(), user.getPassword())) {
            throw new BusinessException("A nova senha deve ser diferente da senha atual.");
        }

        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        repository.save(user);
    }
}
