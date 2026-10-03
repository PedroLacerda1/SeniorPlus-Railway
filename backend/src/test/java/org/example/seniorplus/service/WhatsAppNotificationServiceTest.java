package org.example.seniorplus.service;

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
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class WhatsAppNotificationServiceTest {
    private MedicamentoRepository medicamentoRepository;
    private IdosoRepository idosoRepository;
    private RestTemplate restTemplate;
    private MedicationReminderDeliveryRepository deliveryRepository;
    private WhatsAppNotificationService service;

    @BeforeEach
    void setUp() {
        medicamentoRepository = mock(MedicamentoRepository.class);
        idosoRepository = mock(IdosoRepository.class);
        restTemplate = mock(RestTemplate.class);
        RabbitTemplate rabbitTemplate = mock(RabbitTemplate.class);
        deliveryRepository = mock(MedicationReminderDeliveryRepository.class);
        service = new WhatsAppNotificationService(medicamentoRepository, idosoRepository, restTemplate,
                rabbitTemplate, deliveryRepository, new MedicationReminderRabbitProperties());
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
    @SuppressWarnings("null")
    void sendsAndRecordsReminderOnceWhenNotPreviouslyDelivered() {
        MedicationReminderMessage message = new MedicationReminderMessage(
                12L, LocalDate.of(2026, 10, 2), LocalTime.of(9, 0));
        when(deliveryRepository.existsById(message.deliveryKey())).thenReturn(false);

        org.example.seniorplus.domain.Medicamento medication = new org.example.seniorplus.domain.Medicamento();
        medication.setId(12L);
        medication.setCpf("12345678901");
        medication.setNomeMedicamento("Remédio de teste");
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
}
