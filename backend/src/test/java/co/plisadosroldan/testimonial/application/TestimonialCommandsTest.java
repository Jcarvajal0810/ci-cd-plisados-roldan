package co.plisadosroldan.testimonial.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import co.plisadosroldan.media.application.ImageFiles;
import co.plisadosroldan.media.application.ImageUpload;
import co.plisadosroldan.media.domain.GalleryRepository;
import co.plisadosroldan.media.domain.Image;
import co.plisadosroldan.testimonial.domain.Testimonial;
import co.plisadosroldan.testimonial.domain.TestimonialContent;
import co.plisadosroldan.testimonial.domain.TestimonialRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class TestimonialCommandsTest {

  private final TestimonialRepository testimonials = mock(TestimonialRepository.class);
  private final GalleryRepository images = mock(GalleryRepository.class);
  private final ImageFiles files = mock(ImageFiles.class);
  private final TestimonialCommands commands = new TestimonialCommands(testimonials, images, files);

  private static final UUID OLD_KEY = UUID.fromString("00000000-0000-4000-8000-0000000000aa");
  private static final UUID NEW_KEY = UUID.fromString("00000000-0000-4000-8000-0000000000bb");

  private static Testimonial withPhoto(Image photo) {
    return new Testimonial(7, "Laura", null, "Gracias", photo, 1, false, true, null);
  }

  @Test
  void settingAPhotoReplacesTheOldOneAndDeletesItsFilesAfterCommit() {
    when(testimonials.findById(7L))
        .thenReturn(Optional.of(withPhoto(new Image(3, OLD_KEY, 400, 400, null))));
    ImageUpload upload = new ImageUpload(new byte[] {1}, "foto.jpg", 1, null);
    when(files.store(upload)).thenReturn(new ImageFiles.StoredImage(NEW_KEY, 400, 400));
    when(images.insertImage(eq(NEW_KEY), anyString(), eq(400), eq(400), any())).thenReturn(4L);
    when(images.deleteImages(List.of(3L))).thenReturn(List.of(OLD_KEY));

    Image photo = commands.setPhoto(7L, upload);

    assertThat(photo.id()).isEqualTo(4L);
    verify(testimonials).setPhoto(7L, 4L);
    verify(images).deleteImages(List.of(3L));
    verify(files).deleteAfterCommit(OLD_KEY);
  }

  @Test
  void settingTheFirstPhotoDeletesNothing() {
    when(testimonials.findById(7L)).thenReturn(Optional.of(withPhoto(null)));
    ImageUpload upload = new ImageUpload(new byte[] {1}, "foto.jpg", 1, null);
    when(files.store(upload)).thenReturn(new ImageFiles.StoredImage(NEW_KEY, 400, 400));

    commands.setPhoto(7L, upload);

    verify(images, never()).deleteImages(any());
    verify(files, never()).deleteAfterCommit(any());
  }

  @Test
  void deletingATestimonialDeletesItsPhoto() {
    when(testimonials.findById(7L))
        .thenReturn(Optional.of(withPhoto(new Image(3, OLD_KEY, 400, 400, null))));
    when(images.deleteImages(List.of(3L))).thenReturn(List.of(OLD_KEY));

    commands.delete(7L);

    verify(testimonials).delete(7L);
    verify(files).deleteAfterCommit(OLD_KEY);
  }

  @Test
  void createPutsTheDraftLast() {
    when(testimonials.maxDisplayOrder()).thenReturn(3);
    when(testimonials.insert(any())).thenReturn(8L);
    when(testimonials.findById(8L)).thenReturn(Optional.of(withPhoto(null)));

    commands.create(new TestimonialContent("Laura", null, "Gracias", true));

    verify(testimonials)
        .insert(
            org.mockito.ArgumentMatchers.argThat(
                t -> t.displayOrder() == 4 && !t.published() && t.featured()));
  }
}
