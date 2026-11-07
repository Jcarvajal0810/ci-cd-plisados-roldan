package co.plisadosroldan.auth.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.plisadosroldan.auth.application.AdminSeeder;
import co.plisadosroldan.auth.application.LoginThrottle;
import co.plisadosroldan.support.ContractIntegrationTest;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;

/** US2: session login, logout, current admin, CSRF and throttling (FR-013, FR-021). */
class AuthApiIT extends ContractIntegrationTest {

  private static final String EMAIL = "owner@example.com";
  private static final String PASSWORD = "clave-correcta";

  @Autowired private AdminSeeder seeder;
  @Autowired private LoginThrottle throttle;

  @BeforeEach
  void createAdmin() {
    seeder.seed(EMAIL, PASSWORD);
    throttle.clear();
  }

  @Test
  void validLoginCreatesASessionAndRecordsLastLogin() throws Exception {
    MockHttpSession session = login(EMAIL, PASSWORD);

    api.perform(get("/api/auth/me").session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value(EMAIL));
    Instant lastLogin =
        jdbc.sql("SELECT last_login_at FROM admin_user").query(Instant.class).single();
    assertThat(lastLogin).isNotNull();
  }

  @Test
  void emailIsMatchedIgnoringCase() throws Exception {
    api.perform(loginRequest("OWNER@example.com", PASSWORD)).andExpect(status().isNoContent());
  }

  @Test
  void wrongPasswordAndUnknownEmailGetTheSameGeneric401() throws Exception {
    String wrongPassword =
        api.perform(loginRequest(EMAIL, "otra"))
            .andExpect(status().isUnauthorized())
            .andReturn()
            .getResponse()
            .getContentAsString();
    String unknownEmail =
        api.perform(loginRequest("nadie@example.com", "otra"))
            .andExpect(status().isUnauthorized())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertThat(wrongPassword).isEqualTo(unknownEmail);
  }

  @Test
  void sixthConsecutiveFailureIsThrottled() throws Exception {
    for (int i = 0; i < 5; i++) {
      api.perform(loginRequest(EMAIL, "otra")).andExpect(status().isUnauthorized());
    }
    api.perform(loginRequest(EMAIL, PASSWORD))
        .andExpect(status().isTooManyRequests())
        .andExpect(header().exists("Retry-After"));
  }

  @Test
  void meIsUnauthorizedWithoutSessionAndIssuesTheCsrfCookie() throws Exception {
    api.perform(get("/api/auth/me"))
        .andExpect(status().isUnauthorized())
        .andExpect(cookie().exists("XSRF-TOKEN"));
  }

  @Test
  void adminWritesWithoutCsrfTokenAreForbidden() throws Exception {
    MockHttpSession session = login(EMAIL, PASSWORD);

    mockMvc
        .perform(
            post("/api/admin/offerings")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
        .andExpect(status().isForbidden());
  }

  @Test
  void loginWithoutCsrfTokenIsForbidden() throws Exception {
    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(credentials(EMAIL, PASSWORD)))
        .andExpect(status().isForbidden());
  }

  @Test
  void logoutEndsTheSession() throws Exception {
    MockHttpSession session = login(EMAIL, PASSWORD);

    api.perform(post("/api/auth/logout").session(session).with(xsrf()))
        .andExpect(status().isNoContent());
    assertThat(session.isInvalid()).isTrue();
  }

  private MockHttpSession login(String email, String password) throws Exception {
    return (MockHttpSession)
        api.perform(loginRequest(email, password))
            .andExpect(status().isNoContent())
            .andReturn()
            .getRequest()
            .getSession(false);
  }

  private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder loginRequest(
      String email, String password) throws Exception {
    return post("/api/auth/login")
        .with(xsrf())
        .contentType(MediaType.APPLICATION_JSON)
        .content(credentials(email, password));
  }

  private static String credentials(String email, String password) {
    return "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password);
  }
}
