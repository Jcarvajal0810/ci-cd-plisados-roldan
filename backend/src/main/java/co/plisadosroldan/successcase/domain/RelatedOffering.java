package co.plisadosroldan.successcase.domain;

/** An offering linked to a success case; only published ones are shown publicly. */
public record RelatedOffering(long id, String slug, String name, boolean published) {}
