package co.plisadosroldan.successcase.api;

import co.plisadosroldan.media.api.ImageResponse;
import co.plisadosroldan.successcase.domain.RelatedOffering;
import co.plisadosroldan.successcase.domain.SuccessCase;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Contract schema {@code AdminSuccessCase}: the public detail plus admin-only fields. {@code
 * offeringIds} lists every related offering, published or not.
 */
record AdminSuccessCaseResponse(
    long id,
    String slug,
    String title,
    String clientName,
    String eventLabel,
    LocalDate eventDate,
    @JsonInclude(JsonInclude.Include.NON_NULL) ImageResponse coverImage,
    String description,
    List<ImageResponse> images,
    List<SuccessCaseDetailResponse.OfferingLink> relatedOfferings,
    boolean featured,
    boolean published,
    int displayOrder,
    List<Long> offeringIds,
    Instant updatedAt) {

  static AdminSuccessCaseResponse from(SuccessCase c) {
    SuccessCaseDetailResponse detail = SuccessCaseDetailResponse.from(c);
    return new AdminSuccessCaseResponse(
        c.id(),
        detail.slug(),
        detail.title(),
        detail.clientName(),
        detail.eventLabel(),
        detail.eventDate(),
        detail.coverImage(),
        detail.description(),
        detail.images(),
        detail.relatedOfferings(),
        c.featured(),
        c.published(),
        c.displayOrder(),
        c.relatedOfferings().stream().map(RelatedOffering::id).toList(),
        c.updatedAt());
  }
}
