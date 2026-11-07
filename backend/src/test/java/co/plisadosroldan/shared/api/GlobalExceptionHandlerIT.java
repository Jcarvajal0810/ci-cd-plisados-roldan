package co.plisadosroldan.shared.api;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.plisadosroldan.media.domain.GalleryFullException;
import co.plisadosroldan.media.domain.UnsupportedImageException;
import co.plisadosroldan.shared.domain.NotFoundException;
import co.plisadosroldan.shared.domain.ReorderMismatchException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/**
 * All API errors are RFC 9457 Problem Details (research R14). Runs the real handler against a
 * test-only controller through standalone MockMvc (no security, no database).
 */
class GlobalExceptionHandlerIT {

  private static final String BASE = "/__test__/errors";

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(new ThrowingController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  @Test
  void notFoundIs404() throws Exception {
    mockMvc
        .perform(get(BASE + "/not-found"))
        .andExpect(status().isNotFound())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.status").value(404));
  }

  @Test
  void validationFailureIs400WithFieldErrors() throws Exception {
    mockMvc
        .perform(
            post(BASE + "/validated")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"  \"}"))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.errors.name").isString());
  }

  @Test
  void reorderMismatchIs409() throws Exception {
    mockMvc.perform(get(BASE + "/reorder")).andExpect(status().isConflict());
  }

  @Test
  void uploadTooLargeIs413() throws Exception {
    mockMvc
        .perform(get(BASE + "/too-large"))
        .andExpect(status().isPayloadTooLarge())
        .andExpect(jsonPath("$.detail").value("El archivo supera 10 MB"));
  }

  @Test
  void unsupportedImageIs400() throws Exception {
    mockMvc
        .perform(get(BASE + "/unsupported-image"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value("Formato no soportado"));
  }

  @Test
  void fullGalleryIs409() throws Exception {
    mockMvc.perform(get(BASE + "/gallery-full")).andExpect(status().isConflict());
  }

  @Test
  void unexpectedErrorIs500WithoutLeakingDetails() throws Exception {
    mockMvc
        .perform(get(BASE + "/boom"))
        .andExpect(status().isInternalServerError())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(content().string(not(containsString("secret-internal-detail"))))
        .andExpect(content().string(not(containsString("at co.plisadosroldan"))));
  }

  /** Test-only endpoints that raise each mapped exception. */
  @RestController
  static class ThrowingController {

    record Named(@NotBlank @Size(max = 10) String name) {}

    @GetMapping(BASE + "/{kind}")
    void raise(@PathVariable String kind) {
      switch (kind) {
        case "not-found" -> throw new NotFoundException("offering", "x");
        case "reorder" -> throw new ReorderMismatchException();
        case "too-large" -> throw new MaxUploadSizeExceededException(10L * 1024 * 1024);
        case "unsupported-image" -> throw new UnsupportedImageException();
        case "gallery-full" -> throw new GalleryFullException(12);
        default -> throw new IllegalStateException("secret-internal-detail");
      }
    }

    @PostMapping(BASE + "/validated")
    void validated(@Valid @RequestBody Named body) {}
  }
}
