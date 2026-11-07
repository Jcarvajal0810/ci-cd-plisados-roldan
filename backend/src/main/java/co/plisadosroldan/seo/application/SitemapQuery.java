package co.plisadosroldan.seo.application;

import co.plisadosroldan.offering.application.OfferingQueries;
import co.plisadosroldan.successcase.application.SuccessCaseQueries;
import co.plisadosroldan.successcase.domain.SuccessCase;
import co.plisadosroldan.testimonial.application.TestimonialQueries;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Public paths for the sitemap (FR-011): fixed pages, every published offering and success case,
 * and the optional sections only when they have published content.
 */
@Service
@Transactional(readOnly = true)
public class SitemapQuery {

  private static final List<String> FIXED_PAGES =
      List.of("/", "/nosotros", "/servicios", "/contacto");

  private final OfferingQueries offerings;
  private final SuccessCaseQueries successCases;
  private final TestimonialQueries testimonials;

  public SitemapQuery(
      OfferingQueries offerings, SuccessCaseQueries successCases, TestimonialQueries testimonials) {
    this.offerings = offerings;
    this.successCases = successCases;
    this.testimonials = testimonials;
  }

  public List<String> publicPaths() {
    List<String> paths = new ArrayList<>(FIXED_PAGES);
    offerings.published().forEach(offering -> paths.add("/servicios/" + offering.slug()));
    List<SuccessCase> cases = successCases.published();
    if (!cases.isEmpty()) {
      paths.add("/casos-de-exito");
      cases.forEach(successCase -> paths.add("/casos-de-exito/" + successCase.slug()));
    }
    if (!testimonials.published().isEmpty()) {
      paths.add("/testimonios");
    }
    return paths;
  }
}
