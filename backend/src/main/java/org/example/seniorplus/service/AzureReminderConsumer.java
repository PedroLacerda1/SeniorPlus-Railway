package org.example.seniorplus.service;

import com.azure.storage.queue.models.QueueMessageItem;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.seniorplus.dto.MedicationReminderMessage;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AzureReminderConsumer {
    private final AzureStorageService storage;
    private final WhatsAppNotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedDelayString = "${app.reminders.azure.poll-delay-ms:10000}")
    public void processarLembretes() {
        if (!storage.isConfigured()) {
            return;
        }
        try {
            for (QueueMessageItem message : storage.receberLembretes()) {
                try {
                    MedicationReminderMessage reminder = objectMapper.readValue(message.getBody().toString(), MedicationReminderMessage.class);
                    notificationService.consumirLembrete(reminder);
                    storage.confirmarLembrete(message);
                } catch (Exception error) {
                    log.error("Could not process Azure medication reminder {}", message.getMessageId(), error);
                }
            }
        } catch (Exception error) {
            log.error("Could not receive Azure medication reminders", error);
        }
    }
}