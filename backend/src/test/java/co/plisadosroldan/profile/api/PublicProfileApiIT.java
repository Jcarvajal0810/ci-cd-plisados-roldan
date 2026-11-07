package co.plisadosroldan.profile.api;

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.plisadosroldan.support.ContractIntegrationTest;
import org.junit.jupiter.api.Test;

/** US1: business information for Nosotros, Contacto and every WhatsApp button (FR-007). */
class PublicProfileApiIT extends ContractIntegrationTest {

  @Test
  void returnsTheSeededBusinessProfile() throws Exception {
    api.perform(get("/api/public/profile"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.businessName").value("Plisados Roldán"))
        .andExpect(jsonPath("$.slogan").value("Creando ando, soñando alto"))
        .andExpect(jsonPath("$.aboutText", startsWith("Plisados Roldán es una microempresa")))
        .andExpect(jsonPath("$.whatsappNumber").value("573116254705"))
        .andExpect(jsonPath("$.locationText").value("Itagüí, Antioquia, Colombia"))
        .andExpect(jsonPath("$.scheduleText").isString());
  }
}
