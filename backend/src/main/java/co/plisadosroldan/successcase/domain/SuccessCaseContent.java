package co.plisadosroldan.successcase.domain;

import co.plisadosroldan.shared.domain.FieldRules;
import java.time.LocalDate;
import java.util.List;

/**
 * Owner-editable fields of a success case, validated against data-model.md.
 *
 * @param offeringIds related offerings (may be empty)
 * @throws co.plisadosroldan.shared.domain.DomainValidationException on any invalid field
 */
public record SuccessCaseContent(
    String title,
    String clientName,
    String description,
    String eventLabel,
    LocalDate eventDate,
    boolean featured,
    List<Long> offeringIds) {

  public static final int TITLE_MAX = 120;
  public static final int CLIENT_NAME_MAX = 120;
  public static final int DESCRIPTION_MAX = 5000;
  public static final int EVENT_LABEL_MAX = 120;

  public SuccessCaseContent {
    FieldRules rules = new FieldRules();
    title = rules.required("title", title, TITLE_MAX);
    clientName = rules.required("clientName", clientName, CLIENT_NAME_MAX);
    description = rules.required("description", description, DESCRIPTION_MAX);
    eventLabel = rules.optional("eventLabel", eventLabel, EVENT_LABEL_MAX);
    offeringIds = offeringIds == null ? List.of() : List.copyOf(offeringIds);
    rules.validate();
  }
}
