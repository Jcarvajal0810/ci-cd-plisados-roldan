package co.plisadosroldan.profile.application;

import co.plisadosroldan.offering.domain.OfferingRepository;
import co.plisadosroldan.profile.domain.BusinessProfileRepository;
import co.plisadosroldan.successcase.domain.SuccessCaseRepository;
import co.plisadosroldan.testimonial.domain.TestimonialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Builds the home page in one call (FR-003). */
@Service
@Transactional(readOnly = true)
public class HomeQuery {

  /** Offerings shown on the home page, in display order. */
  public static final int MAX_OFFERINGS = 6;

  private final BusinessProfileRepository profiles;
  private final OfferingRepository offerings;
  private final SuccessCaseRepository successCases;
  private final TestimonialRepository testimonials;

  public HomeQuery(
      BusinessProfileRepository profiles,
      OfferingRepository offerings,
      SuccessCaseRepository successCases,
      TestimonialRepository testimonials) {
    this.profiles = profiles;
    this.offerings = offerings;
    this.successCases = successCases;
    this.testimonials = testimonials;
  }

  public HomeView get() {
    return new HomeView(
        profiles.get(),
        offerings.findPublishedOrdered().stream().limit(MAX_OFFERINGS).toList(),
        successCases.findFeaturedPublished(),
        testimonials.findFeaturedPublished());
  }
}
