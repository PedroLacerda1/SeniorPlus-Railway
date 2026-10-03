package org.example.seniorplus.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    private static final String STATUS_FIELD = "status";

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        Map<String, Object> response = new HashMap<>();
        response.put("erro", ex.getReason() == null ? status.getReasonPhrase() : ex.getReason());
        response.put("tipo", status.name());
        response.put(STATUS_FIELD, status.value());
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("erro", ex.getMessage());
        response.put("tipo", "AUTENTICACAO");
        response.put(STATUS_FIELD, HttpStatus.UNAUTHORIZED.value());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentialsException(BadCredentialsException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("erro", "Email ou senha inválidos");
        response.put("tipo", "CREDENCIAIS_INVALIDAS");
        response.put(STATUS_FIELD, HttpStatus.UNAUTHORIZED.value());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> response = new HashMap<>();
        
        // Mensagens específicas para erros comuns
        String mensagem = ex.getMessage();
        String tipo = "ERRO_GERAL";
        HttpStatus status = HttpStatus.BAD_REQUEST;
        
        if (mensagem != null) {
            if (mensagem.contains("Email já cadastrado")) {
                tipo = "EMAIL_DUPLICADO";
                mensagem = "Este email já está cadastrado. Por favor, use outro email ou faça login.";
            } else if (mensagem.contains("Usuário não encontrado")) {
                tipo = "USUARIO_NAO_ENCONTRADO";
                mensagem = "Usuário não encontrado.";
                status = HttpStatus.NOT_FOUND;
            } else if (mensagem.contains("Usuário ou senha inválidos")) {
                tipo = "CREDENCIAIS_INVALIDAS";
                mensagem = "Email ou senha incorretos.";
                status = HttpStatus.UNAUTHORIZED;
            } else if (mensagem.contains("não autenticado")) {
                tipo = "NAO_AUTENTICADO";
                mensagem = "Você precisa estar autenticado para acessar este recurso.";
                status = HttpStatus.UNAUTHORIZED;
            }
        } else {
            mensagem = "Ocorreu um erro ao processar sua solicitação.";
        }
        
        response.put("erro", mensagem);
        response.put("tipo", tipo);
        response.put(STATUS_FIELD, status.value());
        
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("erro", "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.");
        response.put("tipo", "ERRO_INTERNO");
        response.put(STATUS_FIELD, HttpStatus.INTERNAL_SERVER_ERROR.value());
        
        // Log do erro para debug
        log.error("Unhandled application exception", ex);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
} 