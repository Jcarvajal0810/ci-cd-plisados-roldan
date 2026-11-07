package co.plisadosroldan.testimonial.api;

import co.plisadosroldan.testimonial.application.TestimonialQueries;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class PublicTestimonialController {

  private final TestimonialQueries queries;

  PublicTestimonialController(TestimonialQueries queries) {
    this.queries = queries;
  }

  @GetMapping("/api/public/testimonials")
  List<TestimonialResponse> list() {
    return queries.published().stream().map(TestimonialResponse::from).toList();
  }
}
