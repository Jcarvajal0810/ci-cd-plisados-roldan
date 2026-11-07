package co.plisadosroldan.profile.api;

import static co.plisadosroldan.support.Fixtures.insertSuccessCase;
import static co.plisadosroldan.support.Fixtures.insertTestimonial;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.plisadosroldan.support.ContractIntegrationTest;
import org.junit.jupiter.api.Test;

/** Everything the home page needs in one call (contract schema HomeView). */
class PublicHomeApiIT extends ContractIntegrationTest {

  @Test
  void returnsHomeViewWithSeedData() throws Exception {
    api.perform(get("/api/public/home"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.profile.slogan").value("Creando ando, soñando alto"))
        .andExpect(jsonPath("$.offerings", hasSize(6)))
        .andExpect(jsonPath("$.offerings[0].slug").value("plisado"))
        .andExpect(jsonPath("$.featuredSuccessCases", hasSize(0)))
        .andExpect(jsonPath("$.featuredTestimonials", hasSize(0)));
  }

  @Test
  void featuresOnlyItemsThatAreFeaturedAndPublishedInOrder() throws Exception {
    insertSuccessCase(jdbc, "segundo", "Segundo", 2, true, true);
    insertSuccessCase(jdbc, "primero", "Primero", 1, true, true);
    insertSuccessCase(jdbc, "no-destacado", "No destacado", 3, false, true);
    insertSuccessCase(jdbc, "borrador", "Borrador", 4, true, false);
    insertTestimonial(jdbc, "Destacada", null, 1, true, true);
    insertTestimonial(jdbc, "Normal", null, 2, false, true);
    insertTestimonial(jdbc, "Oculta", null, 3, true, false);

    api.perform(get("/api/public/home"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.featuredSuccessCases[*].slug").value(contains("primero", "segundo")))
        .andExpect(jsonPath("$.featuredTestimonials[*].clientName").value(contains("Destacada")));
  }
}
