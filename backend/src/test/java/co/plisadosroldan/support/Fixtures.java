package co.plisadosroldan.support;

import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;

/** SQL helpers for arranging test data that the seed does not contain. */
public final class Fixtures {

  private Fixtures() {}

  public static long offeringId(JdbcClient jdbc, String slug) {
    return jdbc.sql("SELECT id FROM offering WHERE slug = ?")
        .param(slug)
        .query(Long.class)
        .single();
  }

  public static long insertOffering(
      JdbcClient jdbc, String slug, String name, int displayOrder, boolean published) {
    return jdbc.sql(
            """
            INSERT INTO offering (slug, name, summary, description, display_order, published)
            VALUES (?, ?, 'Resumen de prueba', 'Descripción de prueba', ?, ?)
            RETURNING id
            """)
        .params(slug, name, displayOrder, published)
        .query(Long.class)
        .single();
  }

  public static long insertImage(JdbcClient jdbc, UUID key, int width, int height, String alt) {
    return jdbc.sql(
            """
            INSERT INTO image (storage_key, original_filename, width, height, alt_text)
            VALUES (?, 'foto.jpg', ?, ?, ?)
            RETURNING id
            """)
        .params(key, width, height, alt)
        .query(Long.class)
        .single();
  }

  public static long insertSuccessCase(
      JdbcClient jdbc,
      String slug,
      String title,
      int displayOrder,
      boolean featured,
      boolean published) {
    return jdbc.sql(
            """
            INSERT INTO success_case (slug, title, client_name, description, event_label,
                                      display_order, featured, published)
            VALUES (?, ?, 'Marca Aliada', 'Colección con acabados plisados.', 'Pasarela',
                    ?, ?, ?)
            RETURNING id
            """)
        .params(slug, title, displayOrder, featured, published)
        .query(Long.class)
        .single();
  }

  public static void relateOffering(JdbcClient jdbc, long successCaseId, long offeringId) {
    jdbc.sql("INSERT INTO success_case_offering (success_case_id, offering_id) VALUES (?, ?)")
        .params(successCaseId, offeringId)
        .update();
  }

  public static void addToSuccessCaseGallery(
      JdbcClient jdbc, long successCaseId, long imageId, int position) {
    jdbc.sql(
            "INSERT INTO success_case_image (success_case_id, image_id, position) VALUES (?, ?, ?)")
        .params(successCaseId, imageId, position)
        .update();
  }

  public static long insertTestimonial(
      JdbcClient jdbc,
      String clientName,
      String company,
      int displayOrder,
      boolean featured,
      boolean published) {
    return jdbc.sql(
            """
            INSERT INTO testimonial (client_name, company, quote, display_order, featured,
                                     published)
            VALUES (?, ?, 'Excelente trabajo y puntualidad.', ?, ?, ?)
            RETURNING id
            """)
        .params(clientName, company, displayOrder, featured, published)
        .query(Long.class)
        .single();
  }

  public static void addToOfferingGallery(
      JdbcClient jdbc, long offeringId, long imageId, int position) {
    jdbc.sql("INSERT INTO offering_image (offering_id, image_id, position) VALUES (?, ?, ?)")
        .params(offeringId, imageId, position)
        .update();
  }
}
