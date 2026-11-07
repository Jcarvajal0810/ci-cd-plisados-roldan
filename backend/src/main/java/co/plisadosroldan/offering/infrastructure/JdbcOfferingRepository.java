package co.plisadosroldan.offering.infrastructure;

import co.plisadosroldan.media.domain.GalleryOwner;
import co.plisadosroldan.media.domain.Image;
import co.plisadosroldan.media.infrastructure.JdbcGalleryReader;
import co.plisadosroldan.offering.domain.Offering;
import co.plisadosroldan.offering.domain.OfferingRepository;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
class JdbcOfferingRepository implements OfferingRepository {

  private static final String SELECT =
      "SELECT id, slug, name, summary, description, reference_price_cop, display_order,"
          + " published, updated_at FROM offering";
  private static final String ORDER = " ORDER BY display_order, updated_at DESC";

  private final JdbcClient jdbc;
  private final JdbcGalleryReader galleries;

  JdbcOfferingRepository(JdbcClient jdbc, JdbcGalleryReader galleries) {
    this.jdbc = jdbc;
    this.galleries = galleries;
  }

  @Override
  public List<Offering> findPublishedOrdered() {
    return withGalleries(jdbc.sql(SELECT + " WHERE published" + ORDER).query(this::row).list());
  }

  @Override
  public Optional<Offering> findPublishedBySlug(String slug) {
    return jdbc.sql(SELECT + " WHERE published AND slug = ?")
        .param(slug)
        .query(this::row)
        .optional()
        .map(this::withGallery);
  }

  @Override
  public List<Offering> findAllOrdered() {
    return withGalleries(jdbc.sql(SELECT + ORDER).query(this::row).list());
  }

  @Override
  public Optional<Offering> findById(long id) {
    return jdbc.sql(SELECT + " WHERE id = ?")
        .param(id)
        .query(this::row)
        .optional()
        .map(this::withGallery);
  }

  @Override
  public long insert(Offering offering) {
    return jdbc.sql(
            """
            INSERT INTO offering (slug, name, summary, description, reference_price_cop,
                                  display_order, published)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING id
            """)
        .params(
            offering.slug(),
            offering.name(),
            offering.summary(),
            offering.description(),
            offering.referencePriceCop(),
            offering.displayOrder(),
            offering.published())
        .query(Long.class)
        .single();
  }

  @Override
  public void update(long id, Offering offering) {
    jdbc.sql(
            """
            UPDATE offering
            SET name = ?, summary = ?, description = ?, reference_price_cop = ?, published = ?,
                updated_at = now()
            WHERE id = ?
            """)
        .params(
            offering.name(),
            offering.summary(),
            offering.description(),
            offering.referencePriceCop(),
            offering.published(),
            id)
        .update();
  }

  @Override
  public void delete(long id) {
    jdbc.sql("DELETE FROM offering WHERE id = ?").param(id).update();
  }

  @Override
  public int maxDisplayOrder() {
    return jdbc.sql("SELECT coalesce(max(display_order), 0) FROM offering")
        .query(Integer.class)
        .single();
  }

  @Override
  public boolean slugExists(String slug) {
    return jdbc.sql("SELECT EXISTS (SELECT 1 FROM offering WHERE slug = ?)")
        .param(slug)
        .query(Boolean.class)
        .single();
  }

  @Override
  public Set<Long> allIds() {
    return new HashSet<>(jdbc.sql("SELECT id FROM offering").query(Long.class).list());
  }

  @Override
  public void updatePositions(Map<Long, Integer> positions) {
    positions.forEach(
        (id, position) ->
            jdbc.sql("UPDATE offering SET display_order = ? WHERE id = ?")
                .params(position, id)
                .update());
  }

  private List<Offering> withGalleries(List<Offering> offerings) {
    Map<Long, List<Image>> images =
        galleries.galleries(GalleryOwner.OFFERING, offerings.stream().map(Offering::id).toList());
    return offerings.stream()
        .map(offering -> withImages(offering, images.getOrDefault(offering.id(), List.of())))
        .toList();
  }

  private Offering withGallery(Offering offering) {
    return withImages(offering, galleries.gallery(GalleryOwner.OFFERING, offering.id()));
  }

  private static Offering withImages(Offering o, List<Image> images) {
    return new Offering(
        o.id(),
        o.slug(),
        o.name(),
        o.summary(),
        o.description(),
        o.referencePriceCop(),
        o.displayOrder(),
        o.published(),
        images,
        o.updatedAt());
  }

  private Offering row(ResultSet rs, int rowNum) throws SQLException {
    return new Offering(
        rs.getLong("id"),
        rs.getString("slug"),
        rs.getString("name"),
        rs.getString("summary"),
        rs.getString("description"),
        rs.getObject("reference_price_cop", Long.class),
        rs.getInt("display_order"),
        rs.getBoolean("published"),
        List.of(),
        rs.getObject("updated_at", OffsetDateTime.class).toInstant());
  }
}
