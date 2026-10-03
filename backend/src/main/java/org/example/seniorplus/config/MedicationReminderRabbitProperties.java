package org.example.seniorplus.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.reminders.rabbitmq")
public class MedicationReminderRabbitProperties {
    private boolean enabled;
    private String exchange = "seniorplus.reminders";
    private String queue = "seniorplus.medication-reminders";
    private String routingKey = "medication.reminder";
    private String deadLetterExchange = "seniorplus.reminders.dlx";
    private String deadLetterQueue = "seniorplus.medication-reminders.dlq";
    private String deadLetterRoutingKey = "medication.reminder.failed";
}
