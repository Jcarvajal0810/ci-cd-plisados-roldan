package co.plisadosroldan.successcase.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import co.plisadosroldan.shared.domain.DomainValidationException;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class SuccessCaseTest {

  private static SuccessCaseContent content(String title, String client, String description) {
    return new SuccessCaseContent(title, client, description, null, null, false, List.of());
  }

  @Test
  void titleClientAndDescriptionAreRequiredWithDataModelLimits() {
    assertInvalid("title", () -> content(" ", "c", "d"));
    assertInvalid("title", () -> content("x".repeat(121), "c", "d"));
    assertInvalid("clientName", () -> content("t", "", "d"));
    assertInvalid("clientName", () -> content("t", "x".repeat(121), "d"));
    assertInvalid("description", () -> content("t", "c", null));
    assertInvalid("description", () -> content("t", "c", "x".repeat(5001)));
  }

  @Test
  void eventLabelAndDateAreOptional() {
    SuccessCaseContent none = content("t", "c", "d");
    assertThat(none.eventLabel()).isNull();
    assertThat(none.eventDate()).isNull();

    SuccessCaseContent full =
        new SuccessCaseContent(
            "t", "c", "d", " Pasarela ", LocalDate.of(2026, 5, 1), true, List.of(1L));
    assertThat(full.eventLabel()).isEqualTo("Pasarela");
    assertThat(full.featured()).isTrue();

    assertInvalid(
        "eventLabel",
        () -> new SuccessCaseContent("t", "c", "d", "x".repeat(121), null, false, List.of()));
  }

  @Test
  void newCaseIsAnUnfeaturedDraft() {
    SuccessCase draft = SuccessCase.draft("pasarela", content("Pasarela", "Marca", "Texto"), 3);

    assertThat(draft.published()).isFalse();
    assertThat(draft.featured()).isFalse();
    assertThat(draft.displayOrder()).isEqualTo(3);
  }

  @Test
  void editingNeverChangesTheSlug() {
    SuccessCase original = SuccessCase.draft("pasarela", content("Pasarela", "Marca", "T"), 1);

    SuccessCase renamed =
        original.withContent(
            new SuccessCaseContent("Pasarela 2026", "Marca", "T", null, null, true, List.of()));

    assertThat(renamed.slug()).isEqualTo("pasarela");
    assertThat(renamed.title()).isEqualTo("Pasarela 2026");
    assertThat(renamed.featured()).isTrue();
  }

  private static void assertInvalid(String field, Runnable action) {
    assertThatThrownBy(action::run)
        .isInstanceOfSatisfying(
            DomainValidationException.class, e -> assertThat(e.errors()).containsKey(field));
  }
}
