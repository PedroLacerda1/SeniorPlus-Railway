package org.example.seniorplus.service;

import org.example.seniorplus.domain.Imagem;
import org.example.seniorplus.repository.ImagemRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ImagemServiceTest {
    private final ImagemRepository repository = mock(ImagemRepository.class);
    private final AzureStorageService storage = mock(AzureStorageService.class);
    private final ImagemService service = new ImagemService(repository, storage);
    private final MockMultipartFile file = new MockMultipartFile("arquivo", "exame.pdf", "application/pdf", new byte[] {1});

    @Test
    void storesBlobUrlWithResidentCpf() throws Exception {
        when(storage.isConfigured()).thenReturn(true);
        when(storage.uploadArquivo(file)).thenReturn("https://storage.example/anexos/blob");
        when(repository.save(any(Imagem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Imagem saved = service.upload("12345678901", file);

        assertEquals("12345678901", saved.getCpf());
        assertEquals("exame.pdf", saved.getNomeArquivo());
        assertEquals("https://storage.example/anexos/blob", saved.getUrl());
        verify(repository).save(saved);
    }

    @Test
    void rejectsUploadWithoutStorageConfiguration() throws Exception {
        assertEquals(503, assertThrows(ResponseStatusException.class,
                () -> service.upload("12345678901", file)).getStatusCode().value());
        verify(storage, never()).uploadArquivo(any());
        verify(repository, never()).save(any());
    }
}