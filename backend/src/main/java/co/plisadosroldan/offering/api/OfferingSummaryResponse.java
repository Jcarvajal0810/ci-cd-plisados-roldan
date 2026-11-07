package co.plisadosroldan.offering.api;

import co.plisadosroldan.media.api.ImageResponse;
import co.plisadosroldan.offering.domain.Offering;
import com.fasterxml.jackson.annotation.JsonInclude;

/** Contract schema {@code OfferingSummary}. {@code coverImage} is omitted when there is none. */
public record OfferingSummaryResponse(
    String slug,
    String name,
    String summary,
    Long referencePriceCop,
    @JsonInclude(JsonInclude.Include.NON_NULL) ImageResponse coverImage) {

  public static OfferingSummaryResponse from(Offering offering) {
    return new OfferingSummaryResponse(
        offering.slug(),
        offering.name(),
        offering.summary(),
        offering.referencePriceCop(),
        offering
            .coverImage()
            .map(image -> ImageResponse.from(image, offering.name()))
            .orElse(null));
  }
}
