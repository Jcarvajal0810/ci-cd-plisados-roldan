package co.plisadosroldan.media.domain;

/** The gallery already holds the maximum number of images. HTTP 409. */
public class GalleryFullException extends RuntimeException {

  public GalleryFullException(int limit) {
    super("A gallery can hold at most " + limit + " images");
  }
}
