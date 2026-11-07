package co.plisadosroldan.profile.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.plisadosroldan.support.ContractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

/** US2: the owner edits business information (FR-019). */
class AdminProfileApiIT extends ContractIntegrationTest {

  private static final String UPDATED =
      """
      {"businessName":"Plisados Roldán","slogan":"Creando ando, soñando alto",
       "aboutText":"Nueva historia del taller.","whatsappNumber":"573001112233",
       "locationText":"Itagüí, Antioquia","scheduleText":"Lunes a sábado, 9 a. m. – 6 p. m."}
      """;

  @Test
  void getAndUpdateTheProfile() throws Exception {
    api.perform(get("/api/admin/profile").with(asAdmin()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.whatsappNumber").value("573116254705"));

    api.perform(
            put("/api/admin/profile")
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content(UPDATED))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.whatsappNumber").value("573001112233"));

    api.perform(get("/api/public/profile"))
        .andExpect(jsonPath("$.whatsappNumber").value("573001112233"))
        .andExpect(jsonPath("$.aboutText").value("Nueva historia del taller."));
  }

  @Test
  void invalidWhatsappNumberIs400() throws Exception {
    // Plain MockMvc: this request breaks the contract on purpose.
    mockMvc
        .perform(
            put("/api/admin/profile")
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content(UPDATED.replace("573001112233", "311 62")))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.whatsappNumber").isString());
  }

  @Test
  void requiresAuthentication() throws Exception {
    mockMvc.perform(get("/api/admin/profile")).andExpect(status().isUnauthorized());
  }
}
