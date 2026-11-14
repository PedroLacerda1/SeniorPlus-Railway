package org.example.seniorplus.dto;

import org.example.seniorplus.domain.Role;

public record AdminUserResponse(
        Long id,
        String nome,
        String email,
        String cpf,
        Role role,
        boolean ativo
) {
}
