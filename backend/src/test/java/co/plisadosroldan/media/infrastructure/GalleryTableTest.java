package co.plisadosroldan.media.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import co.plisadosroldan.media.domain.GalleryOwner;
import org.junit.jupiter.api.Test;

class GalleryTableTest {

  @Test
  void eachOwnerUsesItsOwnJoinTableAndColumn() {
    GalleryTable offerings = GalleryTable.of(GalleryOwner.OFFERING);
    GalleryTable cases = GalleryTable.of(GalleryOwner.SUCCESS_CASE);

    assertThat(offerings.countImages)
        .isEqualTo("SELECT count(*) FROM offering_image WHERE offering_id = ?");
    assertThat(cases.updatePosition)
        .isEqualTo(
            "UPDATE success_case_image SET position = ? WHERE success_case_id = ? AND image_id ="
                + " ?");
  }

  @Test
  void everyStatementUsesBindParametersOnly() {
    for (GalleryTable table : GalleryTable.values()) {
      assertThat(table.addToGallery).contains("SELECT ?, ?").endsWith(" = ?");
      assertThat(table.imageIds).endsWith("= ? ORDER BY position");
      assertThat(table.findInGallery).endsWith("= ? AND i.id = ?");
      assertThat(table.galleries).contains("IN (:ownerIds)");
    }
  }
}
