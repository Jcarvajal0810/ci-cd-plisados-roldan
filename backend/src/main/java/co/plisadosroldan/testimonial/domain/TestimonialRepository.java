package co.plisadosroldan.testimonial.domain;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/** Persistence port for testimonials. */
public interface TestimonialRepository {

  /** Published testimonials in display order. */
  List<Testimonial> findPublishedOrdered();

  /** Testimonials that are both featured and published, in display order (home page). */
  List<Testimonial> findFeaturedPublished();

  /** Every testimonial, drafts included, in display order. */
  List<Testimonial> findAllOrdered();

  Optional<Testimonial> findById(long id);

  /**
   * @return the new ID
   */
  long insert(Testimonial testimonial);

  /** Writes content, featured and publication state; photo and order are not changed. */
  void update(long id, Testimonial testimonial);

  void delete(long id);

  int maxDisplayOrder();

  Set<Long> allIds();

  void updatePositions(Map<Long, Integer> positions);

  /** Links the photo; {@code null} removes the link. */
  void setPhoto(long id, Long imageId);
}
