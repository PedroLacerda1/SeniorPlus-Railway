package org.example.seniorplus.dto;

import java.time.LocalDate;

public record ExameMedicoRequest(
        String cpf,
        String tipoExame,
        String resultado,
        LocalDate dataExame,
        String laboratorio,
        String observacoes) {
}
