package co.plisadosroldan.offering.api;

import co.plisadosroldan.offering.application.OfferingQueries;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/offerings")
class PublicOfferingController {

  private final OfferingQueries queries;

  PublicOfferingController(OfferingQueries queries) {
    this.queries = queries;
  }

  @GetMapping
  List<OfferingSummaryResponse> list() {
    return queries.published().stream().map(OfferingSummaryResponse::from).toList();
  }

  @GetMapping("/{slug}")
  OfferingDetailResponse detail(@PathVariable String slug) {
    return OfferingDetailResponse.from(queries.publishedBySlug(slug));
  }
}
