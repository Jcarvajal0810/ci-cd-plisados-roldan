package co.plisadosroldan.successcase.api;

import co.plisadosroldan.media.api.ImageResponse;
import co.plisadosroldan.successcase.domain.SuccessCase;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDate;

/** Contract schema {@code SuccessCaseSummary}. {@code coverImage} is omitted when there is none. */
public record SuccessCaseSummaryResponse(
    String slug,
    String title,
    String clientName,
    String eventLabel,
    LocalDate eventDate,
    @JsonInclude(JsonInclude.Include.NON_NULL) ImageResponse coverImage) {

  public static SuccessCaseSummaryResponse from(SuccessCase successCase) {
    return new SuccessCaseSummaryResponse(
        successCase.slug(),
        successCase.title(),
        successCase.clientName(),
        successCase.eventLabel(),
        successCase.eventDate(),
        successCase
            .coverImage()
            .map(image -> ImageResponse.from(image, successCase.title()))
            .orElse(null));
  }
}
