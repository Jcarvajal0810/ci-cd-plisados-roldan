package co.plisadosroldan.testimonial.api;

import static co.plisadosroldan.support.Fixtures.insertTestimonial;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.plisadosroldan.support.ContractIntegrationTest;
import co.plisadosroldan.support.TestImages;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

/** US4: the owner manages testimonials and their single optional photo. */
class AdminTestimonialApiIT extends ContractIntegrationTest {

  private static final String INPUT =
      """
      {"clientName":"Laura Gómez","company":"Marca Aliada",
       "quote":"Los plisados quedaron perfectos y a tiempo.","featured":true}
      """;

  @Test
  void createUpdateAndDelete() throws Exception {
    String location =
        api.perform(
                post("/api/admin/testimonials")
                    .with(asAdmin())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(INPUT))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.featured").value(true))
            .andExpect(jsonPath("$.published").value(false))
            .andReturn()
            .getResponse()
            .getHeader("Location");

    api.perform(
            put(location)
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content(INPUT.replace("Laura Gómez", "Laura G.")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.clientName").value("Laura G."));

    api.perform(delete(location).with(asAdmin())).andExpect(status().isNoContent());
    api.perform(get(location).with(asAdmin())).andExpect(status().isNotFound());
  }

  @Test
  void publicationFeaturedAndOrderReachTheHomePage() throws Exception {
    long first = insertTestimonial(jdbc, "Uno", null, 1, true, false);
    long second = insertTestimonial(jdbc, "Dos", null, 2, true, true);

    api.perform(
            put("/api/admin/testimonials/" + first + "/publication")
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"published\":true}"))
        .andExpect(status().isNoContent());
    api.perform(
            put("/api/admin/testimonials/order")
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"ids\":[" + second + "," + first + "]}"))
        .andExpect(status().isNoContent());

    api.perform(get("/api/public/home"))
        .andExpect(jsonPath("$.featuredTestimonials[*].clientName").value(contains("Dos", "Uno")));
  }

  @Test
  void photoCanBeSetReplacedAndRemoved() throws Exception {
    long id = insertTestimonial(jdbc, "Laura", null, 1, false, true);
    String photo = "/api/admin/testimonials/" + id + "/photo";

    upload(photo).andExpect(status().isOk()).andExpect(jsonPath("$.alt").value("Laura"));
    upload(photo).andExpect(status().isOk());
    api.perform(get("/api/public/testimonials")).andExpect(jsonPath("$[0].photo").exists());
    org.assertj.core.api.Assertions.assertThat(
            jdbc.sql("SELECT count(*) FROM image").query(Long.class).single())
        .as("the replaced photo row is gone")
        .isEqualTo(1);

    api.perform(delete(photo).with(asAdmin())).andExpect(status().isNoContent());
    api.perform(get("/api/public/testimonials")).andExpect(jsonPath("$[0].photo").doesNotExist());
  }

  @Test
  void listIncludesDrafts() throws Exception {
    insertTestimonial(jdbc, "Borrador", null, 1, false, false);

    api.perform(get("/api/admin/testimonials").with(asAdmin()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].id").isNumber());
  }

  @Test
  void requiresAuthentication() throws Exception {
    // Plain MockMvc: the contract documents 401 globally, not per operation.
    mockMvc.perform(get("/api/admin/testimonials")).andExpect(status().isUnauthorized());
  }

  private org.springframework.test.web.servlet.ResultActions upload(String path) throws Exception {
    return api.perform(
        multipart(HttpMethod.PUT, path)
            .file(
                new MockMultipartFile(
                    "file", "foto.jpg", MediaType.IMAGE_JPEG_VALUE, TestImages.jpeg(600, 600)))
            .with(asAdmin()));
  }
}
