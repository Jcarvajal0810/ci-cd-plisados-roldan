package co.plisadosroldan.successcase.domain;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/** Persistence port for success cases. */
public interface SuccessCaseRepository {

  /** Published cases in display order, with galleries and related offerings. */
  List<SuccessCase> findPublishedOrdered();

  Optional<SuccessCase> findPublishedBySlug(String slug);

  /** Cases that are both featured and published, in display order (home page). */
  List<SuccessCase> findFeaturedPublished();

  /** Every case, drafts included, in display order. */
  List<SuccessCase> findAllOrdered();

  Optional<SuccessCase> findById(long id);

  /**
   * @return the new ID
   */
  long insert(SuccessCase successCase);

  /** Writes content, featured and publication state; slug and display order are not changed. */
  void update(long id, SuccessCase successCase);

  void delete(long id);

  int maxDisplayOrder();

  boolean slugExists(String slug);

  Set<Long> allIds();

  void updatePositions(Map<Long, Integer> positions);

  void replaceRelatedOfferings(long successCaseId, List<Long> offeringIds);

  /** Which of the given offering IDs exist. */
  Set<Long> existingOfferingIds(Collection<Long> offeringIds);
}
