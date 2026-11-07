package co.plisadosroldan.testimonial.application;

import co.plisadosroldan.media.application.ImageFiles;
import co.plisadosroldan.media.application.ImageUpload;
import co.plisadosroldan.media.domain.GalleryRepository;
import co.plisadosroldan.media.domain.Image;
import co.plisadosroldan.shared.domain.NotFoundException;
import co.plisadosroldan.shared.domain.Reorder;
import co.plisadosroldan.testimonial.domain.Testimonial;
import co.plisadosroldan.testimonial.domain.TestimonialContent;
import co.plisadosroldan.testimonial.domain.TestimonialRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Write use cases for testimonials. The optional photo follows the same file rules as galleries
 * (research R9): new files vanish on rollback, replaced ones are deleted after commit.
 */
@Service
@Transactional
public class TestimonialCommands {

  private final TestimonialRepository testimonials;
  private final GalleryRepository images;
  private final ImageFiles files;

  public TestimonialCommands(
      TestimonialRepository testimonials, GalleryRepository images, ImageFiles files) {
    this.testimonials = testimonials;
    this.images = images;
    this.files = files;
  }

  public Testimonial create(TestimonialContent content) {
    long id = testimonials.insert(Testimonial.draft(content, testimonials.maxDisplayOrder() + 1));
    return existing(id);
  }

  public Testimonial update(long id, TestimonialContent content) {
    testimonials.update(id, existing(id).withContent(content));
    return existing(id);
  }

  public void setPublished(long id, boolean published) {
    testimonials.update(id, existing(id).withPublished(published));
  }

  public void delete(long id) {
    Testimonial current = existing(id);
    testimonials.delete(id);
    current.photoImage().ifPresent(this::deleteImage);
  }

  public void reorder(List<Long> orderedIds) {
    testimonials.updatePositions(Reorder.positions(testimonials.allIds(), orderedIds));
  }

  /** Sets or replaces the photo. */
  public Image setPhoto(long id, ImageUpload upload) {
    Testimonial current = existing(id);
    ImageFiles.StoredImage stored = files.store(upload);
    long imageId =
        images.insertImage(
            stored.key(), upload.originalFilename(), stored.width(), stored.height(), null);
    testimonials.setPhoto(id, imageId);
    current.photoImage().ifPresent(this::deleteImage);
    return new Image(imageId, stored.key(), stored.width(), stored.height(), null);
  }

  public void removePhoto(long id) {
    Testimonial current = existing(id);
    Image photo =
        current.photoImage().orElseThrow(() -> new NotFoundException("testimonial photo", id));
    testimonials.setPhoto(id, null);
    deleteImage(photo);
  }

  private void deleteImage(Image photo) {
    images.deleteImages(List.of(photo.id())).forEach(files::deleteAfterCommit);
  }

  private Testimonial existing(long id) {
    return testimonials.findById(id).orElseThrow(() -> new NotFoundException("testimonial", id));
  }
}
