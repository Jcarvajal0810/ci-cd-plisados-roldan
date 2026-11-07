package co.plisadosroldan.auth.application;

import co.plisadosroldan.auth.domain.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates the owner's admin account at startup from {@code ADMIN_EMAIL}/{@code ADMIN_PASSWORD},
 * only while no admin exists. There is no public sign-up (FR-014, research R6).
 */
@Component
public class AdminSeeder implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

  private final AdminUserRepository admins;
  private final PasswordEncoder passwordEncoder;
  private final String configuredEmail;
  private final String configuredPassword;

  public AdminSeeder(
      AdminUserRepository admins,
      PasswordEncoder passwordEncoder,
      @Value("${app.admin.email:}") String configuredEmail,
      @Value("${app.admin.password:}") String configuredPassword) {
    this.admins = admins;
    this.passwordEncoder = passwordEncoder;
    this.configuredEmail = configuredEmail;
    this.configuredPassword = configuredPassword;
  }

  @Override
  public void run(ApplicationArguments args) {
    seed(configuredEmail, configuredPassword);
  }

  @Transactional
  public void seed(String email, String password) {
    if (admins.count() > 0) {
      return;
    }
    if (email == null || email.isBlank() || password == null || password.isBlank()) {
      log.warn("No admin exists and ADMIN_EMAIL/ADMIN_PASSWORD are not set; admin login disabled");
      return;
    }
    admins.insert(email.trim(), passwordEncoder.encode(password));
    log.info("Created the first admin account");
  }
}
