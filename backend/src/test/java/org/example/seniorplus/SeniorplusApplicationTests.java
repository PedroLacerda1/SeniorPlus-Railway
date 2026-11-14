package org.example.seniorplus;

import org.example.seniorplus.domain.Idoso;
import org.example.seniorplus.dto.MensagemRequest;
import org.example.seniorplus.dto.MensagemResponse;
import org.example.seniorplus.dto.UsuarioResponse;
import org.example.seniorplus.domain.Role;
import org.example.seniorplus.domain.Usuario;
import org.example.seniorplus.repository.IdosoRepository;
import org.example.seniorplus.repository.MensagemRepository;
import org.example.seniorplus.service.MensagemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SeniorplusApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IdosoRepository idosoRepository;

    @Autowired
    private MensagemService mensagemService;

    @Autowired
    private MensagemRepository mensagemRepository;

    @BeforeEach
    void limparMensagensDeTeste() {
        mensagemRepository.deleteAll();
        idosoRepository.deleteById("12345678901");
    }

    @Test
    void contextLoads() {
    }

    @Test
    void actuatorHealthReportsDatabaseStatus() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components.db.status").value("UP"));
    }

        @Test
        void azureFrontendCanReachRegistrationButOtherOriginsAreRejected() throws Exception {
        String origin = "https://icy-rock-0cc47c010.5.azurestaticapps.net";
        mockMvc.perform(options("/api/v1/auth/register")
                .header("Origin", origin)
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "content-type"))
            .andExpect(status().isOk())
            .andExpect(header().string("Access-Control-Allow-Origin", origin));
        mockMvc.perform(post("/api/v1/auth/register")
                .header("Origin", origin)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest())
            .andExpect(header().string("Access-Control-Allow-Origin", origin));
        mockMvc.perform(post("/api/v1/auth/register")
                .header("Origin", "https://untrusted.example")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isForbidden());
        }

        @Test
        @Transactional
        void registrationAndLoginWorkFromAzureOrigin() throws Exception {
        String origin = "https://icy-rock-0cc47c010.5.azurestaticapps.net";
        String registration = "{\"nome\":\"QA\",\"cpf\":\"98765432109\",\"email\":\"qa@example.invalid\",\"senha\":\"test-password\",\"tipoUsuario\":\"Cuidador\"}";
        mockMvc.perform(post("/api/v1/auth/register").header("Origin", origin)
                .contentType(MediaType.APPLICATION_JSON).content(registration))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").isNotEmpty());
        mockMvc.perform(post("/api/v1/auth/register").header("Origin", origin)
                .contentType(MediaType.APPLICATION_JSON).content(registration))
            .andExpect(status().isConflict());
        mockMvc.perform(post("/api/v1/auth/login").header("Origin", origin)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"qa@example.invalid\",\"senha\":\"test-password\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").isNotEmpty());
        mockMvc.perform(post("/api/v1/auth/login").header("Origin", origin)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"qa@example.invalid\",\"senha\":\"wrong-password\"}"))
            .andExpect(status().isUnauthorized());
        }

    @Test
    void chatMensagemPodeSerEnviadaEListadaPeloCpfDoIdoso() {
        Idoso idoso = new Idoso();
        idoso.setCpf("12345678901");
        idoso.setNome("Idoso de teste");
        idosoRepository.save(idoso);

        MensagemRequest request = new MensagemRequest();
        request.setIdosoCpf(idoso.getCpf());
        request.setRemetente("Cuidador de teste");
        request.setDestinatario(idoso.getNome());
        request.setConteudo("Mensagem de teste do chat");

        MensagemResponse enviada = mensagemService.salvarMensagem(request);
        List<MensagemResponse> historico = mensagemService.getMensagensDoIdoso(idoso.getCpf(), null);

        assertEquals(1, historico.size());
        assertEquals(enviada.getId(), historico.get(0).getId());
        assertEquals("Mensagem de teste do chat", historico.get(0).getConteudo());
        assertEquals(idoso.getCpf(), historico.get(0).getIdosoCpf());
        assertNull(historico.get(0).getIdosoId());
    }

    @Test
    void chatRejeitaIdentificadorQueNaoSejaCpf() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> mensagemService.getMensagensDoIdoso(null, "resident-42"));

        assertEquals(400, error.getStatusCode().value());
    }

    @Test
    void usuarioResponseNeverSerializesPasswordHash() throws Exception {
        Usuario usuario = new Usuario();
        usuario.setId(5L);
        usuario.setEmail("idoso@example.com");
        usuario.setNome("Idoso de teste");
        usuario.setCpf("12345678901");
        usuario.setRole(Role.ROLE_IDOSO);
        usuario.setSenha("hash-nao-deve-vazar");

        String json = new ObjectMapper().writeValueAsString(UsuarioResponse.from(usuario));

        assertFalse(json.contains("senha"));
        assertFalse(json.contains("password"));
        assertFalse(json.contains("hash-nao-deve-vazar"));
    }

}
