package co.plisadosroldan.media.api;

import co.plisadosroldan.media.application.ImageUpload;
import java.io.IOException;
import java.io.UncheckedIOException;
import org.springframework.web.multipart.MultipartFile;

/** Converts multipart uploads into the application's {@link ImageUpload}. */
public final class ImageUploads {

  private ImageUploads() {}

  public static ImageUpload from(MultipartFile file, String altText) {
    try {
      String name = file.getOriginalFilename() == null ? "imagen" : file.getOriginalFilename();
      return new ImageUpload(file.getBytes(), name, file.getSize(), altText);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  /** Contract request body {@code AltText}. */
  public record AltTextRequest(String altText) {}
}
