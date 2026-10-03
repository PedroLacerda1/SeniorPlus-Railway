package org.example.seniorplus.dto;

public record ContatoEmergenciaRequest(
        String nome,
        String telefone,
        String relacao,
        String observacoes) {
}
