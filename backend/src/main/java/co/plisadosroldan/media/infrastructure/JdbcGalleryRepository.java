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
    GalleryTable t = GalleryTable.of(owner);
    jdbc.sql(
            """
            INSERT INTO %1$s (%2$s, image_id, position)
            SELECT ?, ?, coalesce(max(position), 0) + 1 FROM %1$s WHERE %2$s = ?
            """
                .formatted(t.name(), t.ownerColumn()))
        .params(ownerId, imageId, ownerId)
        .update();
  }

  @Override
  public int countImages(GalleryOwner owner, long ownerId) {
    GalleryTable t = GalleryTable.of(owner);
    return jdbc.sql("SELECT count(*) FROM %s WHERE %s = ?".formatted(t.name(), t.ownerColumn()))
        .param(ownerId)
        .query(Integer.class)
        .single();
  }

  @Override
  public List<Long> imageIds(GalleryOwner owner, long ownerId) {
    GalleryTable t = GalleryTable.of(owner);
    return jdbc.sql(
            "SELECT image_id FROM %s WHERE %s = ? ORDER BY position"
                .formatted(t.name(), t.ownerColumn()))
        .param(ownerId)
        .query(Long.class)
        .list();
  }

  @Override
  public Optional<Image> findInGallery(GalleryOwner owner, long ownerId, long imageId) {
    GalleryTable t = GalleryTable.of(owner);
    return jdbc.sql(
            """
            SELECT i.id, i.storage_key, i.width, i.height, i.alt_text
            FROM image i JOIN %s g ON g.image_id = i.id
            WHERE g.%s = ? AND i.id = ?
            """
                .formatted(t.name(), t.ownerColumn()))
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
    GalleryTable t = GalleryTable.of(owner);
    String sql =
        "UPDATE %s SET position = ? WHERE %s = ? AND image_id = ?"
            .formatted(t.name(), t.ownerColumn());
    positions.forEach(
        (imageId, position) -> jdbc.sql(sql).params(position, ownerId, imageId).update());
  }

  @Override
  public void updateAltText(long imageId, String altText) {
    jdbc.sql("UPDATE image SET alt_text = ? WHERE id = ?").params(altText, imageId).update();
  }
}
