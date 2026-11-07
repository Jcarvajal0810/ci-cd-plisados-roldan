package co.plisadosroldan.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.plisadosroldan.support.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

/** Baseline access rules: public reads are open, every admin endpoint requires a session. */
class SecurityRulesIT extends IntegrationTest {

  @Test
  void publicReadsAreNotBlockedBySecurity() throws Exception {
    // Unknown public paths reach MVC (404), proving security did not answer 401/403 first.
    mockMvc.perform(get("/api/public/does-not-exist")).andExpect(status().isNotFound());
    mockMvc.perform(get("/media/does-not-exist.jpg")).andExpect(status().isNotFound());
    mockMvc.perform(get("/sitemap.xml")).andExpect(status().isOk());
  }

  @Test
  void adminEndpointsRequireAuthentication() throws Exception {
    mockMvc
        .perform(get("/api/admin/offerings"))
        .andExpect(status().isUnauthorized())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON));
    // With a valid CSRF token, unsafe requests still fail on authentication.
    mockMvc.perform(post("/api/admin/offerings").with(xsrf())).andExpect(status().isUnauthorized());
    mockMvc
        .perform(delete("/api/admin/offerings/1").with(xsrf()))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void anyOtherPathIsDenied() throws Exception {
    mockMvc.perform(get("/actuator/env")).andExpect(status().isUnauthorized());
  }
}
