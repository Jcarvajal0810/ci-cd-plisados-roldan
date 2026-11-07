package co.plisadosroldan.successcase.api;

import co.plisadosroldan.successcase.domain.SuccessCaseContent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/** Contract schema {@code SuccessCaseInput}; limits mirror data-model.md. */
record SuccessCaseInputRequest(
    @NotBlank(message = "Este campo es obligatorio")
        @Size(max = 120, message = "Máximo 120 caracteres")
        String title,
    @NotBlank(message = "Este campo es obligatorio")
        @Size(max = 120, message = "Máximo 120 caracteres")
        String clientName,
    @NotBlank(message = "Este campo es obligatorio")
        @Size(max = 5000, message = "Máximo 5000 caracteres")
        String description,
    @Size(max = 120, message = "Máximo 120 caracteres") String eventLabel,
    LocalDate eventDate,
    boolean featured,
    List<Long> offeringIds) {

  SuccessCaseContent toContent() {
    return new SuccessCaseContent(
        title,
        clientName,
        description,
        eventLabel,
        eventDate,
        featured,
        offeringIds == null ? List.of() : offeringIds.stream().distinct().toList());
  }
}
