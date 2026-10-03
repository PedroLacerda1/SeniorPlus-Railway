package org.example.seniorplus.dto;

import java.time.LocalDate;
import java.util.List;

public record CuidadorRequest(
        String cpf,
        String rg,
        String nome,
        String email,
        LocalDate dataNascimento,
        String telefone,
        List<EnderecoRequest> enderecos) {
}
