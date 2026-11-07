package co.plisadosroldan.testimonial.api;

import co.plisadosroldan.media.api.ImageResponse;
import co.plisadosroldan.testimonial.domain.Testimonial;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

/** Contract schema {@code AdminTestimonial}. */
record AdminTestimonialResponse(
    long id,
    String clientName,
    String company,
    String quote,
    @JsonInclude(JsonInclude.Include.NON_NULL) ImageResponse photo,
    boolean featured,
    boolean published,
    int displayOrder,
    Instant updatedAt) {

  static AdminTestimonialResponse from(Testimonial t) {
    TestimonialResponse view = TestimonialResponse.from(t);
    return new AdminTestimonialResponse(
        t.id(),
        view.clientName(),
        view.company(),
        view.quote(),
        view.photo(),
        t.featured(),
        t.published(),
        t.displayOrder(),
        t.updatedAt());
  }
}
