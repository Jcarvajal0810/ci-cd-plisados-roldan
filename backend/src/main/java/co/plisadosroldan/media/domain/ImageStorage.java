package co.plisadosroldan.media.domain;

import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/** Port: where image variant files live (local file system today; research R8). */
public interface ImageStorage {

  /** Stores each variant as {@code {key}-{width}.jpg}. */
  void write(UUID key, Map<Integer, byte[]> variants);

  /** Deletes every variant of {@code key}; missing files are ignored. */
  void deleteAll(UUID key);

  /** The file for a well-formed variant name, if it exists; never escapes the storage root. */
  Optional<Path> resolve(String fileName);
}
