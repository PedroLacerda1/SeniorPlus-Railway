package org.example.seniorplus.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.seniorplus.config.MedicationReminderRabbitProperties;
import org.example.seniorplus.domain.Idoso;
import org.example.seniorplus.dto.MedicationReminderMessage;
import org.example.seniorplus.repository.IdosoRepository;
import org.example.seniorplus.repository.MedicationReminderDeliveryRepository;
import org.example.seniorplus.repository.MedicamentoRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.doThrow;

class WhatsAppNotificationServiceTest {
    private MedicamentoRepository medicamentoRepository;
    private IdosoRepository idosoRepository;
    private RestTemplate restTemplate;
    private MedicationReminderDeliveryRepository deliveryRepository;
    private AzureStorageService azureStorageService;
    private WhatsAppNotificationService service;

    @BeforeEach
    void setUp() {
        medicamentoRepository = mock(MedicamentoRepository.class);
        idosoRepository = mock(IdosoRepository.class);
        restTemplate = mock(RestTemplate.class);
        RabbitTemplate rabbitTemplate = mock(RabbitTemplate.class);
        deliveryRepository = mock(MedicationReminderDeliveryRepository.class);
        azureStorageService = mock(AzureStorageService.class);
        service = new WhatsAppNotificationService(medicamentoRepository, idosoRepository, restTemplate,
            rabbitTemplate, deliveryRepository, new MedicationReminderRabbitProperties(), azureStorageService,
            new ObjectMapper().findAndRegisterModules(), "America/Sao_Paulo");
    }

    @Test
    @SuppressWarnings("null")
    void ignoresReminderAlreadyRecordedAsDelivered() {
        MedicationReminderMessage message = new MedicationReminderMessage(
                12L, LocalDate.of(2026, 10, 2), LocalTime.of(9, 0));
        when(deliveryRepository.existsById(message.deliveryKey())).thenReturn(true);

        service.consumirLembrete(message);

        verify(medicamentoRepository, never()).findById(any());
        verify(restTemplate, never()).getForEntity(anyString(), eq(String.class));
        verify(deliveryRepository, never()).save(any());
    }

    @Test
    void publishesScheduledReminderAsJsonAndRetriesPublicationFailure() throws Exception {
        LocalDate today = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        LocalTime now = LocalTime.now(ZoneId.of("America/Sao_Paulo")).withSecond(0).withNano(0);
        org.example.seniorplus.domain.Medicamento medication = new org.example.seniorplus.domain.Medicamento();
        medication.setId(12L);
        medication.setDataInicio(today);
        medication.setHorarios(List.of(now));
        medication.setNotificarPorApp(true);
        when(medicamentoRepository.findAllWithHorariosBy()).thenReturn(List.of(medication));
        when(azureStorageService.isConfigured()).thenReturn(true);
        doThrow(new IllegalStateException("queue unavailable")).doNothing()
                .when(azureStorageService).enfileirarLembrete(anyString());

        service.verificarEEnviarMensagens();
        service.verificarEEnviarMensagens();

        org.mockito.ArgumentCaptor<String> payload = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(azureStorageService, times(2)).enfileirarLembrete(payload.capture());
        assertEquals(12L, new ObjectMapper().readTree(payload.getValue()).get("medicationId").asLong());
        verify(restTemplate, never()).getForEntity(anyString(), eq(String.class));
    }

    @Test
    @SuppressWarnings("null")
    void sendsAndRecordsReminderOnceWhenNotPreviouslyDelivered() {
        LocalDate today = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        LocalTime now = LocalTime.now(ZoneId.of("America/Sao_Paulo")).withSecond(0).withNano(0);
        MedicationReminderMessage message = new MedicationReminderMessage(12L, today, now);
        when(deliveryRepository.existsById(message.deliveryKey())).thenReturn(false);

        org.example.seniorplus.domain.Medicamento medication = new org.example.seniorplus.domain.Medicamento();
        medication.setId(12L);
        medication.setCpf("12345678901");
        medication.setNomeMedicamento("Remédio de teste");
        medication.setDataInicio(today);
        medication.setHorarios(List.of(now));
        medication.setNotificarPorApp(true);
        when(medicamentoRepository.findById(12L)).thenReturn(Optional.of(medication));

        Idoso elderly = new Idoso();
        elderly.setTelefone("5511999999999");
        elderly.setObservacao("test-api-key");
        when(idosoRepository.findById("12345678901")).thenReturn(Optional.of(elderly));
        when(restTemplate.getForEntity(anyString(), eq(String.class))).thenReturn(ResponseEntity.ok("sent"));

        service.consumirLembrete(message);

        verify(restTemplate).getForEntity(anyString(), eq(String.class));
        verify(deliveryRepository).save(any());
    }

    @Test
    @SuppressWarnings("null")
    void doesNotSendWhenAppReminderIsDisabled() {
        LocalDate today = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        LocalTime now = LocalTime.now(ZoneId.of("America/Sao_Paulo")).withSecond(0).withNano(0);
        MedicationReminderMessage message = new MedicationReminderMessage(12L, today, now);
        when(deliveryRepository.existsById(message.deliveryKey())).thenReturn(false);

        org.example.seniorplus.domain.Medicamento medication = new org.example.seniorplus.domain.Medicamento();
        medication.setId(12L);
        medication.setDataInicio(today);
        medication.setHorarios(List.of(now));
        medication.setNotificarPorApp(false);
        when(medicamentoRepository.findById(12L)).thenReturn(Optional.of(medication));

        service.consumirLembrete(message);

        verify(restTemplate, never()).getForEntity(anyString(), eq(String.class));
        verify(deliveryRepository, never()).save(any());
    }

    @Test
    @SuppressWarnings("null")
    void doesNotSendOutsideMedicationDateRange() {
        LocalDate today = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        LocalTime now = LocalTime.now(ZoneId.of("America/Sao_Paulo")).withSecond(0).withNano(0);
        MedicationReminderMessage message = new MedicationReminderMessage(12L, today, now);
        when(deliveryRepository.existsById(message.deliveryKey())).thenReturn(false);

        org.example.seniorplus.domain.Medicamento medication = new org.example.seniorplus.domain.Medicamento();
        medication.setId(12L);
        medication.setDataInicio(today.minusDays(5));
        medication.setDataFim(today.minusDays(1));
        medication.setHorarios(List.of(now));
        medication.setNotificarPorApp(true);
        when(medicamentoRepository.findById(12L)).thenReturn(Optional.of(medication));

        service.consumirLembrete(message);

        verify(restTemplate, never()).getForEntity(anyString(), eq(String.class));
        verify(deliveryRepository, never()).save(any());
    }

    @Test
    @SuppressWarnings("null")
    void doesNotSendForPausedMedication() {
        LocalDate today = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        LocalTime now = LocalTime.now(ZoneId.of("America/Sao_Paulo")).withSecond(0).withNano(0);
        MedicationReminderMessage message = new MedicationReminderMessage(12L, today, now);
        when(deliveryRepository.existsById(message.deliveryKey())).thenReturn(false);

        org.example.seniorplus.domain.Medicamento medication = new org.example.seniorplus.domain.Medicamento();
        medication.setId(12L);
        medication.setDataInicio(today);
        medication.setHorarios(List.of(now));
        medication.setNotificarPorApp(true);
        medication.setStatus("paused");
        when(medicamentoRepository.findById(12L)).thenReturn(Optional.of(medication));

        service.consumirLembrete(message);

        verify(restTemplate, never()).getForEntity(anyString(), eq(String.class));
        verify(deliveryRepository, never()).save(any());
    }
}
