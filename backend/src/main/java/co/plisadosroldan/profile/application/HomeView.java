package co.plisadosroldan.profile.application;

import co.plisadosroldan.offering.domain.Offering;
import co.plisadosroldan.profile.domain.BusinessProfile;
import co.plisadosroldan.successcase.domain.SuccessCase;
import co.plisadosroldan.testimonial.domain.Testimonial;
import java.util.List;

/** Data for the home page (FR-003). */
public record HomeView(
    BusinessProfile profile,
    List<Offering> offerings,
    List<SuccessCase> featuredSuccessCases,
    List<Testimonial> featuredTestimonials) {}
