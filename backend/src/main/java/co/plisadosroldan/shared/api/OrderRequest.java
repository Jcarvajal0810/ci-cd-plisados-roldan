package co.plisadosroldan.shared.api;

import jakarta.validation.constraints.NotNull;
import java.util.List;

/** Contract request body {@code Order}: the full ordered list of existing IDs. */
public record OrderRequest(@NotNull List<Long> ids) {}
