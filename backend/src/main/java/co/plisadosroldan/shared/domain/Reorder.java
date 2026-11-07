package co.plisadosroldan.shared.domain;

import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Rewrites display positions 1..n from a full ordered list of IDs (research R10). */
public final class Reorder {

  private Reorder() {}

  /**
   * Returns the new position of every ID, in the requested order.
   *
   * @throws ReorderMismatchException unless {@code requested} contains exactly the existing IDs,
   *     each once
   */
  public static Map<Long, Integer> positions(Collection<Long> existingIds, List<Long> requested) {
    Set<Long> requestedSet = new HashSet<>(requested);
    if (requestedSet.size() != requested.size() || !requestedSet.equals(Set.copyOf(existingIds))) {
      throw new ReorderMismatchException();
    }
    Map<Long, Integer> positions = new LinkedHashMap<>();
    for (int i = 0; i < requested.size(); i++) {
      positions.put(requested.get(i), i + 1);
    }
    return positions;
  }
}
