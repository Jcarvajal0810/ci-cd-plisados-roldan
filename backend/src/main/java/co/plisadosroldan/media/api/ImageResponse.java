package co.plisadosroldan.media.api;

import co.plisadosroldan.media.domain.Image;
import java.util.HashSet;
import java.util.Set;
import java.util.StringJoiner;

/** Image as exposed by the API (contracts/openapi.yaml, schema {@code Image}). */
public record ImageResponse(long id, String url, String srcset, int width, int height, String alt) {

  private static final String MEDIA_PATH = "/media/";

  /**
   * @param fallbackAlt the owner item's name or title, used when the image has no alt text
   */
  public static ImageResponse from(Image image, String fallbackAlt) {
    String alt =
        image.altText() == null || image.altText().isBlank() ? fallbackAlt : image.altText();
    return new ImageResponse(
        image.id(),
        urlOf(image, Image.DEFAULT_VARIANT_WIDTH),
        srcset(image),
        image.width(),
        image.height(),
        alt);
  }

  private static String srcset(Image image) {
    StringJoiner entries = new StringJoiner(", ");
    Set<Integer> seenWidths = new HashSet<>();
    for (int target : Image.VARIANT_WIDTHS) {
      int actual = image.actualWidth(target);
      if (seenWidths.add(actual)) {
        entries.add(urlOf(image, target) + " " + actual + "w");
      }
    }
    return entries.toString();
  }

  private static String urlOf(Image image, int targetWidth) {
    return MEDIA_PATH + Image.variantFileName(image.storageKey(), targetWidth);
  }
}
