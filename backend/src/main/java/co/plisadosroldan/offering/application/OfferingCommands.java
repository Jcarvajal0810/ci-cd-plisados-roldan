package co.plisadosroldan.offering.application;

import co.plisadosroldan.media.application.GalleryService;
import co.plisadosroldan.media.domain.GalleryOwner;
import co.plisadosroldan.offering.domain.Offering;
import co.plisadosroldan.offering.domain.OfferingContent;
import co.plisadosroldan.offering.domain.OfferingRepository;
import co.plisadosroldan.shared.domain.NotFoundException;
import co.plisadosroldan.shared.domain.Reorder;
import co.plisadosroldan.shared.domain.Slug;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Write use cases for offerings. Each method is one database transaction (Principle VI). */
@Service
@Transactional
public class OfferingCommands {

  private final OfferingRepository offerings;
  private final GalleryService galleries;

  public OfferingCommands(OfferingRepository offerings, GalleryService galleries) {
    this.offerings = offerings;
    this.galleries = galleries;
  }

  /** Creates a draft at the end of the list with a unique slug derived from the name. */
  public Offering create(OfferingContent content) {
    String slug = Slug.generate(content.name(), offerings::slugExists);
    long id = offerings.insert(Offering.draft(slug, content, offerings.maxDisplayOrder() + 1));
    return existing(id);
  }

  public Offering update(long id, OfferingContent content) {
    offerings.update(id, existing(id).withContent(content));
    return existing(id);
  }

  public void setPublished(long id, boolean published) {
    offerings.update(id, existing(id).withPublished(published));
  }

  /** Deletes the offering with its images; image files are removed after commit. */
  public void delete(long id) {
    existing(id);
    galleries.removeAll(GalleryOwner.OFFERING, id);
    offerings.delete(id);
  }

  public void reorder(List<Long> orderedIds) {
    offerings.updatePositions(Reorder.positions(offerings.allIds(), orderedIds));
  }

  private Offering existing(long id) {
    return offerings.findById(id).orElseThrow(() -> new NotFoundException("offering", id));
  }
}
