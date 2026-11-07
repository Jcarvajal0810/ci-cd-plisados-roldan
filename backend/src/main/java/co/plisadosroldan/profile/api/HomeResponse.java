package co.plisadosroldan.profile.api;

import co.plisadosroldan.offering.api.OfferingSummaryResponse;
import co.plisadosroldan.profile.application.HomeView;
import co.plisadosroldan.successcase.api.SuccessCaseSummaryResponse;
import co.plisadosroldan.testimonial.api.TestimonialResponse;
import java.util.List;

/** Contract schema {@code HomeView}. */
public record HomeResponse(
    BusinessProfileResponse profile,
    List<OfferingSummaryResponse> offerings,
    List<SuccessCaseSummaryResponse> featuredSuccessCases,
    List<TestimonialResponse> featuredTestimonials) {

  public static HomeResponse from(HomeView home) {
    return new HomeResponse(
        BusinessProfileResponse.from(home.profile()),
        home.offerings().stream().map(OfferingSummaryResponse::from).toList(),
        home.featuredSuccessCases().stream().map(SuccessCaseSummaryResponse::from).toList(),
        home.featuredTestimonials().stream().map(TestimonialResponse::from).toList());
  }
}
