package co.plisadosroldan.offering.domain;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/** Persistence port for offerings (implemented in infrastructure). */
public interface OfferingRepository {

  /** Published offerings in display order, each with its gallery. */
  List<Offering> findPublishedOrdered();

  Optional<Offering> findPublishedBySlug(String slug);

  /** Every offering, drafts included, in display order. */
  List<Offering> findAllOrdered();

  /** Any offering by ID, published or not. */
  Optional<Offering> findById(long id);

  /**
   * @return the new ID
   */
  long insert(Offering offering);

  /** Writes content and publication state; the slug and display order are not changed. */
  void update(long id, Offering offering);

  void delete(long id);

  int maxDisplayOrder();

  boolean slugExists(String slug);

  Set<Long> allIds();

  void updatePositions(Map<Long, Integer> positions);
}
