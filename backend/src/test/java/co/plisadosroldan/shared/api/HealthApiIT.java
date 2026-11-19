package co.plisadosroldan.shared.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.plisadosroldan.support.ContractIntegrationTest;
import org.junit.jupiter.api.Test;

/** The health endpoint is public, checks the database and reports the deployed version. */
class HealthApiIT extends ContractIntegrationTest {

  @Test
  void reportsOkWithLocalVersion() throws Exception {
    api.perform(get("/api/public/health"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("ok"))
        .andExpect(jsonPath("$.version").value("local"))
        .andExpect(jsonPath("$.component").value("api"));
  }
}
