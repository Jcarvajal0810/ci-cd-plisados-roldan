package co.plisadosroldan.testimonial.api;

import co.plisadosroldan.media.api.ImageResponse;
import co.plisadosroldan.testimonial.domain.Testimonial;
import com.fasterxml.jackson.annotation.JsonInclude;

/** Contract schema {@code Testimonial}. {@code photo} is omitted when there is none. */
public record TestimonialResponse(
    String clientName,
    String company,
    String quote,
    @JsonInclude(JsonInclude.Include.NON_NULL) ImageResponse photo) {

  public static TestimonialResponse from(Testimonial testimonial) {
    return new TestimonialResponse(
        testimonial.clientName(),
        testimonial.company(),
        testimonial.quote(),
        testimonial
            .photoImage()
            .map(image -> ImageResponse.from(image, testimonial.clientName()))
            .orElse(null));
  }
}
