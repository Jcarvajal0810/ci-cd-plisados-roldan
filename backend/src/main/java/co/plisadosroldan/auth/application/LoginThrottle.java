package co.plisadosroldan.auth.application;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Blocks logins for an email + client IP after consecutive failures (FR-021, research R7). In
 * memory: there is one backend instance and one admin.
 */
@Component
public class LoginThrottle {

  static final int MAX_FAILURES = 5;
  static final Duration BLOCK = Duration.ofMinutes(15);

  private final Clock clock;
  private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();

  public LoginThrottle(Clock clock) {
    this.clock = clock;
  }

  /** Seconds the key is still blocked for; 0 when logins are allowed. */
  public long secondsBlocked(String email, String clientIp) {
    Attempts current = attempts.get(key(email, clientIp));
    if (current == null || current.blockedUntil() == null) {
      return 0;
    }
    long seconds = Duration.between(clock.instant(), current.blockedUntil()).toSeconds();
    return Math.max(seconds, 0);
  }

  public void recordFailure(String email, String clientIp) {
    attempts.compute(
        key(email, clientIp),
        (k, previous) -> {
          int failures = (previous == null || isExpired(previous) ? 0 : previous.failures()) + 1;
          Instant blockedUntil = failures >= MAX_FAILURES ? clock.instant().plus(BLOCK) : null;
          return new Attempts(failures, blockedUntil);
        });
  }

  public void recordSuccess(String email, String clientIp) {
    attempts.remove(key(email, clientIp));
  }

  /** Forgets every attempt (used by tests and safe to call at any time). */
  public void clear() {
    attempts.clear();
  }

  private boolean isExpired(Attempts previous) {
    return previous.blockedUntil() != null && !clock.instant().isBefore(previous.blockedUntil());
  }

  private static String key(String email, String clientIp) {
    return email.trim().toLowerCase(Locale.ROOT) + "|" + clientIp;
  }

  private record Attempts(int failures, Instant blockedUntil) {}
}
