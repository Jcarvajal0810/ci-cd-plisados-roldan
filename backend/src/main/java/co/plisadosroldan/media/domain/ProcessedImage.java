package co.plisadosroldan.media.domain;

import java.util.Map;

/**
 * Web-ready JPEG variants of an upload.
 *
 * @param variants JPEG bytes by target width (480, 960, 1600)
 * @param width width of the largest variant
 * @param height height of the largest variant
 */
public record ProcessedImage(Map<Integer, byte[]> variants, int width, int height) {

  public ProcessedImage {
    variants = Map.copyOf(variants);
  }
}
