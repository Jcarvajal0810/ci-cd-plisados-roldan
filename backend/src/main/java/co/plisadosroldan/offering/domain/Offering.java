package co.plisadosroldan.offering.domain;

import co.plisadosroldan.media.domain.Image;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * A service the business offers ("servicio"; named Offering in code — research R3). Immutable:
 * changes return a new instance. The slug is fixed at creation so shared links keep working.
 *
 * @param referencePriceCop optional "desde" price in Colombian pesos; {@code null} hides the price
 * @param images gallery in display order; the first one is the cover
 * @param updatedAt last change, {@code null} until persisted
 */
public record Offering(
    long id,
    String slug,
    String name,
    String summary,
    String description,
    Long referencePriceCop,
    int displayOrder,
    boolean published,
    List<Image> images,
    Instant updatedAt) {

  public Offering {
    OfferingContent content = new OfferingContent(name, summary, description, referencePriceCop);
    name = content.name();
    summary = content.summary();
    description = content.description();
    images = List.copyOf(images);
  }

  /** A new, unpublished offering placed at {@code displayOrder}. */
  public static Offering draft(String slug, OfferingContent content, int displayOrder) {
    return new Offering(
        0,
        slug,
        content.name(),
        content.summary(),
        content.description(),
        content.referencePriceCop(),
        displayOrder,
        false,
        List.of(),
        null);
  }

  public Offering withContent(OfferingContent content) {
    return new Offering(
        id,
        slug,
        content.name(),
        content.summary(),
        content.description(),
        content.referencePriceCop(),
        displayOrder,
        published,
        images,
        updatedAt);
  }

  public Offering publish() {
    return withPublished(true);
  }

  public Offering unpublish() {
    return withPublished(false);
  }

  public Offering withPublished(boolean value) {
    return new Offering(
        id,
        slug,
        name,
        summary,
        description,
        referencePriceCop,
        displayOrder,
        value,
        images,
        updatedAt);
  }

  public Optional<Image> coverImage() {
    return images.stream().findFirst();
  }
}
