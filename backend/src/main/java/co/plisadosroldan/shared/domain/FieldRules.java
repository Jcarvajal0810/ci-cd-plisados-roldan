package co.plisadosroldan.shared.domain;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Collects field violations for domain objects and throws them together, so the admin sees every
 * problem at once. Messages are in Spanish because they reach the owner's form.
 */
public final class FieldRules {

  private final Map<String, String> errors = new LinkedHashMap<>();

  /** Trimmed text; records an error when blank or longer than {@code max}. */
  public String required(String field, String value, int max) {
    String trimmed = value == null ? "" : value.trim();
    if (trimmed.isEmpty()) {
      errors.putIfAbsent(field, "Este campo es obligatorio");
    } else if (trimmed.length() > max) {
      errors.putIfAbsent(field, "Máximo " + max + " caracteres");
    }
    return trimmed;
  }

  /** Trimmed text or {@code null} when blank; records an error when longer than {@code max}. */
  public String optional(String field, String value, int max) {
    if (value == null || value.isBlank()) {
      return null;
    }
    String trimmed = value.trim();
    if (trimmed.length() > max) {
      errors.putIfAbsent(field, "Máximo " + max + " caracteres");
    }
    return trimmed;
  }

  public void check(boolean valid, String field, String message) {
    if (!valid) {
      errors.putIfAbsent(field, message);
    }
  }

  /**
   * @throws DomainValidationException when any rule failed
   */
  public void validate() {
    if (!errors.isEmpty()) {
      throw new DomainValidationException(errors);
    }
  }
}
