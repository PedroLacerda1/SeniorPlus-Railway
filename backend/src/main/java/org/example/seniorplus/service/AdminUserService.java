package org.example.seniorplus.service;

import lombok.RequiredArgsConstructor;
import org.example.seniorplus.domain.CaregiverLinkRequest;
import org.example.seniorplus.domain.Cuidador;
import org.example.seniorplus.domain.Idoso;
import org.example.seniorplus.domain.Role;
import org.example.seniorplus.domain.Usuario;
import org.example.seniorplus.dto.AdminLinkResponse;
import org.example.seniorplus.dto.AdminUserRequest;
import org.example.seniorplus.dto.AdminUserResponse;
import org.example.seniorplus.repository.CaregiverLinkRequestRepository;
import org.example.seniorplus.repository.CuidadorRepository;
import org.example.seniorplus.repository.IdosoRepository;
import org.example.seniorplus.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UsuarioRepository usuarioRepository;
    private final IdosoRepository idosoRepository;
    private final CuidadorRepository cuidadorRepository;
    private final CaregiverLinkRequestRepository linkRequestRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listarUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminLinkResponse> listarVinculos() {
        Map<String, String> residentNames = new HashMap<>();
        idosoRepository.findAll().forEach(resident -> residentNames.put(resident.getCpf(), resident.getNome()));
        Map<String, String> caregiverNames = new HashMap<>();
        cuidadorRepository.findAll().forEach(caregiver -> caregiverNames.put(caregiver.getCpf(), caregiver.getNome()));
        Map<String, String> accountNames = new HashMap<>();
        usuarioRepository.findAll().stream()
                .filter(user -> user.getCpf() != null)
                .forEach(user -> accountNames.put(user.getCpf(), user.getNome()));

        List<AdminLinkResponse> directLinks = idosoRepository.findAll().stream()
                .filter(resident -> resident.getCuidador() != null)
                .map(resident -> new AdminLinkResponse(
                        resident.getCpf(),
                        resident.getNome(),
                        resident.getCuidador().getCpf(),
                        resident.getCuidador().getNome(),
                        "ACCEPTED",
                        "DIRETO",
                        resident.getUpdatedAt()))
                .toList();

        List<AdminLinkResponse> requests = linkRequestRepository.findAll().stream()
                .map(request -> toLinkResponse(request, residentNames, caregiverNames, accountNames))
                .toList();

        return java.util.stream.Stream.concat(directLinks.stream(), requests.stream()).toList();
    }

    @Transactional
    public AdminUserResponse criarUsuario(AdminUserRequest request) {
        validateRole(request.role(), null);
        if (request.senha() == null || request.senha().length() < 12) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe uma senha inicial com pelo menos 12 caracteres.");
        }
        if (request.cpf() == null || request.cpf().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF é obrigatório para contas de cuidador e idoso.");
        }
        String email = normalizeEmail(request.email());
        String cpf = normalizeCpf(request.cpf());
        ensureEmailAvailable(email, null);
        ensureCpfAvailable(cpf, null);

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setCpf(cpf);
        usuario.setRole(request.role());
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setAtivo(true);
        return toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public AdminUserResponse atualizarUsuario(Long id, AdminUserRequest request) {
        Usuario usuario = findUser(id);
        if (usuario.getRole() == Role.ROLE_ADMIN && request.role() != null && request.role() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A conta administrativa não pode ser convertida por esta tela.");
        }
        Role requestedRole = request.role() == null ? usuario.getRole() : request.role();
        validateRole(requestedRole, usuario);

        String email = normalizeEmail(request.email());
        String cpf = request.cpf() == null || request.cpf().isBlank() ? null : normalizeCpf(request.cpf());
        ensureEmailAvailable(email, usuario.getId());
        if (cpf != null) ensureCpfAvailable(cpf, usuario.getId());

        if (!Objects.equals(cpf, usuario.getCpf())) {
            if (hasLinks(usuario.getCpf()) || hasProfile(usuario.getCpf())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Não é possível alterar o CPF de uma conta com perfil ou vínculos existentes.");
            }
        }
        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setCpf(cpf);
        usuario.setRole(requestedRole);
        if (request.senha() != null && !request.senha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(request.senha()));
        }
        return toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public AdminUserResponse atualizarStatus(Long id, boolean ativo, String adminEmail) {
        Usuario usuario = findUser(id);
        if (usuario.getEmail().equalsIgnoreCase(adminEmail) && !ativo) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Você não pode desativar sua própria conta.");
        }
        if (usuario.getRole() == Role.ROLE_ADMIN && !ativo) {
            long activeAdmins = usuarioRepository.findAll().stream()
                    .filter(user -> user.getRole() == Role.ROLE_ADMIN && user.isEnabled())
                    .count();
            if (activeAdmins <= 1) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Não é possível desativar o último administrador ativo.");
            }
        }
        usuario.setAtivo(ativo);
        return toResponse(usuarioRepository.save(usuario));
    }

    private AdminUserResponse toResponse(Usuario usuario) {
        return new AdminUserResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCpf(),
                usuario.getRole(),
                usuario.isEnabled());
    }

    private AdminLinkResponse toLinkResponse(
            CaregiverLinkRequest request,
            Map<String, String> residentNames,
            Map<String, String> caregiverNames,
            Map<String, String> accountNames) {
        return new AdminLinkResponse(
                request.getIdosoCpf(),
                residentNames.getOrDefault(request.getIdosoCpf(),
                        accountNames.getOrDefault(request.getIdosoCpf(), "Perfil não cadastrado")),
                request.getCuidadorCpf(),
                caregiverNames.getOrDefault(request.getCuidadorCpf(),
                        accountNames.getOrDefault(request.getCuidadorCpf(), "Perfil não cadastrado")),
                request.getStatus().name(),
                "SOLICITACAO",
                request.getRespondedAt() != null ? request.getRespondedAt() : request.getCreatedAt());
    }

    private boolean hasLinks(String cpf) {
        if (cpf == null) return false;
        return idosoRepository.findById(cpf).map(resident -> resident.getCuidador() != null).orElse(false)
                || !linkRequestRepository.findByIdosoCpfAndStatusOrderByCreatedAtDesc(
                        cpf, org.example.seniorplus.domain.CaregiverLinkStatus.PENDING).isEmpty()
                || !linkRequestRepository.findByCuidadorCpfOrderByCreatedAtDesc(cpf).isEmpty();
    }

    private boolean hasProfile(String cpf) {
        if (cpf == null) return false;
        return idosoRepository.existsById(cpf) || cuidadorRepository.existsById(cpf);
    }

    private Usuario findUser(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }

    private void validateRole(Role role, Usuario existing) {
        if (role == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione o perfil do usuário.");
        }
        if (role == Role.ROLE_ADMIN && (existing == null || existing.getRole() != Role.ROLE_ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Contas administrativas só podem ser provisionadas pelo bootstrap seguro.");
        }
        if (role != Role.ROLE_ADMIN && role != Role.ROLE_CUIDADOR && role != Role.ROLE_IDOSO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O perfil deve ser cuidador ou idoso.");
        }
        if (existing != null && existing.getRole() != role && hasLinks(existing.getCpf())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Não é possível alterar o perfil enquanto houver vínculos associados.");
        }
    }

    private void ensureEmailAvailable(String email, Long currentId) {
        usuarioRepository.findByEmail(email)
                .filter(existing -> !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já está em uso.");
                });
    }

    private void ensureCpfAvailable(String cpf, Long currentId) {
        usuarioRepository.findByCpf(cpf)
                .filter(existing -> !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já está em uso.");
                });
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String normalizeCpf(String cpf) {
        if (cpf == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF é obrigatório.");
        }
        String normalized = cpf.replaceAll("\\D", "");
        if (normalized.length() != 11) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF deve conter 11 dígitos.");
        }
        return normalized;
    }
}
