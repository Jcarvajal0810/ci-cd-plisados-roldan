package co.plisadosroldan.support;

import jakarta.servlet.http.Cookie;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Base for integration tests: full Spring context, real PostgreSQL 17 (Testcontainers), MockMvc,
 * and a temporary media directory. The schema comes from the database component's migrations
 * ({@code ../database/migrations}), exactly as deployed. Before each test the database is reset to
 * the seed state (all tables truncated, then {@code V2__seed.sql} re-applied).
 */
@SpringBootTest(properties = "spring.flyway.locations=filesystem:" + IntegrationTest.MIGRATIONS)
@AutoConfigureMockMvc
@Import(IntegrationTest.Containers.class)
public abstract class IntegrationTest {

  /** Migrations owned by the database component, relative to the backend directory. */
  static final String MIGRATIONS = "../database/migrations";

  private static final Path MEDIA_ROOT = createMediaRoot();

  @Autowired protected MockMvc mockMvc;
  @Autowired protected JdbcClient jdbc;
  @Autowired private DataSource dataSource;

  @DynamicPropertySource
  static void mediaRoot(DynamicPropertyRegistry registry) {
    registry.add("app.media-root", MEDIA_ROOT::toString);
  }

  @BeforeEach
  void resetDatabaseToSeed() throws Exception {
    jdbc.sql(
            """
            TRUNCATE offering_image, success_case_image, success_case_offering,
                     testimonial, success_case, offering, image,
                     business_profile, admin_user
            RESTART IDENTITY CASCADE
            """)
        .update();
    try (var connection = dataSource.getConnection()) {
      ScriptUtils.executeSqlScript(
          connection,
          new EncodedResource(
              new FileSystemResource(Path.of(MIGRATIONS, "V2__seed.sql")), StandardCharsets.UTF_8));
    }
  }

  /**
   * CSRF exactly as the Angular app does it: read the {@code XSRF-TOKEN} cookie from a GET and echo
   * it in {@code X-XSRF-TOKEN}. (Spring's {@code csrf()} post-processor is avoided because it swaps
   * the token repository inside the shared filter and leaks into other tests.)
   */
  protected RequestPostProcessor xsrf() throws Exception {
    Cookie token =
        mockMvc
            .perform(MockMvcRequestBuilders.get("/api/public/profile"))
            .andReturn()
            .getResponse()
            .getCookie("XSRF-TOKEN");
    if (token == null) {
      throw new IllegalStateException("The backend did not issue an XSRF-TOKEN cookie");
    }
    return request -> {
      Cookie[] existing = request.getCookies() == null ? new Cookie[0] : request.getCookies();
      Cookie[] cookies = java.util.Arrays.copyOf(existing, existing.length + 1);
      cookies[existing.length] = token;
      request.setCookies(cookies);
      request.addHeader("X-XSRF-TOKEN", token.getValue());
      return request;
    };
  }

  protected static Path mediaRoot() {
    return MEDIA_ROOT;
  }

  private static Path createMediaRoot() {
    try {
      return Files.createTempDirectory("plisados-media-test");
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  @TestConfiguration(proxyBeanMethods = false)
  static class Containers {
    @Bean
    @ServiceConnection
    PostgreSQLContainer postgres() {
      return new PostgreSQLContainer(DockerImageName.parse("postgres:17"));
    }
  }
}
