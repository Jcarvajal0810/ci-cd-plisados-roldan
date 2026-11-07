package co.plisadosroldan.shared.api;

import jakarta.validation.constraints.NotNull;

/** Contract request body {@code Publication}. */
public record PublicationRequest(@NotNull Boolean published) {}
