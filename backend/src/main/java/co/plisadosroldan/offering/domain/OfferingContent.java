package co.plisadosroldan.offering.domain;

import co.plisadosroldan.shared.domain.FieldRules;

/**
 * Owner-editable fields of an offering, validated against the data model (data-model.md).
 *
 * @throws co.plisadosroldan.shared.domain.DomainValidationException on any invalid field
 */
public record OfferingContent(
    String name, String summary, String description, Long referencePriceCop) {

  public static final int NAME_MAX = 80;
  public static final int SUMMARY_MAX = 200;
  public static final int DESCRIPTION_MAX = 5000;

  public OfferingContent {
    FieldRules rules = new FieldRules();
    name = rules.required("name", name, NAME_MAX);
    summary = rules.required("summary", summary, SUMMARY_MAX);
    description = rules.required("description", description, DESCRIPTION_MAX);
    rules.check(
        referencePriceCop == null || referencePriceCop >= 1,
        "referencePriceCop",
        "El precio debe ser mayor que cero");
    rules.validate();
  }
}
