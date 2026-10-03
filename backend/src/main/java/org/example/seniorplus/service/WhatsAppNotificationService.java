package org.example.seniorplus.service;

import lombok.extern.slf4j.Slf4j;
import org.example.seniorplus.config.MedicationReminderRabbitProperties;
import org.example.seniorplus.domain.MedicationReminderDelivery;
import org.example.seniorplus.domain.Idoso;
import org.example.seniorplus.domain.Medicamento;
import org.example.seniorplus.dto.MedicationReminderMessage;
import org.example.seniorplus.repository.IdosoRepository;
import org.example.seniorplus.repository.MedicationReminderDeliveryRepository;
import org.example.seniorplus.repository.MedicamentoRepository;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.core.MessagePostProcessor;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.client.RestTemplate;

import java.time.LocalTime;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class WhatsAppNotificationService {

    private final MedicamentoRepository medicamentoRepository;
    private final IdosoRepository idosoRepository;
    private final RestTemplate restTemplate;
    private final RabbitTemplate rabbitTemplate;
    private final MedicationReminderDeliveryRepository deliveryRepository;
    private final MedicationReminderRabbitProperties rabbitProperties;
    private static final String API_URL = "https://api.callmebot.com/whatsapp.php";
    private final Set<String> scheduledReminderKeys = ConcurrentHashMap.newKeySet();
    private final Map<String, MedicationReminderMessage> pendingPublications = new ConcurrentHashMap<>();
    private LocalDate scheduledKeyDate;

    public WhatsAppNotificationService(MedicamentoRepository medicamentoRepository,
                                       IdosoRepository idosoRepository,
                                       RestTemplate restTemplate,
                                       RabbitTemplate rabbitTemplate,
                                       MedicationReminderDeliveryRepository deliveryRepository,
                                       MedicationReminderRabbitProperties rabbitProperties) {
        this.medicamentoRepository = medicamentoRepository;
        this.idosoRepository = idosoRepository;
        this.restTemplate = restTemplate;
        this.rabbitTemplate = rabbitTemplate;
        this.deliveryRepository = deliveryRepository;
        this.rabbitProperties = rabbitProperties;
    }

    @Scheduled(fixedRate = 60000) // Executa a cada 1 minuto
    public void verificarEEnviarMensagens() {
        ZoneId zoneId = ZoneId.systemDefault();
        LocalDate hoje = LocalDate.now(zoneId);
        LocalTime agora = LocalTime.now(zoneId).withSecond(0).withNano(0);
        resetDailyKeys(hoje);
        retryPendingPublications();
        log.debug("Checking medication schedules at {} {}", hoje, agora);

        List<Medicamento> medicamentos = medicamentoRepository.findAllWithHorariosBy();

        for (Medicamento medicamento : medicamentos) {
            try {
                List<LocalTime> proximosHorarios = medicamento.gerarHorariosNasProximas2Horas();

                for (LocalTime horario : proximosHorarios) {
                    if (horario.equals(agora)) {
                        agendarLembrete(medicamento, hoje, horario);
                        break; // Evita múltiplos envios no mesmo minuto
                    }
                }
            } catch (Exception e) {
                log.error("Error processing medication schedule", e);
            }
        }
    }

    private void resetDailyKeys(LocalDate hoje) {
        if (!hoje.equals(scheduledKeyDate)) {
            scheduledReminderKeys.clear();
            scheduledKeyDate = hoje;
        }
    }

    private void agendarLembrete(Medicamento medicamento, LocalDate data, LocalTime horario) {
        MedicationReminderMessage message = new MedicationReminderMessage(medicamento.getId(), data, horario);
        String deliveryKey = message.deliveryKey();
        if (deliveryRepository.existsById(deliveryKey) || !scheduledReminderKeys.add(deliveryKey)) {
            return;
        }

        if (rabbitProperties.isEnabled()) {
            try {
                publicar(message);
            } catch (Exception error) {
                pendingPublications.put(deliveryKey, message);
                log.error("Could not publish medication reminder {}; it will be retried", deliveryKey, error);
            }
            return;
        }

        try {
            enviarMensagem(medicamento);
            registrarEntrega(message);
        } catch (Exception error) {
            scheduledReminderKeys.remove(deliveryKey);
            log.error("Could not send medication reminder {}", deliveryKey, error);
        }
    }

    private void publicar(MedicationReminderMessage message) {
        MessagePostProcessor persistentMessage = amqpMessage -> {
            amqpMessage.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
            amqpMessage.getMessageProperties().setMessageId(message.deliveryKey());
            return amqpMessage;
        };
        rabbitTemplate.convertAndSend(rabbitProperties.getExchange(), rabbitProperties.getRoutingKey(),
                message, persistentMessage);
        pendingPublications.remove(message.deliveryKey());
        log.info("Published medication reminder {}", message.deliveryKey());
    }

    private void retryPendingPublications() {
        pendingPublications.values().forEach(message -> {
            try {
                publicar(message);
            } catch (Exception error) {
                log.warn("Medication reminder publication remains pending: {}", message.deliveryKey(), error);
            }
        });
    }

    @RabbitListener(
            queues = "${app.reminders.rabbitmq.queue:seniorplus.medication-reminders}",
            autoStartup = "${app.reminders.rabbitmq.enabled:false}")
    @Transactional
    public void consumirLembrete(MedicationReminderMessage message) {
        String deliveryKey = message.deliveryKey();
        if (deliveryRepository.existsById(deliveryKey)) {
            log.debug("Ignoring already delivered medication reminder {}", deliveryKey);
            return;
        }

        Medicamento medicamento = medicamentoRepository.findById(message.medicationId())
                .orElseThrow(() -> new IllegalStateException("Medication not found: " + message.medicationId()));
        enviarMensagem(medicamento);
        registrarEntrega(message);
        scheduledReminderKeys.add(deliveryKey);
    }

    private void registrarEntrega(MedicationReminderMessage message) {
        deliveryRepository.save(new MedicationReminderDelivery(message.deliveryKey(), message.medicationId(),
                message.scheduledDate(), message.scheduledTime(), LocalDateTime.now(ZoneId.systemDefault())));
    }

    private void enviarMensagem(Medicamento medicamento) {
        String cpf = medicamento.getCpf();
        if (cpf == null || cpf.isBlank()) {
            throw new IllegalStateException("Medication has no associated CPF");
        }

        Idoso idoso = idosoRepository.findById(cpf)
                .orElseThrow(() -> new IllegalStateException("No elderly user found for medication CPF"));
        String telefone = idoso.getTelefone();
        String apiKey = idoso.getObservacao();
        if (telefone == null || telefone.isBlank() || apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Elderly user's WhatsApp phone or API key is missing");
        }

        String mensagem = medicamento.getInstrucoes() != null && !medicamento.getInstrucoes().isBlank()
                ? medicamento.getInstrucoes()
                : "💊 *Lembrete de Medicamento!*\n" +
                "📌 *Medicamento:* " + medicamento.getNomeMedicamento() + "\n" +
                "🔔 *Não se esqueça de tomar seu remédio!*";
        String url = UriComponentsBuilder.fromUriString(API_URL)
                .queryParam("phone", telefone)
                .queryParam("text", mensagem)
                .queryParam("apikey", apiKey)
                .build()
                .encode()
                .toUriString();

        log.info("Sending medication reminder to {}", telefone);
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        log.debug("WhatsApp API response status={}", response.getStatusCode());
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("WhatsApp API returned status " + response.getStatusCode());
        }
    }
}
