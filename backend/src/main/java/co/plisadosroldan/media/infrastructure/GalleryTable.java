package co.plisadosroldan.media.infrastructure;

import co.plisadosroldan.media.domain.GalleryOwner;

/** Join table and owner column for each gallery owner (fixed identifiers, never user input). */
record GalleryTable(String name, String ownerColumn) {

  static GalleryTable of(GalleryOwner owner) {
    return switch (owner) {
      case OFFERING -> new GalleryTable("offering_image", "offering_id");
      case SUCCESS_CASE -> new GalleryTable("success_case_image", "success_case_id");
    };
  }
}
