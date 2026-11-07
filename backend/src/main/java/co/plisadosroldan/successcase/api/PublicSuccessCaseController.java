package co.plisadosroldan.successcase.api;

import co.plisadosroldan.successcase.application.SuccessCaseQueries;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/success-cases")
class PublicSuccessCaseController {

  private final SuccessCaseQueries queries;

  PublicSuccessCaseController(SuccessCaseQueries queries) {
    this.queries = queries;
  }

  @GetMapping
  List<SuccessCaseSummaryResponse> list() {
    return queries.published().stream().map(SuccessCaseSummaryResponse::from).toList();
  }

  @GetMapping("/{slug}")
  SuccessCaseDetailResponse detail(@PathVariable String slug) {
    return SuccessCaseDetailResponse.from(queries.publishedBySlug(slug));
  }
}
