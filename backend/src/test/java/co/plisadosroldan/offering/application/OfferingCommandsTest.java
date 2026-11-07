package co.plisadosroldan.offering.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import co.plisadosroldan.media.application.GalleryService;
import co.plisadosroldan.media.domain.GalleryOwner;
import co.plisadosroldan.offering.domain.Offering;
import co.plisadosroldan.offering.domain.OfferingContent;
import co.plisadosroldan.offering.domain.OfferingRepository;
import co.plisadosroldan.shared.domain.NotFoundException;
import co.plisadosroldan.shared.domain.ReorderMismatchException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class OfferingCommandsTest {

  private final OfferingRepository offerings = mock(OfferingRepository.class);
  private final GalleryService galleries = mock(GalleryService.class);
  private final OfferingCommands commands = new OfferingCommands(offerings, galleries);

  private static final OfferingContent CONTENT =
      new OfferingContent("Plisado", "Resumen", "Descripción", null);

  @Test
  void createGeneratesAUniqueSlugAndPutsTheDraftLast() {
    when(offerings.slugExists("plisado")).thenReturn(true);
    when(offerings.slugExists("plisado-2")).thenReturn(false);
    when(offerings.maxDisplayOrder()).thenReturn(6);
    when(offerings.insert(any())).thenReturn(42L);
    Offering stored = Offering.draft("plisado-2", CONTENT, 7);
    when(offerings.findById(42L)).thenReturn(Optional.of(stored));

    Offering created = commands.create(CONTENT);

    ArgumentCaptor<Offering> inserted = ArgumentCaptor.forClass(Offering.class);
    verify(offerings).insert(inserted.capture());
    assertThat(inserted.getValue().slug()).isEqualTo("plisado-2");
    assertThat(inserted.getValue().displayOrder()).isEqualTo(7);
    assertThat(inserted.getValue().published()).isFalse();
    assertThat(created).isEqualTo(stored);
  }

  @Test
  void updateKeepsTheSlug() {
    Offering existing = Offering.draft("plisado", CONTENT, 1);
    when(offerings.findById(5L)).thenReturn(Optional.of(existing));

    commands.update(5L, new OfferingContent("Plisado fino", "Otro", "Texto", 90000L));

    ArgumentCaptor<Offering> updated = ArgumentCaptor.forClass(Offering.class);
    verify(offerings).update(org.mockito.ArgumentMatchers.eq(5L), updated.capture());
    assertThat(updated.getValue().slug()).isEqualTo("plisado");
    assertThat(updated.getValue().name()).isEqualTo("Plisado fino");
  }

  @Test
  void updatingAnUnknownOfferingIsNotFound() {
    when(offerings.findById(9L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> commands.update(9L, CONTENT)).isInstanceOf(NotFoundException.class);
  }

  @Test
  void deleteRemovesTheGalleryBeforeTheOffering() {
    when(offerings.findById(5L)).thenReturn(Optional.of(Offering.draft("plisado", CONTENT, 1)));

    commands.delete(5L);

    var order = inOrder(galleries, offerings);
    order.verify(galleries).removeAll(GalleryOwner.OFFERING, 5L);
    order.verify(offerings).delete(5L);
  }

  @Test
  void setPublishedPersistsTheNewState() {
    when(offerings.findById(5L)).thenReturn(Optional.of(Offering.draft("plisado", CONTENT, 1)));

    commands.setPublished(5L, true);

    ArgumentCaptor<Offering> updated = ArgumentCaptor.forClass(Offering.class);
    verify(offerings).update(org.mockito.ArgumentMatchers.eq(5L), updated.capture());
    assertThat(updated.getValue().published()).isTrue();
  }

  @Test
  void reorderWritesPositionsOneToN() {
    when(offerings.allIds()).thenReturn(Set.of(1L, 2L, 3L));

    commands.reorder(List.of(3L, 1L, 2L));

    verify(offerings).updatePositions(Map.of(3L, 1, 1L, 2, 2L, 3));
  }

  @Test
  void reorderRejectsMismatchedIds() {
    when(offerings.allIds()).thenReturn(Set.of(1L, 2L, 3L));

    assertThatThrownBy(() -> commands.reorder(List.of(1L, 2L)))
        .isInstanceOf(ReorderMismatchException.class);
    verify(offerings, never()).updatePositions(any());
  }
}
