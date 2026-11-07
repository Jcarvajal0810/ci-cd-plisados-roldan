package co.plisadosroldan.offering.api;

import co.plisadosroldan.media.api.ImageResponse;
import co.plisadosroldan.offering.domain.Offering;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

/** Contract schema {@code AdminOffering}: the public detail plus admin-only fields. */
record AdminOfferingResponse(
    long id,
    String slug,
    String name,
    String summary,
    Long referencePriceCop,
    @JsonInclude(JsonInclude.Include.NON_NULL) ImageResponse coverImage,
    String description,
    List<ImageResponse> images,
    boolean published,
    int displayOrder,
    Instant updatedAt) {

  static AdminOfferingResponse from(Offering offering) {
    OfferingDetailResponse detail = OfferingDetailResponse.from(offering);
    return new AdminOfferingResponse(
        offering.id(),
        detail.slug(),
        detail.name(),
        detail.summary(),
        detail.referencePriceCop(),
        detail.coverImage(),
        detail.description(),
        detail.images(),
        offering.published(),
        offering.displayOrder(),
        offering.updatedAt());
  }
}
