package org.example.seniorplus.controller;

import org.example.seniorplus.service.ElderlyAccessService;
import org.example.seniorplus.service.ImagemService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ImagemControllerTest {
    @Test
    void rejectsUploadBeforeStorageWhenResidentAccessIsDenied() throws Exception {
        ImagemService images = mock(ImagemService.class);
        ElderlyAccessService access = mock(ElderlyAccessService.class);
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new ImagemController(images, access)).build();
        when(access.requireResidentAccess(eq("12345678901"), any()))
                .thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN));

        mvc.perform(multipart("/api/v1/idosos/12345678901/anexos")
                .file(new MockMultipartFile("arquivo", "exame.pdf", "application/pdf", new byte[] {1}))
                .principal(() -> "user@example.com"))
                .andExpect(status().isForbidden());

        verify(images, never()).upload(any(), any());
    }
}