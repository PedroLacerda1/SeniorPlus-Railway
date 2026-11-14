package org.example.seniorplus.service;

import com.azure.core.util.BinaryData;
import com.azure.storage.queue.models.QueueMessageItem;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.seniorplus.dto.MedicationReminderMessage;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AzureReminderConsumerTest {
    private final AzureStorageService storage = mock(AzureStorageService.class);
    private final WhatsAppNotificationService notifications = mock(WhatsAppNotificationService.class);
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private final AzureReminderConsumer consumer = new AzureReminderConsumer(storage, notifications, objectMapper);

    @Test
    void confirmsMessageOnlyAfterSuccessfulProcessing() throws Exception {
        MedicationReminderMessage reminder = new MedicationReminderMessage(12L, LocalDate.of(2026, 11, 14), LocalTime.of(9, 0));
        QueueMessageItem message = new QueueMessageItem().setMessageId("id").setPopReceipt("receipt")
                .setBody(BinaryData.fromString(objectMapper.writeValueAsString(reminder)));
        when(storage.isConfigured()).thenReturn(true);
        when(storage.receberLembretes()).thenReturn(List.of(message));

        consumer.processarLembretes();

        verify(notifications).consumirLembrete(reminder);
        verify(storage).confirmarLembrete(message);
    }

    @Test
    void leavesFailedMessagesInQueueForRetry() throws Exception {
        MedicationReminderMessage reminder = new MedicationReminderMessage(12L, LocalDate.of(2026, 11, 14), LocalTime.of(9, 0));
        QueueMessageItem message = new QueueMessageItem().setMessageId("id").setPopReceipt("receipt")
                .setBody(BinaryData.fromString(objectMapper.writeValueAsString(reminder)));
        when(storage.isConfigured()).thenReturn(true);
        when(storage.receberLembretes()).thenReturn(List.of(message));
        doThrow(new IllegalStateException("delivery failed")).when(notifications).consumirLembrete(reminder);

        consumer.processarLembretes();

        verify(storage, never()).confirmarLembrete(any());
    }

    @Test
    void skipsPollingWithoutStorageConfiguration() {
        consumer.processarLembretes();
        verify(storage, never()).receberLembretes();
    }
}