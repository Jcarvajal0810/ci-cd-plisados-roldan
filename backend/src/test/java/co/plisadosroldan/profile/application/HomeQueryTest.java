package co.plisadosroldan.profile.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import co.plisadosroldan.offering.domain.Offering;
import co.plisadosroldan.offering.domain.OfferingRepository;
import co.plisadosroldan.profile.domain.BusinessProfile;
import co.plisadosroldan.profile.domain.BusinessProfileRepository;
import co.plisadosroldan.successcase.domain.SuccessCase;
import co.plisadosroldan.successcase.domain.SuccessCaseRepository;
import co.plisadosroldan.testimonial.domain.Testimonial;
import co.plisadosroldan.testimonial.domain.TestimonialRepository;
import java.util.List;
import java.util.stream.IntStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class HomeQueryTest {

  private final OfferingRepository offerings = mock(OfferingRepository.class);
  private final BusinessProfileRepository profiles = mock(BusinessProfileRepository.class);
  private final SuccessCaseRepository successCases = mock(SuccessCaseRepository.class);
  private final TestimonialRepository testimonials = mock(TestimonialRepository.class);
  private final HomeQuery homeQuery =
      new HomeQuery(profiles, offerings, successCases, testimonials);

  private static final BusinessProfile PROFILE =
      new BusinessProfile(
          "Plisados Roldán", "Creando ando", "Historia", "573116254705", "Itagüí", "L-V");

  @BeforeEach
  void profile() {
    when(profiles.get()).thenReturn(PROFILE);
  }

  @Test
  void containsProfileAndAtMostSixPublishedOfferingsInOrder() {
    List<Offering> eight = IntStream.rangeClosed(1, 8).mapToObj(HomeQueryTest::offering).toList();
    when(offerings.findPublishedOrdered()).thenReturn(eight);

    HomeView home = homeQuery.get();

    assertThat(home.profile()).isEqualTo(PROFILE);
    assertThat(home.offerings()).hasSize(HomeQuery.MAX_OFFERINGS).isEqualTo(eight.subList(0, 6));
  }

  @Test
  void includesTheFeaturedPublishedSuccessCasesAndTestimonials() {
    List<SuccessCase> cases = List.of(mock(SuccessCase.class));
    List<Testimonial> quotes = List.of(mock(Testimonial.class));
    when(successCases.findFeaturedPublished()).thenReturn(cases);
    when(testimonials.findFeaturedPublished()).thenReturn(quotes);

    HomeView home = homeQuery.get();

    assertThat(home.featuredSuccessCases()).isEqualTo(cases);
    assertThat(home.featuredTestimonials()).isEqualTo(quotes);
  }

  private static Offering offering(int order) {
    return new Offering(
        order,
        "s" + order,
        "Servicio " + order,
        "Resumen",
        "Desc",
        null,
        order,
        true,
        List.of(),
        null);
  }
}
