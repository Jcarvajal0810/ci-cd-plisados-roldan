package co.plisadosroldan.auth.domain;

import java.time.Instant;
import java.util.Optional;

/** Persistence port for admin accounts. */
public interface AdminUserRepository {

  Optional<AdminUser> findByEmailIgnoreCase(String email);

  long count();

  void insert(String email, String passwordHash);

  void recordLogin(long id, Instant at);
}
