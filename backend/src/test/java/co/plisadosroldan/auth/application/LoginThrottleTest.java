package co.plisadosroldan.auth.application;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class LoginThrottleTest {

  private final MutableClock clock = new MutableClock(Instant.parse("2026-11-07T10:00:00Z"));
  private final LoginThrottle throttle = new LoginThrottle(clock);

  @Test
  void blocksAfterFiveConsecutiveFailures() {
    failTimes(4);
    assertThat(throttle.secondsBlocked("owner@example.com", "1.2.3.4")).isZero();

    failTimes(1);
    assertThat(throttle.secondsBlocked("owner@example.com", "1.2.3.4")).isEqualTo(15 * 60);
  }

  @Test
  void keyIgnoresEmailCase() {
    failTimes(5);
    assertThat(throttle.secondsBlocked("OWNER@Example.com", "1.2.3.4")).isPositive();
  }

  @Test
  void otherClientsAreNotBlocked() {
    failTimes(5);
    assertThat(throttle.secondsBlocked("owner@example.com", "9.9.9.9")).isZero();
    assertThat(throttle.secondsBlocked("other@example.com", "1.2.3.4")).isZero();
  }

  @Test
  void successResetsTheCounter() {
    failTimes(4);
    throttle.recordSuccess("owner@example.com", "1.2.3.4");
    failTimes(4);
    assertThat(throttle.secondsBlocked("owner@example.com", "1.2.3.4")).isZero();
  }

  @Test
  void blockExpiresAfterFifteenMinutes() {
    failTimes(5);
    clock.advance(Duration.ofMinutes(14));
    assertThat(throttle.secondsBlocked("owner@example.com", "1.2.3.4")).isEqualTo(60);

    clock.advance(Duration.ofMinutes(1));
    assertThat(throttle.secondsBlocked("owner@example.com", "1.2.3.4")).isZero();
  }

  private void failTimes(int times) {
    for (int i = 0; i < times; i++) {
      throttle.recordFailure("owner@example.com", "1.2.3.4");
    }
  }

  private static final class MutableClock extends Clock {
    private Instant now;

    MutableClock(Instant start) {
      this.now = start;
    }

    void advance(Duration duration) {
      now = now.plus(duration);
    }

    @Override
    public ZoneOffset getZone() {
      return ZoneOffset.UTC;
    }

    @Override
    public Clock withZone(java.time.ZoneId zone) {
      return this;
    }

    @Override
    public Instant instant() {
      return now;
    }
  }
}
