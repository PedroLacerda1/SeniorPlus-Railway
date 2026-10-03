package org.example.seniorplus.dto;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;
import org.springframework.lang.NonNull;

public record MedicationReminderMessage(
        @NonNull Long medicationId,
        @NonNull LocalDate scheduledDate,
        @NonNull LocalTime scheduledTime)
        implements Serializable {

    public MedicationReminderMessage {
        Objects.requireNonNull(medicationId, "medicationId");
        Objects.requireNonNull(scheduledDate, "scheduledDate");
        Objects.requireNonNull(scheduledTime, "scheduledTime");
    }

    @NonNull
    public String deliveryKey() {
        return "medication:" + medicationId + ":" + scheduledDate + ":" + scheduledTime;
    }
}
