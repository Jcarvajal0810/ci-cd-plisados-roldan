package co.plisadosroldan.shared.domain;

import java.util.Map;

/** A domain rule was violated. HTTP 400 with field → message errors. */
public class DomainValidationException extends RuntimeException {

  private final Map<String, String> errors;

  public DomainValidationException(Map<String, String> errors) {
    super("Invalid fields: " + errors.keySet());
    this.errors = Map.copyOf(errors);
  }

  public Map<String, String> errors() {
    return errors;
  }
}
