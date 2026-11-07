package co.plisadosroldan.shared.domain;

/** The requested order does not contain exactly the existing items. Mapped to HTTP 409. */
public class ReorderMismatchException extends RuntimeException {

  public ReorderMismatchException() {
    super("The order must list every existing item exactly once");
  }
}
