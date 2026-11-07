package co.plisadosroldan.successcase.domain;

import co.plisadosroldan.media.domain.Image;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * A portfolio piece ("caso de éxito"): runway work, a brand collection, etc. Immutable; the slug is
 * fixed at creation.
 *
 * @param images gallery in display order; the first one is the cover
 * @param relatedOfferings linked offerings, published or not
 * @param updatedAt last change, {@code null} until persisted
 */
public record SuccessCase(
    long id,
    String slug,
    String title,
    String clientName,
    String description,
    String eventLabel,
    LocalDate eventDate,
    int displayOrder,
    boolean featured,
    boolean published,
    List<Image> images,
    List<RelatedOffering> relatedOfferings,
    Instant updatedAt) {

  public SuccessCase {
    SuccessCaseContent content =
        new SuccessCaseContent(
            title, clientName, description, eventLabel, eventDate, featured, List.of());
    title = content.title();
    clientName = content.clientName();
    description = content.description();
    eventLabel = content.eventLabel();
    images = List.copyOf(images);
    relatedOfferings = List.copyOf(relatedOfferings);
  }

  /** A new, unpublished case placed at {@code displayOrder}. */
  public static SuccessCase draft(String slug, SuccessCaseContent content, int displayOrder) {
    return new SuccessCase(
        0,
        slug,
        content.title(),
        content.clientName(),
        content.description(),
        content.eventLabel(),
        content.eventDate(),
        displayOrder,
        content.featured(),
        false,
        List.of(),
        List.of(),
        null);
  }

  /** New content, same slug, order, publication and gallery. */
  public SuccessCase withContent(SuccessCaseContent content) {
    return new SuccessCase(
        id,
        slug,
        content.title(),
        content.clientName(),
        content.description(),
        content.eventLabel(),
        content.eventDate(),
        displayOrder,
        content.featured(),
        published,
        images,
        relatedOfferings,
        updatedAt);
  }

  public SuccessCase withPublished(boolean value) {
    return new SuccessCase(
        id,
        slug,
        title,
        clientName,
        description,
        eventLabel,
        eventDate,
        displayOrder,
        featured,
        value,
        images,
        relatedOfferings,
        updatedAt);
  }

  public Optional<Image> coverImage() {
    return images.stream().findFirst();
  }

  public List<RelatedOffering> publishedRelatedOfferings() {
    return relatedOfferings.stream().filter(RelatedOffering::published).toList();
  }

  public SuccessCase withImagesAndOfferings(List<Image> newImages, List<RelatedOffering> related) {
    return new SuccessCase(
        id,
        slug,
        title,
        clientName,
        description,
        eventLabel,
        eventDate,
        displayOrder,
        featured,
        published,
        newImages,
        related,
        updatedAt);
  }
}
