package co.plisadosroldan.media.api;

import co.plisadosroldan.media.domain.ImageStorage;
import co.plisadosroldan.shared.domain.NotFoundException;
import java.time.Duration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/** Serves image variants. Keys are random, so files never change: cache them for a year. */
@RestController
class MediaController {

  private static final CacheControl IMMUTABLE =
      CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable();

  private final ImageStorage storage;

  MediaController(ImageStorage storage) {
    this.storage = storage;
  }

  @GetMapping("/media/{file:.+}")
  ResponseEntity<Resource> file(@PathVariable String file) {
    return storage
        .resolve(file)
        .<ResponseEntity<Resource>>map(
            path ->
                ResponseEntity.ok()
                    .cacheControl(IMMUTABLE)
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(new FileSystemResource(path)))
        .orElseThrow(() -> new NotFoundException("media", file));
  }
}
