package co.plisadosroldan.media.infrastructure;

import co.plisadosroldan.media.domain.GalleryOwner;
import co.plisadosroldan.media.domain.GalleryRepository;
import co.plisadosroldan.media.domain.Image;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
class JdbcGalleryRepository implements GalleryRepository {

  private final JdbcClient jdbc;

  JdbcGalleryRepository(JdbcClient jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public long insertImage(
      UUID key, String originalFilename, int width, int height, String altText) {
    return jdbc.sql(
            """
            INSERT INTO image (storage_key, original_filename, width, height, alt_text)
            VALUES (?, ?, ?, ?, ?)
            RETURNING id
            """)
        .params(key, originalFilename, width, height, altText)
        .query(Long.class)
        .single();
  }

  @Override
  public void addToGallery(GalleryOwner owner, long ownerId, long imageId) {
    jdbc.sql(GalleryTable.of(owner).addToGallery).params(ownerId, imageId, ownerId).update();
  }

  @Override
  public int countImages(GalleryOwner owner, long ownerId) {
    return jdbc.sql(GalleryTable.of(owner).countImages)
        .param(ownerId)
        .query(Integer.class)
        .single();
  }

  @Override
  public List<Long> imageIds(GalleryOwner owner, long ownerId) {
    return jdbc.sql(GalleryTable.of(owner).imageIds).param(ownerId).query(Long.class).list();
  }

  @Override
  public Optional<Image> findInGallery(GalleryOwner owner, long ownerId, long imageId) {
    return jdbc.sql(GalleryTable.of(owner).findInGallery)
        .params(ownerId, imageId)
        .query(
            (rs, n) ->
                new Image(
                    rs.getLong("id"),
                    rs.getObject("storage_key", UUID.class),
                    rs.getInt("width"),
                    rs.getInt("height"),
                    rs.getString("alt_text")))
        .optional();
  }

  @Override
  public List<UUID> deleteImages(List<Long> imageIds) {
    if (imageIds.isEmpty()) {
      return List.of();
    }
    return jdbc.sql("DELETE FROM image WHERE id IN (:ids) RETURNING storage_key")
        .param("ids", imageIds)
        .query(UUID.class)
        .list();
  }

  @Override
  public void updatePositions(GalleryOwner owner, long ownerId, Map<Long, Integer> positions) {
    String sql = GalleryTable.of(owner).updatePosition;
    positions.forEach(
        (imageId, position) -> jdbc.sql(sql).params(position, ownerId, imageId).update());
  }

  @Override
  public void updateAltText(long imageId, String altText) {
    jdbc.sql("UPDATE image SET alt_text = ? WHERE id = ?").params(altText, imageId).update();
  }
}
