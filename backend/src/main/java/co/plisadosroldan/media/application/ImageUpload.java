package co.plisadosroldan.media.application;

import java.util.Arrays;
import java.util.Objects;

/**
 * An uploaded file as received from the owner.
 *
 * @param size declared size in bytes (checked before decoding)
 * @param altText optional alternative text
 */
public record ImageUpload(byte[] bytes, String originalFilename, long size, String altText) {

  // Records compare arrays by reference; compare the uploaded content instead.
  @Override
  public boolean equals(Object other) {
    return other instanceof ImageUpload that
        && size == that.size
        && Arrays.equals(bytes, that.bytes)
        && Objects.equals(originalFilename, that.originalFilename)
        && Objects.equals(altText, that.altText);
  }

  @Override
  public int hashCode() {
    return 31 * Objects.hash(originalFilename, size, altText) + Arrays.hashCode(bytes);
  }

  /** Does not print the file content, only its length. */
  @Override
  public String toString() {
    return "ImageUpload[bytes="
        + (bytes == null ? 0 : bytes.length)
        + " bytes, originalFilename="
        + originalFilename
        + ", size="
        + size
        + ", altText="
        + altText
        + "]";
  }
}
