package org.example.seniorplus.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.queue.QueueClient;
import com.azure.storage.queue.QueueClientBuilder;
import com.azure.storage.queue.models.QueueMessageItem;
import com.azure.core.util.Context;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.util.UUID;

@Service
public class AzureStorageService {

    private final String connectionString;
    private final String containerName;
    private final String queueName;

    public AzureStorageService(@Value("${azure.storage.connection-string:}") String connectionString,
                               @Value("${azure.storage.container-name:anexos-seniorplus}") String containerName,
                               @Value("${azure.storage.queue-name:lembretes-medicacao}") String queueName) {
        this.connectionString = connectionString;
        this.containerName = containerName;
        this.queueName = queueName;
    }

    public boolean isConfigured() {
        return connectionString != null && !connectionString.isBlank();
    }

    public String uploadArquivo(MultipartFile arquivo) throws IOException {
        requireConfiguration();
        BlobContainerClient containerClient = new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient()
                .getBlobContainerClient(containerName);

        String nomeUnico = UUID.randomUUID().toString();
        BlobClient blobClient = containerClient.getBlobClient(nomeUnico);
        try (InputStream inputStream = arquivo.getInputStream()) {
            blobClient.upload(inputStream, arquivo.getSize(), true);
        }
        return blobClient.getBlobUrl();
    }

    public void enfileirarLembrete(String payloadJson) {
        queueClient().sendMessage(payloadJson);
    }

    public Iterable<QueueMessageItem> receberLembretes() {
        return queueClient().receiveMessages(10, Duration.ofMinutes(5), Duration.ofSeconds(15), Context.NONE);
    }

    public void confirmarLembrete(QueueMessageItem message) {
        queueClient().deleteMessage(message.getMessageId(), message.getPopReceipt());
    }

    private QueueClient queueClient() {
        requireConfiguration();
        return new QueueClientBuilder()
                .connectionString(connectionString)
                .queueName(queueName)
                .buildClient();
    }

    private void requireConfiguration() {
        if (!isConfigured()) {
            throw new IllegalStateException("Azure Storage connection string is not configured");
        }
    }
}