package co.plisadosroldan.media.domain;

/** The uploaded file does not decode as JPEG, PNG or WebP. HTTP 400. */
public class UnsupportedImageException extends RuntimeException {

  public UnsupportedImageException() {
    super("Unsupported image format");
  }
}
