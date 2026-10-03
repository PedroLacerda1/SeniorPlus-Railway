package org.example.seniorplus.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.seniorplus.domain.Role;
import org.example.seniorplus.domain.Usuario;
import org.example.seniorplus.dto.AuthenticationResponse;
import org.example.seniorplus.dto.LoginRequest;
import org.example.seniorplus.dto.RegisterRequest;
import org.example.seniorplus.dto.UsuarioResponse;
import org.example.seniorplus.repository.UsuarioRepository;
import org.example.seniorplus.security.JwtService;
import org.example.seniorplus.service.exception.ServiceOperationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Operation(summary = "Registrar usuário")
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request,
                                                           Principal principal) {
        try {
            log.debug("Registration request received for email={} type={}", request.getEmail(), request.getTipoUsuario());
            validateRegistration(request);
            String cpf = normalizeCpf(request.getCpf());
            ensureAvailable(request.getEmail(), cpf);
            Usuario usuario = createUser(request, cpf, principal);
            usuarioRepository.save(Objects.requireNonNull(usuario));
            log.info("User registered successfully: {}", usuario.getEmail());
            return ResponseEntity.ok(jwtService.generateToken(usuario));
        } catch (Exception e) {
            log.error("Unexpected registration error", e);
            if (e instanceof ResponseStatusException responseStatusException) {
                throw responseStatusException;
            }

            if (e instanceof DataIntegrityViolationException) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Não foi possível concluir o cadastro. Verifique se CPF ou e-mail já estão em uso.");
            }

            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao registrar usuário. Tente novamente.", e);
        }
    }

    private void validateRegistration(RegisterRequest request) {
        if (request.getNome() == null || request.getNome().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O nome é obrigatório.");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O e-mail é obrigatório.");
        }
        if (request.getSenha() == null || request.getSenha().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe uma senha válida.");
        }
        if (request.getTipoUsuario() == null || request.getTipoUsuario().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione o tipo de usuário (Cuidador ou Idoso).");
        }
    }

    private String normalizeCpf(String cpf) {
        if (cpf == null || cpf.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O CPF é obrigatório.");
        }
        String normalized = cpf.replaceAll("\\D", "");
        if (normalized.length() != 11) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O CPF deve conter 11 dígitos.");
        }
        return normalized;
    }

    private void ensureAvailable(String email, String cpf) {
        if (usuarioRepository.existsByEmail(email)) {
            log.info("Registration rejected because email is already registered: {}", email);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado.");
        }
        if (usuarioRepository.existsByCpf(cpf)) {
            log.info("Registration rejected because CPF is already registered");
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado.");
        }
    }

    private Usuario createUser(RegisterRequest request, String cpf, Principal principal) {
        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome());
        usuario.setCpf(cpf);
        usuario.setEmail(request.getEmail());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setRole(resolveRole(request, principal));
        return usuario;
    }

    private Role resolveRole(RegisterRequest request, Principal principal) {
        if ("cuidador".equalsIgnoreCase(request.getTipoUsuario())) {
            return Role.ROLE_CUIDADOR;
        }
        if ("idoso".equalsIgnoreCase(request.getTipoUsuario())) {
            return Role.ROLE_IDOSO;
        }
        if (request.getRole() == Role.ROLE_ADMIN && principal != null) {
            Usuario loggedUser = usuarioRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new ServiceOperationException("Usuário logado não encontrado"));
            return loggedUser.getRole() == Role.ROLE_ADMIN ? Role.ROLE_ADMIN : Role.ROLE_USER;
        }
        return Role.ROLE_USER;
    }

    @Operation(summary = "Autenticar usuário e obter token JWT", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody LoginRequest request) {
        log.debug("Login attempt for email={}", request.getEmail());
        try {
            Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário ou senha inválidos"));

            if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
                log.info("Login rejected because password did not match for email={}", request.getEmail());
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário ou senha inválidos");
            }

            AuthenticationResponse token = jwtService.generateToken(usuario);
            log.info("Login succeeded for email={}", usuario.getEmail());
            return ResponseEntity.ok(token);
        } catch (ResponseStatusException e) {
            log.info("Login rejected with status={} reason={}", e.getStatusCode(), e.getReason());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected login error", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao autenticar. Tente novamente.");
        }
    }

    @Operation(summary = "Obter dados do usuário autenticado", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping("/conta")
    public ResponseEntity<UsuarioResponse> getConta(Principal principal) {
        if (principal == null) {
            throw new ServiceOperationException("Usuário não autenticado");
        }
        
        Usuario usuario = usuarioRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ServiceOperationException("Usuário não encontrado"));
        
        return ResponseEntity.ok(UsuarioResponse.from(usuario));
    }
}
