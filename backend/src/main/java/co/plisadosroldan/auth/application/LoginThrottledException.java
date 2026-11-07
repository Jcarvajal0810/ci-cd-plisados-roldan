package co.plisadosroldan.auth.application;

/** Too many consecutive failed logins. HTTP 429 with {@code Retry-After}. */
public class LoginThrottledException extends RuntimeException {

  private final long retryAfterSeconds;

  public LoginThrottledException(long retryAfterSeconds) {
    super("Too many failed login attempts");
    this.retryAfterSeconds = retryAfterSeconds;
  }

  public long retryAfterSeconds() {
    return retryAfterSeconds;
  }
}
