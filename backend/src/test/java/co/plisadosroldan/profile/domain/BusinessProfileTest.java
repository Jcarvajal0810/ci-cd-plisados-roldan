package co.plisadosroldan.profile.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import co.plisadosroldan.shared.domain.DomainValidationException;
import org.junit.jupiter.api.Test;

class BusinessProfileTest {

  @Test
  void acceptsAValidProfile() {
    BusinessProfile profile = valid("573116254705");
    assertThat(profile.whatsappNumber()).isEqualTo("573116254705");
  }

  @Test
  void businessNameIsRequiredAndAtMost80() {
    assertInvalid(
        "businessName", () -> new BusinessProfile(" ", "s", "a", "573116254705", "l", "h"));
    assertInvalid(
        "businessName",
        () -> new BusinessProfile("x".repeat(81), "s", "a", "573116254705", "l", "h"));
  }

  @Test
  void textLimitsFollowTheDataModel() {
    assertInvalid(
        "slogan", () -> new BusinessProfile("n", "x".repeat(121), "a", "573116254705", "l", "h"));
    assertInvalid(
        "aboutText",
        () -> new BusinessProfile("n", "s", "x".repeat(8001), "573116254705", "l", "h"));
    assertInvalid(
        "locationText",
        () -> new BusinessProfile("n", "s", "a", "573116254705", "x".repeat(201), "h"));
    assertInvalid(
        "scheduleText",
        () -> new BusinessProfile("n", "s", "a", "573116254705", "l", "x".repeat(301)));
  }

  @Test
  void whatsappNumberIsTenToFifteenDigits() {
    assertInvalid("whatsappNumber", () -> valid("+57 311 625 4705"));
    assertInvalid("whatsappNumber", () -> valid("311625"));
    assertInvalid("whatsappNumber", () -> valid("1".repeat(16)));
    assertThat(valid("3116254705").whatsappNumber()).isEqualTo("3116254705");
  }

  private static BusinessProfile valid(String whatsapp) {
    return new BusinessProfile("Plisados Roldán", "Creando", "Historia", whatsapp, "Itagüí", "L-V");
  }

  private static void assertInvalid(String field, Runnable action) {
    assertThatThrownBy(action::run)
        .isInstanceOfSatisfying(
            DomainValidationException.class, e -> assertThat(e.errors()).containsKey(field));
  }
}
