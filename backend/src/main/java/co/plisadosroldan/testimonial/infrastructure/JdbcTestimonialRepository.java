package co.plisadosroldan.testimonial.infrastructure;

import co.plisadosroldan.media.domain.Image;
import co.plisadosroldan.testimonial.domain.Testimonial;
import co.plisadosroldan.testimonial.domain.TestimonialRepository;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
class JdbcTestimonialRepository implements TestimonialRepository {

  static final String SELECT =
      """
      SELECT t.id, t.client_name, t.company, t.quote, t.display_order, t.featured, t.published,
             t.updated_at, i.id AS image_id, i.storage_key, i.width, i.height, i.alt_text
      FROM testimonial t LEFT JOIN image i ON i.id = t.photo_image_id
      """;
  static final String ORDER = " ORDER BY t.display_order, t.updated_at DESC";

  final JdbcClient jdbc;

  JdbcTestimonialRepository(JdbcClient jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public List<Testimonial> findPublishedOrdered() {
    return jdbc.sql(SELECT + " WHERE t.published" + ORDER).query(this::row).list();
  }

  @Override
  public List<Testimonial> findFeaturedPublished() {
    return jdbc.sql(SELECT + " WHERE t.published AND t.featured" + ORDER).query(this::row).list();
  }

  @Override
  public List<Testimonial> findAllOrdered() {
    return jdbc.sql(SELECT + ORDER).query(this::row).list();
  }

  @Override
  public Optional<Testimonial> findById(long id) {
    return jdbc.sql(SELECT + " WHERE t.id = ?").param(id).query(this::row).optional();
  }

  @Override
  public long insert(Testimonial t) {
    return jdbc.sql(
            """
            INSERT INTO testimonial (client_name, company, quote, display_order, featured,
                                     published)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING id
            """)
        .params(
            t.clientName(), t.company(), t.quote(), t.displayOrder(), t.featured(), t.published())
        .query(Long.class)
        .single();
  }

  @Override
  public void update(long id, Testimonial t) {
    jdbc.sql(
            """
            UPDATE testimonial
            SET client_name = ?, company = ?, quote = ?, featured = ?, published = ?,
                updated_at = now()
            WHERE id = ?
            """)
        .params(t.clientName(), t.company(), t.quote(), t.featured(), t.published(), id)
        .update();
  }

  @Override
  public void delete(long id) {
    jdbc.sql("DELETE FROM testimonial WHERE id = ?").param(id).update();
  }

  @Override
  public int maxDisplayOrder() {
    return jdbc.sql("SELECT coalesce(max(display_order), 0) FROM testimonial")
        .query(Integer.class)
        .single();
  }

  @Override
  public Set<Long> allIds() {
    return new HashSet<>(jdbc.sql("SELECT id FROM testimonial").query(Long.class).list());
  }

  @Override
  public void updatePositions(Map<Long, Integer> positions) {
    positions.forEach(
        (id, position) ->
            jdbc.sql("UPDATE testimonial SET display_order = ? WHERE id = ?")
                .params(position, id)
                .update());
  }

  @Override
  public void setPhoto(long id, Long imageId) {
    jdbc.sql("UPDATE testimonial SET photo_image_id = ?, updated_at = now() WHERE id = ?")
        .params(imageId, id)
        .update();
  }

  Testimonial row(ResultSet rs, int rowNum) throws SQLException {
    long imageId = rs.getLong("image_id");
    Image photo =
        rs.wasNull()
            ? null
            : new Image(
                imageId,
                rs.getObject("storage_key", UUID.class),
                rs.getInt("width"),
                rs.getInt("height"),
                rs.getString("alt_text"));
    return new Testimonial(
        rs.getLong("id"),
        rs.getString("client_name"),
        rs.getString("company"),
        rs.getString("quote"),
        photo,
        rs.getInt("display_order"),
        rs.getBoolean("featured"),
        rs.getBoolean("published"),
        rs.getObject("updated_at", OffsetDateTime.class).toInstant());
  }
}
