package co.plisadosroldan.media.application;

import co.plisadosroldan.media.domain.ImageProcessor;
import co.plisadosroldan.media.domain.ImageStorage;
import co.plisadosroldan.media.domain.ImageTooLargeException;
import co.plisadosroldan.media.domain.ProcessedImage;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Keeps image files consistent with the surrounding database transaction (research R9): files
 * written during a transaction are deleted if it rolls back; files of removed images are deleted
 * only after it commits. Must be called inside an active transaction.
 */
@Component
public class ImageFiles {

  /** FR-018: uploads up to 10 MB. */
  public static final long MAX_UPLOAD_BYTES = 10L * 1024 * 1024;

  private static final Logger log = LoggerFactory.getLogger(ImageFiles.class);

  private final ImageProcessor processor;
  private final ImageStorage storage;

  public ImageFiles(ImageProcessor processor, ImageStorage storage) {
    this.processor = processor;
    this.storage = storage;
  }

  /** Validates, resizes and stores an upload; the files disappear again on rollback. */
  public StoredImage store(ImageUpload upload) {
    if (upload.size() > MAX_UPLOAD_BYTES || upload.bytes().length > MAX_UPLOAD_BYTES) {
      throw new ImageTooLargeException(MAX_UPLOAD_BYTES);
    }
    ProcessedImage processed = processor.process(upload.bytes());
    UUID key = UUID.randomUUID();
    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
          @Override
          public void afterCompletion(int status) {
            if (status != STATUS_COMMITTED) {
              deleteQuietly(key);
            }
          }
        });
    storage.write(key, processed.variants());
    return new StoredImage(key, processed.width(), processed.height());
  }

  /** Deletes the files of {@code key} once the current transaction has committed. */
  public void deleteAfterCommit(UUID key) {
    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
          @Override
          public void afterCommit() {
            deleteQuietly(key);
          }
        });
  }

  private void deleteQuietly(UUID key) {
    try {
      storage.deleteAll(key);
    } catch (RuntimeException e) {
      // A stray file is harmless; a row pointing to a missing file is not (research R9).
      log.warn("Could not delete image files for {}", key, e);
    }
  }

  /** Where an upload ended up and its final dimensions. */
  public record StoredImage(UUID key, int width, int height) {}
}
