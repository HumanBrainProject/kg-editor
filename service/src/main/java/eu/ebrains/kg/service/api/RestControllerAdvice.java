package eu.ebrains.kg.service.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@ControllerAdvice(annotations = RestController.class)
public class RestControllerAdvice {

    @ExceptionHandler({WebClientResponseException.Unauthorized.class})
    protected ResponseEntity<?> unauthorized(RuntimeException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @ExceptionHandler({WebClientResponseException.Forbidden.class})
    protected ResponseEntity<?> forbidden(RuntimeException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @ExceptionHandler({WebClientResponseException.InternalServerError.class})
    protected ResponseEntity<?> internalServerError(RuntimeException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @ExceptionHandler({WebClientResponseException.NotFound.class})
    protected ResponseEntity<?> notFound(RuntimeException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @ExceptionHandler({IllegalArgumentException.class})
    protected ResponseEntity<?> illegalArgument(RuntimeException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}
