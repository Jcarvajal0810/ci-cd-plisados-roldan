package co.plisadosroldan.offering.application;

import co.plisadosroldan.offering.domain.Offering;
import co.plisadosroldan.offering.domain.OfferingRepository;
import co.plisadosroldan.shared.domain.NotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Read use cases. Public reads only see published offerings (FR-009); admin reads see all. */
@Service
@Transactional(readOnly = true)
public class OfferingQueries {

  private final OfferingRepository offerings;

  public OfferingQueries(OfferingRepository offerings) {
    this.offerings = offerings;
  }

  public List<Offering> published() {
    return offerings.findPublishedOrdered();
  }

  public Offering publishedBySlug(String slug) {
    return offerings
        .findPublishedBySlug(slug)
        .orElseThrow(() -> new NotFoundException("offering", slug));
  }

  public List<Offering> all() {
    return offerings.findAllOrdered();
  }

  public Offering byId(long id) {
    return offerings.findById(id).orElseThrow(() -> new NotFoundException("offering", id));
  }
}
