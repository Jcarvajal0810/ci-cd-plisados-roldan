package co.plisadosroldan.support;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Base64;
import javax.imageio.ImageIO;

/**
 * Image fixtures generated in code (instead of binary files in test resources): JPEG and PNG of any
 * size, a 1×1 lossless WebP, and a PDF disguised as an image.
 */
public final class TestImages {

  /** The classic 1×1 lossless WebP used for browser feature detection. */
  private static final String WEBP_1X1 = "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";

  private TestImages() {}

  public static byte[] jpeg(int width, int height) {
    return encode(paint(width, height, BufferedImage.TYPE_INT_RGB), "jpg");
  }

  /** PNG with transparency, to prove the alpha channel is flattened safely. */
  public static byte[] pngWithAlpha(int width, int height) {
    return encode(paint(width, height, BufferedImage.TYPE_INT_ARGB), "png");
  }

  public static byte[] webp() {
    return Base64.getDecoder().decode(WEBP_1X1);
  }

  public static byte[] pdfNamedAsJpeg() {
    return "%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\ntrailer << >>\n%%EOF".getBytes();
  }

  private static BufferedImage paint(int width, int height, int type) {
    BufferedImage image = new BufferedImage(width, height, type);
    Graphics2D g = image.createGraphics();
    g.setColor(new Color(122, 46, 58, 200));
    g.fillRect(0, 0, width / 2, height);
    g.dispose();
    return image;
  }

  private static byte[] encode(BufferedImage image, String format) {
    try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
      ImageIO.write(image, format, out);
      return out.toByteArray();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
