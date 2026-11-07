package co.plisadosroldan.testimonial.domain;

import co.plisadosroldan.shared.domain.FieldRules;

/**
 * Owner-editable fields of a testimonial, validated against data-model.md.
 *
 * @throws co.plisadosroldan.shared.domain.DomainValidationException on any invalid field
 */
public record TestimonialContent(
    String clientName, String company, String quote, boolean featured) {

  public static final int CLIENT_NAME_MAX = 120;
  public static final int COMPANY_MAX = 120;
  public static final int QUOTE_MAX = 600;

  public TestimonialContent {
    FieldRules rules = new FieldRules();
    clientName = rules.required("clientName", clientName, CLIENT_NAME_MAX);
    company = rules.optional("company", company, COMPANY_MAX);
    quote = rules.required("quote", quote, QUOTE_MAX);
    rules.validate();
  }
}
