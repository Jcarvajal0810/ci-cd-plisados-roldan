package co.plisadosroldan.media.domain;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/** Persistence port for images and the ordered galleries that own them. */
public interface GalleryRepository {

  long insertImage(UUID key, String originalFilename, int width, int height, String altText);

  void addToGallery(GalleryOwner owner, long ownerId, long imageId);

  int countImages(GalleryOwner owner, long ownerId);

  /** IDs of the owner's images in gallery order. */
  List<Long> imageIds(GalleryOwner owner, long ownerId);

  /** The image, only if it belongs to the owner's gallery. */
  Optional<Image> findInGallery(GalleryOwner owner, long ownerId, long imageId);

  /** Deletes the image rows (gallery rows cascade) and returns their storage keys. */
  List<UUID> deleteImages(List<Long> imageIds);

  void updatePositions(GalleryOwner owner, long ownerId, Map<Long, Integer> positions);

  void updateAltText(long imageId, String altText);
}
