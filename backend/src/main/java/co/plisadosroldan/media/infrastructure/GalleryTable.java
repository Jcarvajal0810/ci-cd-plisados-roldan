package co.plisadosroldan.media.infrastructure;

import co.plisadosroldan.media.domain.GalleryOwner;

/**
 * SQL for each gallery join table. Table and column names are fixed here, one constant per owner,
 * and every statement is built once at class load; values always go as bind parameters.
 */
enum GalleryTable {
  OFFERING("offering_image", "offering_id"),
  SUCCESS_CASE("success_case_image", "success_case_id");

  /** Appends an image at the end of an owner's gallery. Params: ownerId, imageId, ownerId. */
  final String addToGallery;

  /** Number of images in an owner's gallery. Param: ownerId. */
  final String countImages;

  /** Image ids of an owner's gallery in order. Param: ownerId. */
  final String imageIds;

  /** One image of an owner's gallery. Params: ownerId, imageId. */
  final String findInGallery;

  /** Moves one image of an owner's gallery. Params: position, ownerId, imageId. */
  final String updatePosition;

  /** Ordered images of several owners. Named param: ownerIds. */
  final String galleries;

  GalleryTable(String table, String ownerColumn) {
    addToGallery =
        "INSERT INTO "
            + table
            + " ("
            + ownerColumn
            + ", image_id, position) SELECT ?, ?, coalesce(max(position), 0) + 1 FROM "
            + table
            + " WHERE "
            + ownerColumn
            + " = ?";
    countImages = "SELECT count(*) FROM " + table + " WHERE " + ownerColumn + " = ?";
    imageIds = "SELECT image_id FROM " + table + " WHERE " + ownerColumn + " = ? ORDER BY position";
    findInGallery =
        "SELECT i.id, i.storage_key, i.width, i.height, i.alt_text FROM image i JOIN "
            + table
            + " g ON g.image_id = i.id WHERE g."
            + ownerColumn
            + " = ? AND i.id = ?";
    updatePosition =
        "UPDATE " + table + " SET position = ? WHERE " + ownerColumn + " = ? AND image_id = ?";
    galleries =
        "SELECT g."
            + ownerColumn
            + " AS owner_id, i.id, i.storage_key, i.width, i.height, i.alt_text FROM "
            + table
            + " g JOIN image i ON i.id = g.image_id WHERE g."
            + ownerColumn
            + " IN (:ownerIds) ORDER BY g."
            + ownerColumn
            + ", g.position";
  }

  static GalleryTable of(GalleryOwner owner) {
    return switch (owner) {
      case OFFERING -> OFFERING;
      case SUCCESS_CASE -> SUCCESS_CASE;
    };
  }
}
