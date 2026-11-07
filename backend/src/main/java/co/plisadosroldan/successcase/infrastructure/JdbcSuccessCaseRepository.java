package co.plisadosroldan.successcase.infrastructure;

import co.plisadosroldan.media.domain.GalleryOwner;
import co.plisadosroldan.media.domain.Image;
import co.plisadosroldan.media.infrastructure.JdbcGalleryReader;
import co.plisadosroldan.successcase.domain.RelatedOffering;
import co.plisadosroldan.successcase.domain.SuccessCase;
import co.plisadosroldan.successcase.domain.SuccessCaseRepository;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
class JdbcSuccessCaseRepository implements SuccessCaseRepository {

  static final String SELECT =
      "SELECT id, slug, title, client_name, description, event_label, event_date, display_order,"
          + " featured, published, updated_at FROM success_case";
  static final String ORDER = " ORDER BY display_order, updated_at DESC";

  final JdbcClient jdbc;
  private final JdbcGalleryReader galleries;

  JdbcSuccessCaseRepository(JdbcClient jdbc, JdbcGalleryReader galleries) {
    this.jdbc = jdbc;
    this.galleries = galleries;
  }

  @Override
  public List<SuccessCase> findPublishedOrdered() {
    return complete(jdbc.sql(SELECT + " WHERE published" + ORDER).query(this::row).list());
  }

  @Override
  public Optional<SuccessCase> findPublishedBySlug(String slug) {
    return jdbc.sql(SELECT + " WHERE published AND slug = ?")
        .param(slug)
        .query(this::row)
        .optional()
        .map(found -> complete(List.of(found)).getFirst());
  }

  @Override
  public List<SuccessCase> findFeaturedPublished() {
    return complete(
        jdbc.sql(SELECT + " WHERE published AND featured" + ORDER).query(this::row).list());
  }

  @Override
  public List<SuccessCase> findAllOrdered() {
    return complete(jdbc.sql(SELECT + ORDER).query(this::row).list());
  }

  @Override
  public Optional<SuccessCase> findById(long id) {
    return jdbc.sql(SELECT + " WHERE id = ?")
        .param(id)
        .query(this::row)
        .optional()
        .map(found -> complete(List.of(found)).getFirst());
  }

  @Override
  public long insert(SuccessCase c) {
    return jdbc.sql(
            """
            INSERT INTO success_case (slug, title, client_name, description, event_label,
                                      event_date, display_order, featured, published)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING id
            """)
        .params(
            c.slug(),
            c.title(),
            c.clientName(),
            c.description(),
            c.eventLabel(),
            c.eventDate(),
            c.displayOrder(),
            c.featured(),
            c.published())
        .query(Long.class)
        .single();
  }

  @Override
  public void update(long id, SuccessCase c) {
    jdbc.sql(
            """
            UPDATE success_case
            SET title = ?, client_name = ?, description = ?, event_label = ?, event_date = ?,
                featured = ?, published = ?, updated_at = now()
            WHERE id = ?
            """)
        .params(
            c.title(),
            c.clientName(),
            c.description(),
            c.eventLabel(),
            c.eventDate(),
            c.featured(),
            c.published(),
            id)
        .update();
  }

  @Override
  public void delete(long id) {
    jdbc.sql("DELETE FROM success_case WHERE id = ?").param(id).update();
  }

  @Override
  public int maxDisplayOrder() {
    return jdbc.sql("SELECT coalesce(max(display_order), 0) FROM success_case")
        .query(Integer.class)
        .single();
  }

  @Override
  public boolean slugExists(String slug) {
    return jdbc.sql("SELECT EXISTS (SELECT 1 FROM success_case WHERE slug = ?)")
        .param(slug)
        .query(Boolean.class)
        .single();
  }

  @Override
  public Set<Long> allIds() {
    return new HashSet<>(jdbc.sql("SELECT id FROM success_case").query(Long.class).list());
  }

  @Override
  public void updatePositions(Map<Long, Integer> positions) {
    positions.forEach(
        (id, position) ->
            jdbc.sql("UPDATE success_case SET display_order = ? WHERE id = ?")
                .params(position, id)
                .update());
  }

  @Override
  public void replaceRelatedOfferings(long successCaseId, List<Long> offeringIds) {
    jdbc.sql("DELETE FROM success_case_offering WHERE success_case_id = ?")
        .param(successCaseId)
        .update();
    for (long offeringId : offeringIds) {
      jdbc.sql("INSERT INTO success_case_offering (success_case_id, offering_id) VALUES (?, ?)")
          .params(successCaseId, offeringId)
          .update();
    }
  }

  @Override
  public Set<Long> existingOfferingIds(Collection<Long> offeringIds) {
    if (offeringIds.isEmpty()) {
      return Set.of();
    }
    return new HashSet<>(
        jdbc.sql("SELECT id FROM offering WHERE id IN (:ids)")
            .param("ids", offeringIds)
            .query(Long.class)
            .list());
  }

  /** Adds galleries and related offerings to every case with two queries in total. */
  List<SuccessCase> complete(List<SuccessCase> cases) {
    List<Long> ids = cases.stream().map(SuccessCase::id).toList();
    Map<Long, List<Image>> images = galleries.galleries(GalleryOwner.SUCCESS_CASE, ids);
    Map<Long, List<RelatedOffering>> related = relatedOfferings(ids);
    return cases.stream()
        .map(
            c ->
                c.withImagesAndOfferings(
                    images.getOrDefault(c.id(), List.of()),
                    related.getOrDefault(c.id(), List.of())))
        .toList();
  }

  private Map<Long, List<RelatedOffering>> relatedOfferings(List<Long> caseIds) {
    Map<Long, List<RelatedOffering>> result = new HashMap<>();
    if (caseIds.isEmpty()) {
      return result;
    }
    jdbc.sql(
            """
            SELECT sco.success_case_id, o.id, o.slug, o.name, o.published
            FROM success_case_offering sco JOIN offering o ON o.id = sco.offering_id
            WHERE sco.success_case_id IN (:ids)
            ORDER BY o.display_order
            """)
        .param("ids", caseIds)
        .query(
            (rs, n) -> {
              RelatedOffering offering =
                  new RelatedOffering(
                      rs.getLong("id"),
                      rs.getString("slug"),
                      rs.getString("name"),
                      rs.getBoolean("published"));
              result
                  .computeIfAbsent(rs.getLong("success_case_id"), k -> new ArrayList<>())
                  .add(offering);
              return offering;
            })
        .list();
    return result;
  }

  SuccessCase row(ResultSet rs, int rowNum) throws SQLException {
    return new SuccessCase(
        rs.getLong("id"),
        rs.getString("slug"),
        rs.getString("title"),
        rs.getString("client_name"),
        rs.getString("description"),
        rs.getString("event_label"),
        rs.getObject("event_date", LocalDate.class),
        rs.getInt("display_order"),
        rs.getBoolean("featured"),
        rs.getBoolean("published"),
        List.of(),
        List.of(),
        rs.getObject("updated_at", OffsetDateTime.class).toInstant());
  }
}
