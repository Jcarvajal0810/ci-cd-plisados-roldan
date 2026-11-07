package co.plisadosroldan.shared.domain;

import java.text.Normalizer;
import java.util.Locale;
import java.util.function.Predicate;
import java.util.regex.Pattern;

/** URL-friendly identifiers generated once from a name or title (research R11). */
public final class Slug {

  public static final int MAX_LENGTH = 100;

  private static final Pattern DIACRITICS = Pattern.compile("\\p{M}+");
  private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9]+");

  private Slug() {}

  /**
   * Builds a slug from {@code text}; appends {@code -2}, {@code -3}… while {@code isTaken} reports
   * the candidate as already used.
   *
   * @throws IllegalArgumentException when the text has no letter or digit to build a slug from
   */
  public static String generate(String text, Predicate<String> isTaken) {
    String base = normalize(text);
    if (base.isEmpty()) {
      throw new IllegalArgumentException("Cannot build a slug from: " + text);
    }
    String candidate = truncate(base, MAX_LENGTH);
    for (int suffix = 2; isTaken.test(candidate); suffix++) {
      String tail = "-" + suffix;
      candidate = truncate(base, MAX_LENGTH - tail.length()) + tail;
    }
    return candidate;
  }

  private static String normalize(String text) {
    String withoutAccents =
        DIACRITICS.matcher(Normalizer.normalize(text, Normalizer.Form.NFD)).replaceAll("");
    String dashed =
        NON_ALPHANUMERIC.matcher(withoutAccents.toLowerCase(Locale.ROOT)).replaceAll("-");
    return trimDashes(dashed);
  }

  private static String truncate(String value, int maxLength) {
    return value.length() <= maxLength ? value : trimDashes(value.substring(0, maxLength));
  }

  private static String trimDashes(String value) {
    int start = 0;
    int end = value.length();
    while (start < end && value.charAt(start) == '-') {
      start++;
    }
    while (end > start && value.charAt(end - 1) == '-') {
      end--;
    }
    return value.substring(start, end);
  }
}
