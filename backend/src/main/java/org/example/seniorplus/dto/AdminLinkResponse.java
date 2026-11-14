package org.example.seniorplus.dto;

import java.time.LocalDateTime;

public record AdminLinkResponse(
        String idosoCpf,
        String idosoNome,
        String cuidadorCpf,
        String cuidadorNome,
        String status,
        String origem,
        LocalDateTime atualizadoEm
) {
}
