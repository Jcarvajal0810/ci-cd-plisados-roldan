package co.plisadosroldan.media.application;

import co.plisadosroldan.media.domain.GalleryFullException;
import co.plisadosroldan.media.domain.GalleryOwner;
import co.plisadosroldan.media.domain.GalleryRepository;
import co.plisadosroldan.media.domain.Image;
import co.plisadosroldan.shared.domain.FieldRules;
import co.plisadosroldan.shared.domain.NotFoundException;
import co.plisadosroldan.shared.domain.Reorder;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ordered photo galleries for offerings and success cases (FR-017). Rows change in one transaction;
 * files follow the transaction outcome through {@link ImageFiles}.
 */
@Service
@Transactional
public class GalleryService {

  /** Images per gallery (data-model.md). */
  public static final int MAX_IMAGES = 12;

  static final int ALT_TEXT_MAX = 150;

  private final GalleryRepository galleries;
  private final ImageFiles files;

  public GalleryService(GalleryRepository galleries, ImageFiles files) {
    this.galleries = galleries;
    this.files = files;
  }

  /** Adds the upload at the end of the owner's gallery. */
  public Image add(GalleryOwner owner, long ownerId, ImageUpload upload) {
    if (galleries.countImages(owner, ownerId) >= MAX_IMAGES) {
      throw new GalleryFullException(MAX_IMAGES);
    }
    String altText = validAltText(upload.altText());
    ImageFiles.StoredImage stored = files.store(upload);
    long imageId =
        galleries.insertImage(
            stored.key(), upload.originalFilename(), stored.width(), stored.height(), altText);
    galleries.addToGallery(owner, ownerId, imageId);
    return new Image(imageId, stored.key(), stored.width(), stored.height(), altText);
  }

  public void remove(GalleryOwner owner, long ownerId, long imageId) {
    Image image = inGallery(owner, ownerId, imageId);
    galleries.deleteImages(List.of(image.id()));
    files.deleteAfterCommit(image.storageKey());
  }

  /** Removes every image of the owner (used when the owner itself is deleted). */
  public void removeAll(GalleryOwner owner, long ownerId) {
    galleries.deleteImages(galleries.imageIds(owner, ownerId)).forEach(files::deleteAfterCommit);
  }

  public void reorder(GalleryOwner owner, long ownerId, List<Long> orderedImageIds) {
    galleries.updatePositions(
        owner, ownerId, Reorder.positions(galleries.imageIds(owner, ownerId), orderedImageIds));
  }

  public Image updateAltText(GalleryOwner owner, long ownerId, long imageId, String altText) {
    inGallery(owner, ownerId, imageId);
    galleries.updateAltText(imageId, validAltText(altText));
    return inGallery(owner, ownerId, imageId);
  }

  private Image inGallery(GalleryOwner owner, long ownerId, long imageId) {
    return galleries
        .findInGallery(owner, ownerId, imageId)
        .orElseThrow(() -> new NotFoundException("image", imageId));
  }

  private static String validAltText(String altText) {
    FieldRules rules = new FieldRules();
    String value = rules.optional("altText", altText, ALT_TEXT_MAX);
    rules.validate();
    return value;
  }
}
