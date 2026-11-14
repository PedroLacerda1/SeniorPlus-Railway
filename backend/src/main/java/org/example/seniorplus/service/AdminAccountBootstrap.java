package org.example.seniorplus.service;

import lombok.extern.slf4j.Slf4j;
import org.example.seniorplus.domain.Role;
import org.example.seniorplus.domain.Usuario;
import org.example.seniorplus.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
public class AdminAccountBootstrap implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;
    private final String name;

    public AdminAccountBootstrap(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${ADMIN_BOOTSTRAP_EMAIL:adm@seniorplus.com}") String email,
            @Value("${ADMIN_BOOTSTRAP_PASSWORD:}") String password,
            @Value("${ADMIN_BOOTSTRAP_NAME:Administrador SeniorPlus}") String name) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email.trim().toLowerCase();
        this.password = password;
        this.name = name.trim();
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (password.isBlank()) {
            log.info("Admin bootstrap skipped: ADMIN_BOOTSTRAP_PASSWORD is not configured");
            return;
        }
        var existingAccount = usuarioRepository.findByEmail(email);
        if (existingAccount.isPresent()) {
            if (existingAccount.get().getRole() != Role.ROLE_ADMIN) {
                throw new IllegalStateException(
                        "Admin bootstrap cannot use the configured email because it belongs to a non-admin user");
            }
            log.info("Admin bootstrap skipped: configured administrator already exists");
            return;
        }
        if (usuarioRepository.findAll().stream().anyMatch(user -> user.getRole() == Role.ROLE_ADMIN)) {
            log.info("Admin bootstrap skipped: an administrator account already exists");
            return;
        }

        Usuario admin = new Usuario();
        admin.setNome(name.isBlank() ? "Administrador SeniorPlus" : name);
        admin.setEmail(email);
        admin.setSenha(passwordEncoder.encode(password));
        admin.setRole(Role.ROLE_ADMIN);
        admin.setAtivo(true);
        usuarioRepository.save(admin);
        log.info("Bootstrap administrator account created for {}", email);
    }
}
