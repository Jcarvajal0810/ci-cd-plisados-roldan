package co.plisadosroldan.shared.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Set;
import org.junit.jupiter.api.Test;

class SlugTest {

  private static final java.util.function.Predicate<String> NONE_TAKEN = slug -> false;

  @Test
  void lowerCasesAndStripsAccents() {
    assertThat(Slug.generate("Grabado láser", NONE_TAKEN)).isEqualTo("grabado-laser");
    assertThat(Slug.generate("Línea Plissee", NONE_TAKEN)).isEqualTo("linea-plissee");
    assertThat(Slug.generate("Ñandú Pañuelo", NONE_TAKEN)).isEqualTo("nandu-panuelo");
  }

  @Test
  void collapsesRunsOfNonAlphanumericsIntoOneDash() {
    assertThat(Slug.generate("Plisado  &  trillado!!", NONE_TAKEN)).isEqualTo("plisado-trillado");
  }

  @Test
  void trimsLeadingAndTrailingDashes() {
    assertThat(Slug.generate("  ¡Pasarela 2026! ", NONE_TAKEN)).isEqualTo("pasarela-2026");
  }

  @Test
  void truncatesToOneHundredCharacters() {
    String slug = Slug.generate("a".repeat(150), NONE_TAKEN);
    assertThat(slug).hasSize(100);
  }

  @Test
  void appendsNumericSuffixWhileTaken() {
    Set<String> taken = Set.of("plisado", "plisado-2");
    assertThat(Slug.generate("Plisado", taken::contains)).isEqualTo("plisado-3");
  }

  @Test
  void suffixedSlugStillFitsOneHundredCharacters() {
    String base = "a".repeat(100);
    String slug = Slug.generate(base, base::equals);
    assertThat(slug).hasSize(100).endsWith("-2");
  }

  @Test
  void rejectsTextWithoutAnyAlphanumericCharacter() {
    assertThatThrownBy(() -> Slug.generate(" ¡¿!? ", NONE_TAKEN))
        .isInstanceOf(IllegalArgumentException.class);
  }
}
