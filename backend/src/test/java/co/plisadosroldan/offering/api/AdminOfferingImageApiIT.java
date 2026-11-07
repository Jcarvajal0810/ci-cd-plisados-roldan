package co.plisadosroldan.offering.api;

import static co.plisadosroldan.support.Fixtures.offeringId;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.plisadosroldan.support.ContractIntegrationTest;
import co.plisadosroldan.support.TestImages;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.mock.web.MockPart;

/** US2: offering photo galleries (FR-017, FR-018). */
class AdminOfferingImageApiIT extends ContractIntegrationTest {

  private long plisado;
  private String images;

  @BeforeEach
  void setUp() {
    plisado = offeringId(jdbc, "plisado");
    images = "/api/admin/offerings/" + plisado + "/images";
  }

  @Test
  void uploadAddsAnImageVisibleOnThePublicPage() throws Exception {
    // Plain MockMvc: it exposes multipart text fields as request parameters, which the contract
    // validator misreads as query parameters. The result is contract-checked via the public GET.
    mockMvc
        .perform(
            multipart(images)
                .file(jpeg("falda.jpg", TestImages.jpeg(2000, 1500)))
                .part(
                    new MockPart("altText", "Falda plisada azul".getBytes(StandardCharsets.UTF_8)))
                .with(asAdmin()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.url", startsWith("/media/")))
        .andExpect(jsonPath("$.alt").value("Falda plisada azul"))
        .andExpect(jsonPath("$.width").value(1600));

    api.perform(get("/api/public/offerings/plisado"))
        .andExpect(jsonPath("$.images[0].alt").value("Falda plisada azul"));
  }

  @Test
  void filesOverTenMegabytesAre413() throws Exception {
    byte[] tooLarge = new byte[10 * 1024 * 1024 + 1];

    api.perform(multipart(images).file(jpeg("grande.jpg", tooLarge)).with(asAdmin()))
        .andExpect(status().isPayloadTooLarge());
  }

  @Test
  void nonImagesAre400() throws Exception {
    api.perform(
            multipart(images).file(jpeg("doc.jpg", TestImages.pdfNamedAsJpeg())).with(asAdmin()))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value("Formato no soportado"));
  }

  @Test
  void thirteenthImageIs409() throws Exception {
    for (int i = 0; i < 12; i++) {
      api.perform(multipart(images).file(jpeg("f.jpg", TestImages.jpeg(100, 80))).with(asAdmin()))
          .andExpect(status().isCreated());
    }
    api.perform(multipart(images).file(jpeg("f.jpg", TestImages.jpeg(100, 80))).with(asAdmin()))
        .andExpect(status().isConflict());
  }

  @Test
  void reorderEditAltAndDelete() throws Exception {
    long first = upload();
    long second = upload();

    api.perform(
            put(images + "/order")
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"ids\":[" + second + "," + first + "]}"))
        .andExpect(status().isNoContent());
    api.perform(get("/api/public/offerings/plisado"))
        .andExpect(jsonPath("$.images[0].id").value(second));

    api.perform(
            patch(images + "/" + first)
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"altText\":\"Detalle del pliegue\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.alt").value("Detalle del pliegue"));

    api.perform(delete(images + "/" + first).with(asAdmin())).andExpect(status().isNoContent());
    api.perform(get("/api/public/offerings/plisado"))
        .andExpect(jsonPath("$.images.length()").value(1));
  }

  @Test
  void imagesOfAnotherOfferingAreNotFound() throws Exception {
    long image = upload();
    long trillado = offeringId(jdbc, "trillado");

    api.perform(delete("/api/admin/offerings/" + trillado + "/images/" + image).with(asAdmin()))
        .andExpect(status().isNotFound());
  }

  private long upload() throws Exception {
    String body =
        api.perform(
                multipart(images).file(jpeg("f.jpg", TestImages.jpeg(800, 600))).with(asAdmin()))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return Long.parseLong(body.replaceAll(".*\"id\":(\\d+).*", "$1"));
  }

  private static MockMultipartFile jpeg(String name, byte[] bytes) {
    return new MockMultipartFile("file", name, MediaType.IMAGE_JPEG_VALUE, bytes);
  }
}
