package co.plisadosroldan.offering.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import co.plisadosroldan.shared.domain.DomainValidationException;
import org.junit.jupiter.api.Test;

class OfferingTest {

  private static final OfferingContent VALID =
      new OfferingContent("Plisado", "Pliegues precisos", "Descripción", null);

  @Test
  void nameIsRequiredNonBlankAndAtMost80Characters() {
    assertInvalid("name", () -> new OfferingContent(null, "s", "d", null));
    assertInvalid("name", () -> new OfferingContent("   ", "s", "d", null));
    assertInvalid("name", () -> new OfferingContent("a".repeat(81), "s", "d", null));
    assertThat(new OfferingContent("a".repeat(80), "s", "d", null).name()).hasSize(80);
  }

  @Test
  void summaryIsRequiredAndAtMost200Characters() {
    assertInvalid("summary", () -> new OfferingContent("n", " ", "d", null));
    assertInvalid("summary", () -> new OfferingContent("n", "a".repeat(201), "d", null));
  }

  @Test
  void descriptionIsRequiredAndAtMost5000Characters() {
    assertInvalid("description", () -> new OfferingContent("n", "s", "", null));
    assertInvalid("description", () -> new OfferingContent("n", "s", "a".repeat(5001), null));
  }

  @Test
  void referencePriceIsOptionalButAtLeastOne() {
    assertThat(new OfferingContent("n", "s", "d", null).referencePriceCop()).isNull();
    assertThat(new OfferingContent("n", "s", "d", 1L).referencePriceCop()).isEqualTo(1L);
    assertInvalid("referencePriceCop", () -> new OfferingContent("n", "s", "d", 0L));
  }

  @Test
  void textIsTrimmed() {
    OfferingContent content = new OfferingContent("  Plisado ", " Resumen ", " Texto ", null);
    assertThat(content.name()).isEqualTo("Plisado");
    assertThat(content.summary()).isEqualTo("Resumen");
    assertThat(content.description()).isEqualTo("Texto");
  }

  @Test
  void newOfferingIsADraft() {
    Offering draft = Offering.draft("plisado", VALID, 7);

    assertThat(draft.published()).isFalse();
    assertThat(draft.displayOrder()).isEqualTo(7);
    assertThat(draft.images()).isEmpty();
  }

  @Test
  void publishAndUnpublishToggleState() {
    Offering draft = Offering.draft("plisado", VALID, 1);

    assertThat(draft.publish().published()).isTrue();
    assertThat(draft.publish().unpublish().published()).isFalse();
  }

  @Test
  void editingContentNeverChangesTheSlug() {
    Offering original = Offering.draft("plisado", VALID, 1);

    Offering renamed =
        original.withContent(new OfferingContent("Plisado acordeón", "Nuevo", "Texto", 50000L));

    assertThat(renamed.slug()).isEqualTo("plisado");
    assertThat(renamed.name()).isEqualTo("Plisado acordeón");
    assertThat(renamed.referencePriceCop()).isEqualTo(50000L);
  }

  private static void assertInvalid(String field, Runnable action) {
    assertThatThrownBy(action::run)
        .isInstanceOfSatisfying(
            DomainValidationException.class, e -> assertThat(e.errors()).containsKey(field));
  }
}
