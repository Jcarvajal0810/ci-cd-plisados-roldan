package co.plisadosroldan.profile.infrastructure;

import co.plisadosroldan.profile.domain.BusinessProfile;
import co.plisadosroldan.profile.domain.BusinessProfileRepository;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
class JdbcBusinessProfileRepository implements BusinessProfileRepository {

  private final JdbcClient jdbc;

  JdbcBusinessProfileRepository(JdbcClient jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public BusinessProfile get() {
    return jdbc.sql(
            """
            SELECT business_name, slogan, about_text, whatsapp_number, location_text, schedule_text
            FROM business_profile WHERE id = 1
            """)
        .query(
            (rs, rowNum) ->
                new BusinessProfile(
                    rs.getString("business_name"),
                    rs.getString("slogan"),
                    rs.getString("about_text"),
                    rs.getString("whatsapp_number"),
                    rs.getString("location_text"),
                    rs.getString("schedule_text")))
        .single();
  }

  @Override
  public void update(BusinessProfile profile) {
    jdbc.sql(
            """
            UPDATE business_profile
            SET business_name = ?, slogan = ?, about_text = ?, whatsapp_number = ?,
                location_text = ?, schedule_text = ?, updated_at = now()
            WHERE id = 1
            """)
        .params(
            profile.businessName(),
            profile.slogan(),
            profile.aboutText(),
            profile.whatsappNumber(),
            profile.locationText(),
            profile.scheduleText())
        .update();
  }
}
