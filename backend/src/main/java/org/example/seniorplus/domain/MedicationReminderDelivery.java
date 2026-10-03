package org.example.seniorplus.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "medication_reminder_deliveries")
public class MedicationReminderDelivery {
    @Id
    @Column(name = "delivery_key", length = 128)
    private String deliveryKey;

    @Column(name = "medication_id", nullable = false)
    private Long medicationId;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "scheduled_time", nullable = false)
    private LocalTime scheduledTime;

    @Column(name = "delivered_at", nullable = false)
    private LocalDateTime deliveredAt;

    public MedicationReminderDelivery() {
    }

    public MedicationReminderDelivery(String deliveryKey, Long medicationId, LocalDate scheduledDate,
                                      LocalTime scheduledTime, LocalDateTime deliveredAt) {
        this.deliveryKey = deliveryKey;
        this.medicationId = medicationId;
        this.scheduledDate = scheduledDate;
        this.scheduledTime = scheduledTime;
        this.deliveredAt = deliveredAt;
    }
}
