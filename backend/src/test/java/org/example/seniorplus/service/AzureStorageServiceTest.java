package org.example.seniorplus.service;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AzureStorageServiceTest {

    @Test
    void missingConnectionStringFailsOperationsWithoutConnecting() {
        AzureStorageService service = new AzureStorageService("", "attachments", "reminders");
        MockMultipartFile file = new MockMultipartFile("arquivo", "teste.txt", "text/plain", new byte[] {1});

        assertFalse(service.isConfigured());
        assertThrows(IllegalStateException.class, () -> service.uploadArquivo(file));
        assertThrows(IllegalStateException.class, () -> service.enfileirarLembrete("{}"));
    }
}