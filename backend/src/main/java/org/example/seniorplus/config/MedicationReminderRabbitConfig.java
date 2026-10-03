package org.example.seniorplus.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Qualifier;

@Configuration
@ConditionalOnProperty(prefix = "app.reminders.rabbitmq", name = "enabled", havingValue = "true")
public class MedicationReminderRabbitConfig {
    @Bean
    public DirectExchange medicationReminderExchange(MedicationReminderRabbitProperties properties) {
        return new DirectExchange(properties.getExchange(), true, false);
    }

    @Bean
    public DirectExchange medicationReminderDeadLetterExchange(MedicationReminderRabbitProperties properties) {
        return new DirectExchange(properties.getDeadLetterExchange(), true, false);
    }

    @Bean
    public Queue medicationReminderQueue(MedicationReminderRabbitProperties properties) {
        return QueueBuilder.durable(properties.getQueue())
                .deadLetterExchange(properties.getDeadLetterExchange())
                .deadLetterRoutingKey(properties.getDeadLetterRoutingKey())
                .build();
    }

    @Bean
    public Queue medicationReminderDeadLetterQueue(MedicationReminderRabbitProperties properties) {
        return QueueBuilder.durable(properties.getDeadLetterQueue()).build();
    }

    @Bean
    public Binding medicationReminderBinding(@Qualifier("medicationReminderQueue") Queue medicationReminderQueue,
                                             @Qualifier("medicationReminderExchange") DirectExchange medicationReminderExchange,
                                             MedicationReminderRabbitProperties properties) {
        return BindingBuilder.bind(medicationReminderQueue)
                .to(medicationReminderExchange)
                .with(properties.getRoutingKey());
    }

    @Bean
    public Binding medicationReminderDeadLetterBinding(@Qualifier("medicationReminderDeadLetterQueue") Queue medicationReminderDeadLetterQueue,
                                                       @Qualifier("medicationReminderDeadLetterExchange") DirectExchange medicationReminderDeadLetterExchange,
                                                       MedicationReminderRabbitProperties properties) {
        return BindingBuilder.bind(medicationReminderDeadLetterQueue)
                .to(medicationReminderDeadLetterExchange)
                .with(properties.getDeadLetterRoutingKey());
    }

    @Bean
    public Jackson2JsonMessageConverter medicationReminderMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
