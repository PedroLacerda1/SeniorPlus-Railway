package org.example.seniorplus.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record ConsultaRequest(
        String cpf,
        String nomeMedico,
        String especialidade,
        LocalDate data,
        LocalTime hora,
        String local,
        String observacoes,
        String imgReceita) {
}
