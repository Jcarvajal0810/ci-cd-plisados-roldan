package co.plisadosroldan.testimonial.api;

import static co.plisadosroldan.support.Fixtures.insertImage;
import static co.plisadosroldan.support.Fixtures.insertTestimonial;
import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.plisadosroldan.support.ContractIntegrationTest;
import java.util.UUID;
import org.junit.jupiter.api.Test;

/** US3: client testimonials (spec US3 acceptance scenario 3). */
class PublicTestimonialApiIT extends ContractIntegrationTest {

  @Test
  void listsOnlyPublishedTestimonialsInOrder() throws Exception {
    insertTestimonial(jdbc, "Laura Gómez", null, 2, false, true);
    long withPhoto = insertTestimonial(jdbc, "Andrés Ruiz", "Marca Aliada", 1, true, true);
    insertTestimonial(jdbc, "Borrador", null, 3, false, false);
    UUID key = UUID.randomUUID();
    long image = insertImage(jdbc, key, 400, 400, null);
    jdbc.sql("UPDATE testimonial SET photo_image_id = ? WHERE id = ?")
        .params(image, withPhoto)
        .update();

    api.perform(get("/api/public/testimonials"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].clientName").value(contains("Andrés Ruiz", "Laura Gómez")))
        .andExpect(jsonPath("$[0].company").value("Marca Aliada"))
        .andExpect(jsonPath("$[0].quote").isString())
        .andExpect(jsonPath("$[0].photo.alt").value("Andrés Ruiz"))
        .andExpect(jsonPath("$[1].company").isEmpty())
        .andExpect(jsonPath("$[1].photo").doesNotExist());
  }
}
