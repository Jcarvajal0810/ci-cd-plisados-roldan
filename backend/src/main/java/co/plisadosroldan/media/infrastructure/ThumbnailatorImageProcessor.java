package co.plisadosroldan.media.infrastructure;

import co.plisadosroldan.media.domain.Image;
import co.plisadosroldan.media.domain.ImageProcessor;
import co.plisadosroldan.media.domain.ProcessedImage;
import co.plisadosroldan.media.domain.UnsupportedImageException;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.imageio.ImageIO;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Component;

/**
 * Decodes by content (ImageIO + TwelveMonkeys WebP reader), flattens transparency onto white and
 * writes JPEG variants at quality 0.82 without upscaling (research R8).
 */
@Component
class ThumbnailatorImageProcessor implements ImageProcessor {

  static final double JPEG_QUALITY = 0.82;

  @Override
  public ProcessedImage process(byte[] upload) {
    BufferedImage original = decode(upload);
    BufferedImage rgb = flatten(original);
    Map<Integer, byte[]> variants = new LinkedHashMap<>();
    int largestWidth = 0;
    int largestHeight = 0;
    for (int target : Image.VARIANT_WIDTHS) {
      int width = Math.min(target, rgb.getWidth());
      int height = Math.max(1, Math.round((float) rgb.getHeight() * width / rgb.getWidth()));
      variants.put(target, encode(rgb, width, height));
      largestWidth = width;
      largestHeight = height;
    }
    return new ProcessedImage(variants, largestWidth, largestHeight);
  }

  private static BufferedImage decode(byte[] upload) {
    try {
      BufferedImage image = ImageIO.read(new ByteArrayInputStream(upload));
      if (image == null || image.getWidth() <= 0) {
        throw new UnsupportedImageException();
      }
      return image;
    } catch (IOException e) {
      throw new UnsupportedImageException();
    }
  }

  private static BufferedImage flatten(BufferedImage image) {
    BufferedImage rgb =
        new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_RGB);
    Graphics2D g = rgb.createGraphics();
    g.setColor(Color.WHITE);
    g.fillRect(0, 0, image.getWidth(), image.getHeight());
    g.drawImage(image, 0, 0, null);
    g.dispose();
    return rgb;
  }

  private static byte[] encode(BufferedImage image, int width, int height) {
    try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
      Thumbnails.of(image)
          .forceSize(width, height)
          .outputFormat("jpg")
          .outputQuality(JPEG_QUALITY)
          .toOutputStream(out);
      return out.toByteArray();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
