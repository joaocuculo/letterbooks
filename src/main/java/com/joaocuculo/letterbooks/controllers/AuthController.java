package com.joaocuculo.letterbooks.controllers;

import com.joaocuculo.letterbooks.config.TokenConfig;
import com.joaocuculo.letterbooks.dto.request.ForgotPasswordRequestDTO;
import com.joaocuculo.letterbooks.dto.request.LoginRequestDTO;
import com.joaocuculo.letterbooks.dto.request.ResetPasswordRequestDTO;
import com.joaocuculo.letterbooks.dto.request.UserRequestDTO;
import com.joaocuculo.letterbooks.dto.response.LoginResponseDTO;
import com.joaocuculo.letterbooks.dto.response.MessageResponseDTO;
import com.joaocuculo.letterbooks.dto.response.RegisterResponseDTO;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.services.PasswordResetService;
import com.joaocuculo.letterbooks.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping(value = "/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordResetService passwordResetService;
    private final AuthenticationManager authenticationManager;
    private final TokenConfig tokenConfig;

    public AuthController(UserService userService, AuthenticationManager authenticationManager, TokenConfig tokenConfig, PasswordResetService passwordResetService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.tokenConfig = tokenConfig;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping(value = "/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO request) {
        UsernamePasswordAuthenticationToken userAndPass = new UsernamePasswordAuthenticationToken(request.email(), request.password());
        Authentication authentication = authenticationManager.authenticate(userAndPass);

        String token = tokenConfig.generateToken((User) authentication.getPrincipal());
        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping(value = "/register")
    public ResponseEntity<RegisterResponseDTO> register(@RequestBody @Valid UserRequestDTO request) {
        RegisterResponseDTO user = userService.register(request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(user.id()).toUri();
        return ResponseEntity.created(uri).body(user);
    }

    @PostMapping(value = "/forgot-password")
    public ResponseEntity<MessageResponseDTO> requestReset(@RequestBody @Valid ForgotPasswordRequestDTO request) {
        passwordResetService.requestReset(request);
        return ResponseEntity.ok().body(new MessageResponseDTO("E-mail de recuperação enviado."));
    }

    @PostMapping(value = "/reset-password")
    public ResponseEntity<MessageResponseDTO> resetPassword(@RequestBody @Valid ResetPasswordRequestDTO request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok().body(new MessageResponseDTO("Senha redefinida com sucesso."));
    }
}
