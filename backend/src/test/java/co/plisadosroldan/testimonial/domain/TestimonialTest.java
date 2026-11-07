package co.plisadosroldan.testimonial.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import co.plisadosroldan.shared.domain.DomainValidationException;
import org.junit.jupiter.api.Test;

class TestimonialTest {

  @Test
  void clientNameAndQuoteAreRequiredWithDataModelLimits() {
    assertInvalid("clientName", () -> new TestimonialContent(" ", null, "q", false));
    assertInvalid("clientName", () -> new TestimonialContent("x".repeat(121), null, "q", false));
    assertInvalid("quote", () -> new TestimonialContent("n", null, "  ", false));
    assertInvalid("quote", () -> new TestimonialContent("n", null, "x".repeat(601), false));
  }

  @Test
  void companyIsOptional() {
    assertThat(new TestimonialContent("n", "  ", "q", false).company()).isNull();
    assertThat(new TestimonialContent("n", " Marca ", "q", false).company()).isEqualTo("Marca");
    assertInvalid("company", () -> new TestimonialContent("n", "x".repeat(121), "q", false));
  }

  @Test
  void newTestimonialIsAnUnfeaturedDraftWithoutPhoto() {
    Testimonial draft =
        Testimonial.draft(new TestimonialContent("Laura", null, "Gracias", false), 4);

    assertThat(draft.published()).isFalse();
    assertThat(draft.featured()).isFalse();
    assertThat(draft.photo()).isNull();
    assertThat(draft.displayOrder()).isEqualTo(4);
  }

  private static void assertInvalid(String field, Runnable action) {
    assertThatThrownBy(action::run)
        .isInstanceOfSatisfying(
            DomainValidationException.class, e -> assertThat(e.errors()).containsKey(field));
  }
}
