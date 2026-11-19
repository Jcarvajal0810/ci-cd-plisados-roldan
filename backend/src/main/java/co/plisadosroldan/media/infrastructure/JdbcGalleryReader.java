package co.plisadosroldan.media.infrastructure;

import co.plisadosroldan.media.domain.GalleryOwner;
import co.plisadosroldan.media.domain.Image;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

/** Reads ordered galleries for several owners in one query (shared by offerings and cases). */
@Component
public class JdbcGalleryReader {

  private final JdbcClient jdbc;

  public JdbcGalleryReader(JdbcClient jdbc) {
    this.jdbc = jdbc;
  }

  /** Images per owner ID, ordered by gallery position; owners without images are absent. */
  public Map<Long, List<Image>> galleries(GalleryOwner owner, Collection<Long> ownerIds) {
    Map<Long, List<Image>> result = new HashMap<>();
    if (ownerIds.isEmpty()) {
      return result;
    }
    GalleryTable table = GalleryTable.of(owner);
    String sql =
        """
        SELECT g.%1$s AS owner_id, i.id, i.storage_key, i.width, i.height, i.alt_text
        FROM %2$s g JOIN image i ON i.id = g.image_id
        WHERE g.%1$s IN (:ownerIds)
        ORDER BY g.%1$s, g.position
        """
            .formatted(table.ownerColumn(), table.name());
    jdbc.sql(sql)
        .param("ownerIds", ownerIds)
        .query(
            (rs, rowNum) -> {
              Image image =
                  new Image(
                      rs.getLong("id"),
                      rs.getObject("storage_key", UUID.class),
                      rs.getInt("width"),
                      rs.getInt("height"),
                      rs.getString("alt_text"));
              result.computeIfAbsent(rs.getLong("owner_id"), id -> new ArrayList<>()).add(image);
              return image;
            })
        .list();
    return result;
  }

  public List<Image> gallery(GalleryOwner owner, long ownerId) {
    return galleries(owner, List.of(ownerId)).getOrDefault(ownerId, List.of());
  }
}
