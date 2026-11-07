package co.plisadosroldan.successcase.application;

import co.plisadosroldan.shared.domain.NotFoundException;
import co.plisadosroldan.successcase.domain.SuccessCase;
import co.plisadosroldan.successcase.domain.SuccessCaseRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Read use cases for success cases. Public reads only see published cases (FR-009). */
@Service
@Transactional(readOnly = true)
public class SuccessCaseQueries {

  private final SuccessCaseRepository successCases;

  public SuccessCaseQueries(SuccessCaseRepository successCases) {
    this.successCases = successCases;
  }

  public List<SuccessCase> published() {
    return successCases.findPublishedOrdered();
  }

  public SuccessCase publishedBySlug(String slug) {
    return successCases
        .findPublishedBySlug(slug)
        .orElseThrow(() -> new NotFoundException("success case", slug));
  }

  public List<SuccessCase> all() {
    return successCases.findAllOrdered();
  }

  public SuccessCase byId(long id) {
    return successCases.findById(id).orElseThrow(() -> new NotFoundException("success case", id));
  }
}
