package co.plisadosroldan.media.domain;

/** Port: turns an uploaded file into resized web variants (research R8). */
public interface ImageProcessor {

  /**
   * @throws UnsupportedImageException when the bytes do not decode as JPEG, PNG or WebP
   */
  ProcessedImage process(byte[] upload);
}
