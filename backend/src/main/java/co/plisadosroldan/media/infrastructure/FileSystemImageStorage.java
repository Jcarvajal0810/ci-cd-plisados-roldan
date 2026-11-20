package co.plisadosroldan.media.infrastructure;

import co.plisadosroldan.media.domain.Image;
import co.plisadosroldan.media.domain.ImageStorage;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

/** Stores image variants as files under {@code app.media-root}. */
class FileSystemImageStorage implements ImageStorage {

  private static final Pattern VARIANT_NAME =
      Pattern.compile(
          "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(480|960|1600)\\.jpg$");

  private final Path root;

  FileSystemImageStorage(Path root) {
    this.root = root.toAbsolutePath().normalize();
    try {
      Files.createDirectories(this.root);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  @Override
  public void write(UUID key, Map<Integer, byte[]> variants) {
    variants.forEach(
        (width, bytes) -> {
          try {
            Files.write(root.resolve(Image.variantFileName(key, width)), bytes);
          } catch (IOException e) {
            throw new UncheckedIOException(e);
          }
        });
  }

  @Override
  public void deleteAll(UUID key) {
    for (int width : Image.VARIANT_WIDTHS) {
      try {
        Files.deleteIfExists(root.resolve(Image.variantFileName(key, width)));
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    }
  }

  @Override
  public Optional<Path> resolve(String fileName) {
    if (fileName == null || !VARIANT_NAME.matcher(fileName).matches()) {
      return Optional.empty();
    }
    Path file = root.resolve(fileName).normalize();
    return file.startsWith(root) && Files.isRegularFile(file)
        ? Optional.of(file)
        : Optional.empty();
  }
}
