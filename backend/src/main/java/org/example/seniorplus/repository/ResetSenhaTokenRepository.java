package org.example.seniorplus.repository;


import org.example.seniorplus.domain.ResetSenhaToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResetSenhaTokenRepository extends JpaRepository<ResetSenhaToken, Long> {
    Optional<ResetSenhaToken> findByToken(String token);
    void deleteByUsuarioId(Long usuarioId);
} 