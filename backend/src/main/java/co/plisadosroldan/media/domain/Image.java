package co.plisadosroldan.media.domain;

import java.util.List;
import java.util.UUID;

/**
 * An uploaded photo stored as resized JPEG variants (research R8).
 *
 * @param width width of the largest stored variant
 * @param height height of the largest stored variant
 * @param altText owner-provided alternative text, may be {@code null}
 */
public record Image(long id, UUID storageKey, int width, int height, String altText) {

  /** Target widths of the stored variants; images are never upscaled. */
  public static final List<Integer> VARIANT_WIDTHS = List.of(480, 960, 1600);

  /** Variant used as the default {@code src}. */
  public static final int DEFAULT_VARIANT_WIDTH = 960;

  public static String variantFileName(UUID storageKey, int targetWidth) {
    return storageKey + "-" + targetWidth + ".jpg";
  }

  /** Real pixel width of the variant stored for {@code targetWidth}. */
  public int actualWidth(int targetWidth) {
    return Math.min(targetWidth, width);
  }
}
