package co.plisadosroldan.auth.application;

import static org.assertj.core.api.Assertions.assertThat;

import co.plisadosroldan.support.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

/** The first admin is created from configuration only when none exists (research R6). */
class AdminSeederIT extends IntegrationTest {

  @Autowired private AdminSeeder seeder;
  @Autowired private PasswordEncoder passwordEncoder;

  @Test
  void createsTheAdminWithAHashedPasswordWhenNoneExists() {
    seeder.seed("Owner@Example.com", "una-clave-segura");

    var row =
        jdbc.sql("SELECT email, password_hash FROM admin_user")
            .query((rs, n) -> new String[] {rs.getString(1), rs.getString(2)})
            .single();
    assertThat(row[0]).isEqualTo("Owner@Example.com");
    assertThat(row[1]).startsWith("$2").isNotEqualTo("una-clave-segura");
    assertThat(passwordEncoder.matches("una-clave-segura", row[1])).isTrue();
  }

  @Test
  void doesNothingWhenAnAdminAlreadyExists() {
    seeder.seed("first@example.com", "clave-uno");
    seeder.seed("second@example.com", "clave-dos");

    assertThat(adminEmails()).containsExactly("first@example.com");
  }

  @Test
  void createsNothingWhenCredentialsAreMissing() {
    seeder.seed(null, null);
    seeder.seed("  ", "clave");

    assertThat(adminEmails()).isEmpty();
  }

  private java.util.List<String> adminEmails() {
    return jdbc.sql("SELECT email FROM admin_user").query(String.class).list();
  }
}
