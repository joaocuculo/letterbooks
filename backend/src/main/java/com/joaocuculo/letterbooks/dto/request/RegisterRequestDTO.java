package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequestDTO(
        @NotBlank(message = "Nome é obrigatório.")
        String name,
        @NotBlank(message = "E-mail é obrigatório.")
        @Email(message = "Deve ser um e-mail válido.")
        String email,
        @NotBlank(message = "Senha é obrigatória.")
        @Size(min = 8, max = 72, message = "Senha deve ter entre 8 e 72 caracteres.")
        @Pattern(regexp = "(?s).*\\p{Lu}.*", message = "Senha deve conter pelo menos uma letra maiúscula.")
        @Pattern(regexp = "(?s).*\\p{Ll}.*", message = "Senha deve conter pelo menos uma letra minúscula.")
        @Pattern(regexp = "(?s).*[0-9].*", message = "Senha deve conter pelo menos um número.")
        @Pattern(regexp = "(?s).*[\\p{P}\\p{S}].*", message = "Senha deve conter pelo menos um caractere especial.")
        String password,
        @NotBlank(message = "Confirme sua senha.")
        String confirmPassword
) {
}
