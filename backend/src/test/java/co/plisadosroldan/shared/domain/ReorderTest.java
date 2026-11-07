package co.plisadosroldan.shared.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class ReorderTest {

  private static final Set<Long> EXISTING = Set.of(10L, 20L, 30L);

  @Test
  void assignsPositionsOneToNInRequestedOrder() {
    Map<Long, Integer> positions = Reorder.positions(EXISTING, List.of(30L, 10L, 20L));

    assertThat(positions).containsExactly(Map.entry(30L, 1), Map.entry(10L, 2), Map.entry(20L, 3));
  }

  @Test
  void rejectsMissingIds() {
    assertThatThrownBy(() -> Reorder.positions(EXISTING, List.of(10L, 20L)))
        .isInstanceOf(ReorderMismatchException.class);
  }

  @Test
  void rejectsUnknownIds() {
    assertThatThrownBy(() -> Reorder.positions(EXISTING, List.of(10L, 20L, 30L, 40L)))
        .isInstanceOf(ReorderMismatchException.class);
  }

  @Test
  void rejectsDuplicateIds() {
    assertThatThrownBy(() -> Reorder.positions(EXISTING, List.of(10L, 10L, 20L)))
        .isInstanceOf(ReorderMismatchException.class);
  }

  @Test
  void acceptsEmptyCollection() {
    assertThat(Reorder.positions(Set.of(), List.of())).isEmpty();
  }
}
