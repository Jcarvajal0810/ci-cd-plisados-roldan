package co.plisadosroldan.shared.api;

import co.plisadosroldan.auth.application.LoginThrottledException;
import co.plisadosroldan.media.domain.GalleryFullException;
import co.plisadosroldan.media.domain.ImageTooLargeException;
import co.plisadosroldan.media.domain.UnsupportedImageException;
import co.plisadosroldan.shared.domain.DomainValidationException;
import co.plisadosroldan.shared.domain.NotFoundException;
import co.plisadosroldan.shared.domain.ReorderMismatchException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Maps exceptions to RFC 9457 Problem Details (research R14). Internal details never reach the
 * client; unexpected errors are logged and answered with a generic 500.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(NotFoundException.class)
  ProblemDetail notFound(NotFoundException e) {
    return problem(HttpStatus.NOT_FOUND, "No encontrado", null);
  }

  @ExceptionHandler(ReorderMismatchException.class)
  ProblemDetail reorderMismatch(ReorderMismatchException e) {
    return problem(
        HttpStatus.CONFLICT,
        "Orden inválido",
        "El orden debe incluir cada elemento existente una sola vez");
  }

  @ExceptionHandler(UnsupportedImageException.class)
  ProblemDetail unsupportedImage(UnsupportedImageException e) {
    return problem(HttpStatus.BAD_REQUEST, "Imagen inválida", "Formato no soportado");
  }

  @ExceptionHandler(GalleryFullException.class)
  ProblemDetail galleryFull(GalleryFullException e) {
    return problem(HttpStatus.CONFLICT, "Galería llena", e.getMessage());
  }

  @ExceptionHandler(AuthenticationException.class)
  ProblemDetail badCredentials(AuthenticationException e) {
    return problem(
        HttpStatus.UNAUTHORIZED, "Credenciales inválidas", "Correo o contraseña incorrectos");
  }

  @ExceptionHandler(LoginThrottledException.class)
  ResponseEntity<ProblemDetail> throttled(LoginThrottledException e) {
    ProblemDetail body =
        problem(
            HttpStatus.TOO_MANY_REQUESTS,
            "Demasiados intentos",
            "Demasiados intentos, intenta en 15 minutos");
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header(HttpHeaders.RETRY_AFTER, Long.toString(e.retryAfterSeconds()))
        .body(body);
  }

  @ExceptionHandler(DomainValidationException.class)
  ProblemDetail domainValidation(DomainValidationException e) {
    ProblemDetail body =
        problem(HttpStatus.BAD_REQUEST, "Datos inválidos", "Revisa los campos marcados");
    body.setProperty("errors", e.errors());
    return body;
  }

  @ExceptionHandler(ImageTooLargeException.class)
  ProblemDetail imageTooLarge(ImageTooLargeException e) {
    return problem(HttpStatus.PAYLOAD_TOO_LARGE, "Archivo muy grande", "El archivo supera 10 MB");
  }

  @ExceptionHandler(Exception.class)
  ProblemDetail unexpected(Exception e) {
    log.error("Unexpected error", e);
    return problem(HttpStatus.INTERNAL_SERVER_ERROR, "Error inesperado", null);
  }

  @Override
  protected ResponseEntity<Object> handleMaxUploadSizeExceededException(
      MaxUploadSizeExceededException ex,
      HttpHeaders headers,
      HttpStatusCode status,
      WebRequest request) {
    ProblemDetail body =
        problem(HttpStatus.PAYLOAD_TOO_LARGE, "Archivo muy grande", "El archivo supera 10 MB");
    return handleExceptionInternal(ex, body, headers, HttpStatus.PAYLOAD_TOO_LARGE, request);
  }

  @Override
  protected ResponseEntity<Object> handleMethodArgumentNotValid(
      MethodArgumentNotValidException ex,
      HttpHeaders headers,
      HttpStatusCode status,
      WebRequest request) {
    Map<String, String> errors = new LinkedHashMap<>();
    ex.getBindingResult()
        .getFieldErrors()
        .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
    ProblemDetail body =
        problem(HttpStatus.BAD_REQUEST, "Datos inválidos", "Revisa los campos marcados");
    body.setProperty("errors", errors);
    return handleExceptionInternal(ex, body, headers, HttpStatus.BAD_REQUEST, request);
  }

  private static ProblemDetail problem(HttpStatus status, String title, String detail) {
    ProblemDetail problem = ProblemDetail.forStatus(status);
    problem.setTitle(title);
    problem.setDetail(detail);
    return problem;
  }
}
