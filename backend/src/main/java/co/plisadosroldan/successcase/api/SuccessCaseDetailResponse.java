package co.plisadosroldan.successcase.api;

import co.plisadosroldan.media.api.ImageResponse;
import co.plisadosroldan.successcase.domain.SuccessCase;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDate;
import java.util.List;

/** Contract schema {@code SuccessCaseDetail}: related offerings are the published ones only. */
public record SuccessCaseDetailResponse(
    String slug,
    String title,
    String clientName,
    String eventLabel,
    LocalDate eventDate,
    @JsonInclude(JsonInclude.Include.NON_NULL) ImageResponse coverImage,
    String description,
    List<ImageResponse> images,
    List<OfferingLink> relatedOfferings) {

  /** Slug and name of a related offering, enough to link to it. */
  public record OfferingLink(String slug, String name) {}

  public static SuccessCaseDetailResponse from(SuccessCase successCase) {
    SuccessCaseSummaryResponse summary = SuccessCaseSummaryResponse.from(successCase);
    return new SuccessCaseDetailResponse(
        summary.slug(),
        summary.title(),
        summary.clientName(),
        summary.eventLabel(),
        summary.eventDate(),
        summary.coverImage(),
        successCase.description(),
        successCase.images().stream()
            .map(image -> ImageResponse.from(image, successCase.title()))
            .toList(),
        successCase.publishedRelatedOfferings().stream()
            .map(offering -> new OfferingLink(offering.slug(), offering.name()))
            .toList());
  }
}
