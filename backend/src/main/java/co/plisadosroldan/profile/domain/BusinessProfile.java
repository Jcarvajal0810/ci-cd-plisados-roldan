package co.plisadosroldan.profile.domain;

import co.plisadosroldan.shared.domain.FieldRules;
import java.util.regex.Pattern;

/**
 * The business's public information (single record), validated against data-model.md.
 *
 * @param whatsappNumber digits only, with country code (e.g. 573116254705)
 * @throws co.plisadosroldan.shared.domain.DomainValidationException on any invalid field
 */
public record BusinessProfile(
    String businessName,
    String slogan,
    String aboutText,
    String whatsappNumber,
    String locationText,
    String scheduleText) {

  private static final Pattern WHATSAPP = Pattern.compile("^[0-9]{10,15}$");

  public BusinessProfile {
    FieldRules rules = new FieldRules();
    businessName = rules.required("businessName", businessName, 80);
    slogan = rules.required("slogan", slogan, 120);
    aboutText = rules.required("aboutText", aboutText, 8000);
    whatsappNumber = whatsappNumber == null ? "" : whatsappNumber.trim();
    rules.check(
        WHATSAPP.matcher(whatsappNumber).matches(),
        "whatsappNumber",
        "Solo números, con indicativo de país (10 a 15 dígitos)");
    locationText = rules.required("locationText", locationText, 200);
    scheduleText = rules.required("scheduleText", scheduleText, 300);
    rules.validate();
  }
}
