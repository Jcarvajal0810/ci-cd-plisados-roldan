package co.plisadosroldan.successcase.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import co.plisadosroldan.media.application.GalleryService;
import co.plisadosroldan.media.domain.GalleryOwner;
import co.plisadosroldan.shared.domain.DomainValidationException;
import co.plisadosroldan.successcase.domain.SuccessCase;
import co.plisadosroldan.successcase.domain.SuccessCaseContent;
import co.plisadosroldan.successcase.domain.SuccessCaseRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class SuccessCaseCommandsTest {

  private final SuccessCaseRepository cases = mock(SuccessCaseRepository.class);
  private final GalleryService galleries = mock(GalleryService.class);
  private final SuccessCaseCommands commands = new SuccessCaseCommands(cases, galleries);

  private static SuccessCaseContent content(List<Long> offeringIds) {
    return new SuccessCaseContent(
        "Pasarela 2026", "Marca", "Texto", null, null, false, offeringIds);
  }

  @Test
  void createGeneratesSlugOrderAndRelatedOfferings() {
    when(cases.slugExists("pasarela-2026")).thenReturn(false);
    when(cases.maxDisplayOrder()).thenReturn(2);
    when(cases.existingOfferingIds(List.of(4L))).thenReturn(Set.of(4L));
    when(cases.insert(any())).thenReturn(9L);
    when(cases.findById(9L))
        .thenReturn(Optional.of(SuccessCase.draft("pasarela-2026", content(List.of()), 3)));

    commands.create(content(List.of(4L)));

    ArgumentCaptor<SuccessCase> inserted = ArgumentCaptor.forClass(SuccessCase.class);
    verify(cases).insert(inserted.capture());
    assertThat(inserted.getValue().slug()).isEqualTo("pasarela-2026");
    assertThat(inserted.getValue().displayOrder()).isEqualTo(3);
    verify(cases).replaceRelatedOfferings(9L, List.of(4L));
  }

  @Test
  void unknownOfferingIdsAreAValidationError() {
    when(cases.existingOfferingIds(List.of(4L, 99L))).thenReturn(Set.of(4L));

    assertThatThrownBy(() -> commands.create(content(List.of(4L, 99L))))
        .isInstanceOfSatisfying(
            DomainValidationException.class,
            e -> assertThat(e.errors()).containsKey("offeringIds"));
    verify(cases, never()).insert(any());
  }

  @Test
  void updateReplacesRelatedOfferingsAndKeepsTheSlug() {
    when(cases.findById(9L))
        .thenReturn(Optional.of(SuccessCase.draft("pasarela", content(List.of()), 1)));
    when(cases.existingOfferingIds(List.of(5L))).thenReturn(Set.of(5L));

    commands.update(9L, content(List.of(5L)));

    ArgumentCaptor<SuccessCase> updated = ArgumentCaptor.forClass(SuccessCase.class);
    verify(cases).update(org.mockito.ArgumentMatchers.eq(9L), updated.capture());
    assertThat(updated.getValue().slug()).isEqualTo("pasarela");
    verify(cases).replaceRelatedOfferings(9L, List.of(5L));
  }

  @Test
  void deleteRemovesTheGalleryFirst() {
    when(cases.findById(9L))
        .thenReturn(Optional.of(SuccessCase.draft("pasarela", content(List.of()), 1)));

    commands.delete(9L);

    var order = inOrder(galleries, cases);
    order.verify(galleries).removeAll(GalleryOwner.SUCCESS_CASE, 9L);
    order.verify(cases).delete(9L);
  }

  @Test
  void reorderWritesPositionsOneToN() {
    when(cases.allIds()).thenReturn(Set.of(1L, 2L));

    commands.reorder(List.of(2L, 1L));

    verify(cases).updatePositions(Map.of(2L, 1, 1L, 2));
    verify(cases, never()).delete(anyLong());
  }
}
