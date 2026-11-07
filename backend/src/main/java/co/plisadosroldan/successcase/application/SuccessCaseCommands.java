package co.plisadosroldan.successcase.application;

import co.plisadosroldan.media.application.GalleryService;
import co.plisadosroldan.media.domain.GalleryOwner;
import co.plisadosroldan.shared.domain.DomainValidationException;
import co.plisadosroldan.shared.domain.NotFoundException;
import co.plisadosroldan.shared.domain.Reorder;
import co.plisadosroldan.shared.domain.Slug;
import co.plisadosroldan.successcase.domain.SuccessCase;
import co.plisadosroldan.successcase.domain.SuccessCaseContent;
import co.plisadosroldan.successcase.domain.SuccessCaseRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Write use cases for success cases; each method is one database transaction. */
@Service
@Transactional
public class SuccessCaseCommands {

  private final SuccessCaseRepository cases;
  private final GalleryService galleries;

  public SuccessCaseCommands(SuccessCaseRepository cases, GalleryService galleries) {
    this.cases = cases;
    this.galleries = galleries;
  }

  public SuccessCase create(SuccessCaseContent content) {
    requireExistingOfferings(content.offeringIds());
    String slug = Slug.generate(content.title(), cases::slugExists);
    long id = cases.insert(SuccessCase.draft(slug, content, cases.maxDisplayOrder() + 1));
    cases.replaceRelatedOfferings(id, content.offeringIds());
    return existing(id);
  }

  public SuccessCase update(long id, SuccessCaseContent content) {
    SuccessCase current = existing(id);
    requireExistingOfferings(content.offeringIds());
    cases.update(id, current.withContent(content));
    cases.replaceRelatedOfferings(id, content.offeringIds());
    return existing(id);
  }

  public void setPublished(long id, boolean published) {
    cases.update(id, existing(id).withPublished(published));
  }

  /** Deletes the case with its images; image files are removed after commit. */
  public void delete(long id) {
    existing(id);
    galleries.removeAll(GalleryOwner.SUCCESS_CASE, id);
    cases.delete(id);
  }

  public void reorder(List<Long> orderedIds) {
    cases.updatePositions(Reorder.positions(cases.allIds(), orderedIds));
  }

  private void requireExistingOfferings(List<Long> offeringIds) {
    Set<Long> existing = cases.existingOfferingIds(offeringIds);
    if (!existing.containsAll(offeringIds)) {
      throw new DomainValidationException(
          Map.of("offeringIds", "Uno de los servicios relacionados ya no existe"));
    }
  }

  private SuccessCase existing(long id) {
    return cases.findById(id).orElseThrow(() -> new NotFoundException("success case", id));
  }
}
