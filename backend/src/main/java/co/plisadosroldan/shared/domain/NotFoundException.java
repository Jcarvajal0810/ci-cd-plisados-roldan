package co.plisadosroldan.shared.domain;

/** The requested item does not exist (or is not published, for public reads). HTTP 404. */
public class NotFoundException extends RuntimeException {

  public NotFoundException(String what, Object key) {
    super(what + " not found: " + key);
  }
}
