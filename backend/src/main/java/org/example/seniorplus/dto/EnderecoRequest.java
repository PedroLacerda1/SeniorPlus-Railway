package org.example.seniorplus.dto;

public record EnderecoRequest(
        String idosoCpf,
        String cuidadorCpf,
        String rua,
        String numero,
        String bairro,
        String cidade,
        String estado,
        String cep,
        String complemento) {
}
