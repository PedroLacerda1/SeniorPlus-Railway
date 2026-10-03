package org.example.seniorplus.service.exception;

public class ServiceOperationException extends RuntimeException {
    public ServiceOperationException(String message) {
        super(message);
    }

    public ServiceOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
