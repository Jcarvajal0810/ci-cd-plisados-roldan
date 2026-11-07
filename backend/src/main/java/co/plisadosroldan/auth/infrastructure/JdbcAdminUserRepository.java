package co.plisadosroldan.auth.infrastructure;

import co.plisadosroldan.auth.domain.AdminUser;
import co.plisadosroldan.auth.domain.AdminUserRepository;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
class JdbcAdminUserRepository implements AdminUserRepository {

  private final JdbcClient jdbc;

  JdbcAdminUserRepository(JdbcClient jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public Optional<AdminUser> findByEmailIgnoreCase(String email) {
    return jdbc.sql("SELECT id, email, password_hash FROM admin_user WHERE lower(email) = lower(?)")
        .param(email)
        .query((rs, n) -> new AdminUser(rs.getLong(1), rs.getString(2), rs.getString(3)))
        .optional();
  }

  @Override
  public long count() {
    return jdbc.sql("SELECT count(*) FROM admin_user").query(Long.class).single();
  }

  @Override
  public void insert(String email, String passwordHash) {
    jdbc.sql("INSERT INTO admin_user (email, password_hash) VALUES (?, ?)")
        .params(email, passwordHash)
        .update();
  }

  @Override
  public void recordLogin(long id, Instant at) {
    jdbc.sql("UPDATE admin_user SET last_login_at = ? WHERE id = ?")
        .params(Timestamp.from(at), id)
        .update();
  }
}
