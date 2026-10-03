CREATE TABLE medication_reminder_deliveries (
    delivery_key VARCHAR(128) NOT NULL PRIMARY KEY,
    medication_id BIGINT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    delivered_at TIMESTAMP NOT NULL,
    INDEX idx_medication_reminder_deliveries_medication_id (medication_id)
);