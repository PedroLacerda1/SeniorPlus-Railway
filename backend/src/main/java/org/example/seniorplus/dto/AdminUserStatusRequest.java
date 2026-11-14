package org.example.seniorplus.dto;

import jakarta.validation.constraints.NotNull;

public record AdminUserStatusRequest(@NotNull Boolean ativo) {
}
