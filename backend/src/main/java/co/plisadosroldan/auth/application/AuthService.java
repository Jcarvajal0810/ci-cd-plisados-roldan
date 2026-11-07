package co.plisadosroldan.auth.application;

import co.plisadosroldan.auth.domain.AdminUserRepository;
import java.time.Clock;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Login use case: throttling, credential check and last-login bookkeeping. */
@Service
public class AuthService {

  private final AuthenticationManager authenticationManager;
  private final LoginThrottle throttle;
  private final AdminUserRepository admins;
  private final Clock clock;

  public AuthService(
      AuthenticationManager authenticationManager,
      LoginThrottle throttle,
      AdminUserRepository admins,
      Clock clock) {
    this.authenticationManager = authenticationManager;
    this.throttle = throttle;
    this.admins = admins;
    this.clock = clock;
  }

  /**
   * @throws LoginThrottledException when the email + IP is blocked
   * @throws AuthenticationException when the credentials are wrong (same error for unknown emails)
   */
  @Transactional
  public Authentication login(String email, String password, String clientIp) {
    long blocked = throttle.secondsBlocked(email, clientIp);
    if (blocked > 0) {
      throw new LoginThrottledException(blocked);
    }
    try {
      Authentication authentication =
          authenticationManager.authenticate(
              UsernamePasswordAuthenticationToken.unauthenticated(email, password));
      throttle.recordSuccess(email, clientIp);
      admins
          .findByEmailIgnoreCase(email)
          .ifPresent(admin -> admins.recordLogin(admin.id(), clock.instant()));
      return authentication;
    } catch (AuthenticationException e) {
      throttle.recordFailure(email, clientIp);
      throw e;
    }
  }
}
