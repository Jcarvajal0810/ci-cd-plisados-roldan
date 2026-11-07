package co.plisadosroldan.testimonial.application;

import co.plisadosroldan.shared.domain.NotFoundException;
import co.plisadosroldan.testimonial.domain.Testimonial;
import co.plisadosroldan.testimonial.domain.TestimonialRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TestimonialQueries {

  private final TestimonialRepository testimonials;

  public TestimonialQueries(TestimonialRepository testimonials) {
    this.testimonials = testimonials;
  }

  public List<Testimonial> published() {
    return testimonials.findPublishedOrdered();
  }

  public List<Testimonial> all() {
    return testimonials.findAllOrdered();
  }

  public Testimonial byId(long id) {
    return testimonials.findById(id).orElseThrow(() -> new NotFoundException("testimonial", id));
  }
}
