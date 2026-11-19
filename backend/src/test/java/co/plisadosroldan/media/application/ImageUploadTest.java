package co.plisadosroldan.media.application;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ImageUploadTest {

  private static ImageUpload upload(byte[] bytes, String altText) {
    return new ImageUpload(bytes, "foto.jpg", bytes.length, altText);
  }

  @Test
  void equalUploadsHaveTheSameContentNotTheSameArray() {
    ImageUpload a = upload(new byte[] {1, 2, 3}, "Plisado");
    ImageUpload b = upload(new byte[] {1, 2, 3}, "Plisado");

    assertThat(a).isEqualTo(b).hasSameHashCodeAs(b);
  }

  @Test
  void differentContentOrTextMakesUploadsDifferent() {
    ImageUpload a = upload(new byte[] {1, 2, 3}, "Plisado");

    assertThat(a)
        .isNotEqualTo(upload(new byte[] {1, 2, 4}, "Plisado"))
        .isNotEqualTo(upload(new byte[] {1, 2, 3}, "Trillado"))
        .isNotEqualTo(new ImageUpload(new byte[] {1, 2, 3}, "otra.jpg", 3, "Plisado"))
        .isNotEqualTo(new ImageUpload(new byte[] {1, 2, 3}, "foto.jpg", 99, "Plisado"))
        .isNotEqualTo(null)
        .isNotEqualTo("foto.jpg");
  }

  @Test
  void toStringShowsTheLengthInsteadOfTheBytes() {
    assertThat(upload(new byte[] {7, 7}, null))
        .hasToString("ImageUpload[bytes=2 bytes, originalFilename=foto.jpg, size=2, altText=null]");
    assertThat(new ImageUpload(null, "foto.jpg", 0, null).toString()).contains("bytes=0 bytes");
  }
}
