package co.plisadosroldan.testimonial.domain;

import co.plisadosroldan.media.domain.Image;
import java.time.Instant;
import java.util.Optional;

/**
 * A client's quote ("testimonio").
 *
 * @param company optional company or brand
 * @param photo optional photo, {@code null} when none
 * @param updatedAt last change, {@code null} until persisted
 */
public record Testimonial(
    long id,
    String clientName,
    String company,
    String quote,
    Image photo,
    int displayOrder,
    boolean featured,
    boolean published,
    Instant updatedAt) {

  public Testimonial {
    TestimonialContent content = new TestimonialContent(clientName, company, quote, featured);
    clientName = content.clientName();
    company = content.company();
    quote = content.quote();
  }

  /** A new, unpublished testimonial without photo, placed at {@code displayOrder}. */
  public static Testimonial draft(TestimonialContent content, int displayOrder) {
    return new Testimonial(
        0,
        content.clientName(),
        content.company(),
        content.quote(),
        null,
        displayOrder,
        content.featured(),
        false,
        null);
  }

  public Testimonial withContent(TestimonialContent content) {
    return new Testimonial(
        id,
        content.clientName(),
        content.company(),
        content.quote(),
        photo,
        displayOrder,
        content.featured(),
        published,
        updatedAt);
  }

  public Testimonial withPublished(boolean value) {
    return new Testimonial(
        id, clientName, company, quote, photo, displayOrder, featured, value, updatedAt);
  }

  public Optional<Image> photoImage() {
    return Optional.ofNullable(photo);
  }
}
