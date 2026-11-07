package co.plisadosroldan.successcase.api;

import static co.plisadosroldan.support.Fixtures.insertSuccessCase;
import static co.plisadosroldan.support.Fixtures.offeringId;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.endsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.plisadosroldan.support.ContractIntegrationTest;
import co.plisadosroldan.support.TestImages;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

/** US4: the owner manages success cases and their galleries. */
class AdminSuccessCaseApiIT extends ContractIntegrationTest {

  private String input(boolean featured, long... offeringIds) {
    String ids =
        java.util.Arrays.stream(offeringIds)
            .mapToObj(Long::toString)
            .collect(java.util.stream.Collectors.joining(","));
    return """
        {"title":"Pasarela Colombiamoda","clientName":"Marca Aliada",
         "description":"Faldas plisadas para el desfile.","eventLabel":"Colombiamoda",
         "eventDate":"2026-07-20","featured":%s,"offeringIds":[%s]}
        """
        .formatted(featured, ids);
  }

  @Test
  void createReadUpdateDeleteWithRelatedOfferings() throws Exception {
    long plisado = offeringId(jdbc, "plisado");

    String location =
        api.perform(
                post("/api/admin/success-cases")
                    .with(asAdmin())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(input(true, plisado)))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", endsWith("/api/admin/success-cases/1")))
            .andExpect(jsonPath("$.slug").value("pasarela-colombiamoda"))
            .andExpect(jsonPath("$.featured").value(true))
            .andExpect(jsonPath("$.published").value(false))
            .andExpect(jsonPath("$.offeringIds").value(contains((int) plisado)))
            .andReturn()
            .getResponse()
            .getHeader("Location");

    long trillado = offeringId(jdbc, "trillado");
    api.perform(
            put(location)
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content(input(false, trillado)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.slug").value("pasarela-colombiamoda"))
        .andExpect(jsonPath("$.offeringIds").value(contains((int) trillado)));

    api.perform(delete(location).with(asAdmin())).andExpect(status().isNoContent());
    api.perform(get(location).with(asAdmin())).andExpect(status().isNotFound());
  }

  @Test
  void unknownOfferingIdsAre400() throws Exception {
    api.perform(
            post("/api/admin/success-cases")
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content(input(false, 999)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.offeringIds").isString());
  }

  @Test
  void publicationAndOrder() throws Exception {
    long first = insertSuccessCase(jdbc, "uno", "Uno", 1, false, false);
    long second = insertSuccessCase(jdbc, "dos", "Dos", 2, false, true);

    api.perform(
            put("/api/admin/success-cases/" + first + "/publication")
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"published\":true}"))
        .andExpect(status().isNoContent());
    api.perform(
            put("/api/admin/success-cases/order")
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"ids\":[" + second + "," + first + "]}"))
        .andExpect(status().isNoContent());

    api.perform(get("/api/public/success-cases"))
        .andExpect(jsonPath("$[*].slug").value(contains("dos", "uno")));

    api.perform(
            put("/api/admin/success-cases/order")
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"ids\":[" + first + "]}"))
        .andExpect(status().isConflict());
  }

  @Test
  void galleryFollowsTheSameUploadRules() throws Exception {
    long id = insertSuccessCase(jdbc, "uno", "Uno", 1, false, true);
    String images = "/api/admin/success-cases/" + id + "/images";

    api.perform(multipart(images).file(jpeg(TestImages.jpeg(1200, 900))).with(asAdmin()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.alt").value("Uno"));
    api.perform(multipart(images).file(jpeg(TestImages.pdfNamedAsJpeg())).with(asAdmin()))
        .andExpect(status().isBadRequest());
    api.perform(multipart(images).file(jpeg(new byte[10 * 1024 * 1024 + 1])).with(asAdmin()))
        .andExpect(status().isPayloadTooLarge());

    api.perform(get("/api/public/success-cases/uno"))
        .andExpect(jsonPath("$.images.length()").value(1));
  }

  @Test
  void requiresAuthentication() throws Exception {
    // Plain MockMvc: the contract documents 401 globally, not per operation.
    mockMvc.perform(get("/api/admin/success-cases")).andExpect(status().isUnauthorized());
  }

  private static MockMultipartFile jpeg(byte[] bytes) {
    return new MockMultipartFile("file", "foto.jpg", MediaType.IMAGE_JPEG_VALUE, bytes);
  }
}
