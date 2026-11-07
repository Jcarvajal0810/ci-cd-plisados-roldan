package co.plisadosroldan.offering.api;

import co.plisadosroldan.media.api.ImageResponse;
import co.plisadosroldan.offering.domain.Offering;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/** Contract schema {@code OfferingDetail}. */
public record OfferingDetailResponse(
    String slug,
    String name,
    String summary,
    Long referencePriceCop,
    @JsonInclude(JsonInclude.Include.NON_NULL) ImageResponse coverImage,
    String description,
    List<ImageResponse> images) {

  public static OfferingDetailResponse from(Offering offering) {
    OfferingSummaryResponse summary = OfferingSummaryResponse.from(offering);
    return new OfferingDetailResponse(
        summary.slug(),
        summary.name(),
        summary.summary(),
        summary.referencePriceCop(),
        summary.coverImage(),
        offering.description(),
        offering.images().stream()
            .map(image -> ImageResponse.from(image, offering.name()))
            .toList());
  }
}
