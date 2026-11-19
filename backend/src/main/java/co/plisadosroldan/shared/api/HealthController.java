package co.plisadosroldan.shared.api;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Health check for the load balancer and the pipeline. It touches the database, so "healthy" means
 * "can serve requests", and it reports the deployed version (APP_VERSION, the commit SHA).
 */
@RestController
public class HealthController {

  private final JdbcClient jdbc;
  private final String version;

  public HealthController(JdbcClient jdbc, @Value("${APP_VERSION:local}") String version) {
    this.jdbc = jdbc;
    this.version = version;
  }

  @GetMapping("/api/public/health")
  public Map<String, String> health() {
    jdbc.sql("select 1").query(Integer.class).single();
    return Map.of("status", "ok", "version", version, "component", "api");
  }
}
