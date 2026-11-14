package org.example.seniorplus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.example.seniorplus.domain.Role;

public record AdminUserRequest(
        @NotBlank @Size(max = 255) String nome,
        @NotBlank @Email @Size(max = 255) String email,
        @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos") String cpf,
        Role role,
        @Size(min = 12, max = 72, message = "A senha deve conter de 12 a 72 caracteres") String senha
) {
}
