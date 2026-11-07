package co.plisadosroldan.support;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.support.TransactionTemplate;

/** Integrity rules marked [DB] in data-model.md are enforced by the database itself. */
class SchemaConstraintsIT extends IntegrationTest {

  @Autowired private TransactionTemplate tx;

  @Test
  void onlyOneBusinessProfileRowIsAllowed() {
    assertViolation(
        """
        INSERT INTO business_profile (id, business_name, slogan, about_text, whatsapp_number,
          location_text, schedule_text, updated_at)
        VALUES (2, 'X', 'Y', 'Z', '573000000000', 'L', 'S', now())
        """);
  }

  @Test
  void whatsappNumberMustBeTenToFifteenDigits() {
    assertViolation("UPDATE business_profile SET whatsapp_number = '+57 311' WHERE id = 1");
    assertViolation("UPDATE business_profile SET whatsapp_number = '123' WHERE id = 1");
  }

  @Test
  void referencePriceMustBePositive() {
    assertViolation("UPDATE offering SET reference_price_cop = 0 WHERE slug = 'plisado'");
  }

  @Test
  void offeringSlugIsUnique() {
    assertViolation(insertOffering("plisado", "Otro plisado", 99));
  }

  @Test
  void offeringNameMustNotBeBlank() {
    assertViolation(insertOffering("en-blanco", "   ", 99));
  }

  @Test
  void displayOrderStartsAtOne() {
    assertViolation(insertOffering("orden-cero", "Orden cero", 0));
  }

  @Test
  void adminEmailIsUniqueIgnoringCase() {
    jdbc.sql(
            "INSERT INTO admin_user (email, password_hash, created_at)"
                + " VALUES ('Owner@Example.com', 'x', now())")
        .update();
    assertViolation(
        "INSERT INTO admin_user (email, password_hash, created_at)"
            + " VALUES ('owner@example.com', 'y', now())");
  }

  @Test
  void anImageBelongsToOneGalleryOnly() {
    long imageId = insertImage();
    long plisado = offeringId("plisado");
    long trillado = offeringId("trillado");
    jdbc.sql("INSERT INTO offering_image (offering_id, image_id, position) VALUES (?, ?, 1)")
        .params(plisado, imageId)
        .update();
    assertViolation(
        "INSERT INTO offering_image (offering_id, image_id, position) VALUES ("
            + trillado
            + ", "
            + imageId
            + ", 1)");
  }

  @Test
  void galleryPositionsCanBeSwappedInsideOneTransaction() {
    long plisado = offeringId("plisado");
    long first = insertImage();
    long second = insertImage();
    jdbc.sql("INSERT INTO offering_image (offering_id, image_id, position) VALUES (?, ?, 1)")
        .params(plisado, first)
        .update();
    jdbc.sql("INSERT INTO offering_image (offering_id, image_id, position) VALUES (?, ?, 2)")
        .params(plisado, second)
        .update();

    tx.executeWithoutResult(
        status -> {
          jdbc.sql("UPDATE offering_image SET position = 2 WHERE image_id = ?")
              .param(first)
              .update();
          jdbc.sql("UPDATE offering_image SET position = 1 WHERE image_id = ?")
              .param(second)
              .update();
        });

    Integer firstPosition =
        jdbc.sql("SELECT position FROM offering_image WHERE image_id = ?")
            .param(first)
            .query(Integer.class)
            .single();
    assertThat(firstPosition).isEqualTo(2);
  }

  @Test
  void duplicateGalleryPositionsAreRejectedAtCommit() {
    long plisado = offeringId("plisado");
    long first = insertImage();
    long second = insertImage();
    jdbc.sql("INSERT INTO offering_image (offering_id, image_id, position) VALUES (?, ?, 1)")
        .params(plisado, first)
        .update();
    assertViolation(
        "INSERT INTO offering_image (offering_id, image_id, position) VALUES ("
            + plisado
            + ", "
            + second
            + ", 1)");
  }

  private void assertViolation(String sql) {
    assertThatThrownBy(() -> tx.executeWithoutResult(status -> jdbc.sql(sql).update()))
        .isInstanceOf(DataIntegrityViolationException.class);
  }

  private static String insertOffering(String slug, String name, int displayOrder) {
    return """
        INSERT INTO offering (slug, name, summary, description, display_order, published,
          created_at, updated_at)
        VALUES ('%s', '%s', 'Resumen', 'Descripción', %d, false, now(), now())
        """
        .formatted(slug, name, displayOrder);
  }

  private long offeringId(String slug) {
    return jdbc.sql("SELECT id FROM offering WHERE slug = ?")
        .param(slug)
        .query(Long.class)
        .single();
  }

  private long insertImage() {
    return jdbc.sql(
            """
            INSERT INTO image (storage_key, original_filename, width, height, created_at)
            VALUES (?, 'foto.jpg', 1600, 1200, now())
            RETURNING id
            """)
        .param(UUID.randomUUID())
        .query(Long.class)
        .single();
  }
}
