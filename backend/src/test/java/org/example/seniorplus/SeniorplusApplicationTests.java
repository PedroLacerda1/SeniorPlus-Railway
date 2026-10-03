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
import org.springframework.web.server.ResponseStatusException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
class SeniorplusApplicationTests {

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
