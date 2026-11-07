package co.plisadosroldan.testimonial.api;

import co.plisadosroldan.testimonial.domain.TestimonialContent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Contract schema {@code TestimonialInput}; limits mirror data-model.md. */
record TestimonialInputRequest(
    @NotBlank(message = "Este campo es obligatorio")
        @Size(max = 120, message = "Máximo 120 caracteres")
        String clientName,
    @Size(max = 120, message = "Máximo 120 caracteres") String company,
    @NotBlank(message = "Este campo es obligatorio")
        @Size(max = 600, message = "Máximo 600 caracteres")
        String quote,
    boolean featured) {

  TestimonialContent toContent() {
    return new TestimonialContent(clientName, company, quote, featured);
  }
}
