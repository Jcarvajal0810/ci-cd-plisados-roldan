package co.plisadosroldan.offering.api;

import co.plisadosroldan.offering.domain.OfferingContent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Contract schema {@code OfferingInput}; limits mirror data-model.md. */
record OfferingInputRequest(
    @NotBlank(message = "Este campo es obligatorio")
        @Size(max = 80, message = "Máximo 80 caracteres")
        String name,
    @NotBlank(message = "Este campo es obligatorio")
        @Size(max = 200, message = "Máximo 200 caracteres")
        String summary,
    @NotBlank(message = "Este campo es obligatorio")
        @Size(max = 5000, message = "Máximo 5000 caracteres")
        String description,
    @Min(value = 1, message = "El precio debe ser mayor que cero") Long referencePriceCop) {

  OfferingContent toContent() {
    return new OfferingContent(name, summary, description, referencePriceCop);
  }
}
