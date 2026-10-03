package org.example.seniorplus.dto;

import org.example.seniorplus.domain.Role;
import org.example.seniorplus.domain.Usuario;

public record UsuarioResponse(Long id, String email, String nome, String cpf, Role role) {
    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getEmail(), usuario.getNome(), usuario.getCpf(), usuario.getRole());
    }
}
