package org.example.seniorplus.security;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class SwaggerConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    private static final Map<String, String[]> TAGS = new LinkedHashMap<>();

    static {
        TAGS.put("/api/v1/auth", new String[]{"Autenticação", "Cadastro, login e dados da conta autenticada"});
        TAGS.put("/api/v1/reset-senha", new String[]{"Redefinição de senha", "Solicitação e confirmação de nova senha"});
        TAGS.put("/api/v1/idoso", new String[]{"Idosos", "Cadastro e dados do idoso; vínculo direto com cuidador"});
        TAGS.put("/api/v1/cuidador", new String[]{"Cuidadores", "Cadastro e dados do cuidador"});
        TAGS.put("/api/v1/vinculos", new String[]{"Vínculos", "Solicitações de vínculo entre cuidador e idoso"});
        TAGS.put("/api/v1/idosos/{cpf}/medicamentos", new String[]{"Medicamentos", "Medicamentos do idoso (visíveis a cuidadores vinculados)"});
        TAGS.put("/api/v1/medicamentos", new String[]{"Medicamentos", "Medicamentos do idoso (visíveis a cuidadores vinculados)"});
        TAGS.put("/api/v1/idosos/{cpf}/eventos", new String[]{"Eventos", "Agenda de eventos e compromissos do idoso"});
        TAGS.put("/api/v1/eventos", new String[]{"Eventos", "Agenda de eventos e compromissos do idoso"});
        TAGS.put("/api/v1/idosos/{cpf}/contatos-emergencia", new String[]{"Contatos de emergência", "Contatos de emergência do idoso"});
        TAGS.put("/api/v1/mensagens", new String[]{"Chat", "Mensagens entre idoso e cuidadores vinculados"});
        TAGS.put("/api/v1/consulta", new String[]{"Consultas", "Consultas médicas"});
        TAGS.put("/api/v1/exame", new String[]{"Exames", "Exames médicos"});
        TAGS.put("/endereco", new String[]{"Endereços", "Endereços cadastrados"});
        TAGS.put("/api/whatsapp", new String[]{"WhatsApp", "Envio de mensagens por WhatsApp"});
    }

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/v1/auth/login", "/api/v1/auth/register",
            "/api/v1/reset-senha/solicitar", "/api/v1/reset-senha/resetar");

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Senior+ API")
                        .version("1.0.0")
                        .description("""
                                API do Senior+, plataforma de cuidados para idosos.

                                **Como autenticar:** faça login em `POST /api/v1/auth/login`, copie o `token` \
                                da resposta, clique em **Authorize** e informe apenas o token (sem o prefixo "Bearer").

                                **Perfis:** `idoso` acessa apenas os próprios dados; `cuidador` acessa os dados dos \
                                idosos aos quais está vinculado (vínculo direto ou solicitação aceita).""")
                        .contact(new Contact().name("Equipe Senior+")))
                .addServersItem(new Server().url("/").description("Servidor atual"))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Token JWT obtido em /api/v1/auth/login")));
    }

    @Bean
    public OpenApiCustomizer seniorPlusCustomizer() {
        return openApi -> {
            if (openApi.getPaths() == null) {
                return;
            }
            Map<String, String> descriptions = new LinkedHashMap<>();
            openApi.getPaths().forEach((path, item) -> {
                String[] tag = resolveTag(path);
                if (tag != null) {
                    descriptions.putIfAbsent(tag[0], tag[1]);
                    item.readOperations().forEach(op -> {
                        op.setTags(List.of(tag[0]));
                        if (PUBLIC_PATHS.contains(path)) {
                            op.setSecurity(List.of());
                        }
                    });
                }
            });
            descriptions.forEach((name, desc) -> openApi.addTagsItem(new Tag().name(name).description(desc)));
        };
    }

    private static String[] resolveTag(String path) {
        String best = null;
        for (String prefix : TAGS.keySet()) {
            if (path.startsWith(prefix) && (best == null || prefix.length() > best.length())) {
                best = prefix;
            }
        }
        return best == null ? null : TAGS.get(best);
    }
}
