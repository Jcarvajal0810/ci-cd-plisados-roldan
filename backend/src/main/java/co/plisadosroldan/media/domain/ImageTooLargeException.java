package co.plisadosroldan.media.domain;

/** The uploaded file exceeds the 10 MB limit (FR-018). HTTP 413. */
public class ImageTooLargeException extends RuntimeException {

  public ImageTooLargeException(long maxBytes) {
    super("Images must be at most " + maxBytes + " bytes");
  }
}
