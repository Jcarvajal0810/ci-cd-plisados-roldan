package co.plisadosroldan.successcase.api;

import static co.plisadosroldan.support.Fixtures.addToSuccessCaseGallery;
import static co.plisadosroldan.support.Fixtures.insertImage;
import static co.plisadosroldan.support.Fixtures.insertSuccessCase;
import static co.plisadosroldan.support.Fixtures.offeringId;
import static co.plisadosroldan.support.Fixtures.relateOffering;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.plisadosroldan.support.ContractIntegrationTest;
import java.util.UUID;
import org.junit.jupiter.api.Test;

/** US3: success cases build trust (spec US3 acceptance scenarios 1–2). */
class PublicSuccessCaseApiIT extends ContractIntegrationTest {

  @Test
  void listsOnlyPublishedCasesInOrderWithCover() throws Exception {
    long second = insertSuccessCase(jdbc, "coleccion-otono", "Colección otoño", 2, false, true);
    insertSuccessCase(jdbc, "pasarela-2026", "Pasarela 2026", 1, true, true);
    insertSuccessCase(jdbc, "borrador", "Borrador", 3, false, false);
    UUID cover = UUID.randomUUID();
    addToSuccessCaseGallery(jdbc, second, insertImage(jdbc, cover, 1600, 1200, null), 1);

    api.perform(get("/api/public/success-cases"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].slug").value(contains("pasarela-2026", "coleccion-otono")))
        .andExpect(jsonPath("$[0].clientName").value("Marca Aliada"))
        .andExpect(jsonPath("$[0].eventLabel").value("Pasarela"))
        .andExpect(jsonPath("$[0].coverImage").doesNotExist())
        .andExpect(jsonPath("$[1].coverImage.url").value("/media/" + cover + "-960.jpg"))
        .andExpect(jsonPath("$[1].coverImage.alt").value("Colección otoño"));
  }

  @Test
  void detailHasImagesAndOnlyPublishedRelatedOfferings() throws Exception {
    long id = insertSuccessCase(jdbc, "pasarela-2026", "Pasarela 2026", 1, true, true);
    addToSuccessCaseGallery(jdbc, id, insertImage(jdbc, UUID.randomUUID(), 800, 600, "B"), 2);
    addToSuccessCaseGallery(jdbc, id, insertImage(jdbc, UUID.randomUUID(), 800, 600, "A"), 1);
    relateOffering(jdbc, id, offeringId(jdbc, "plisado"));
    long trillado = offeringId(jdbc, "trillado");
    relateOffering(jdbc, id, trillado);
    jdbc.sql("UPDATE offering SET published = false WHERE id = ?").param(trillado).update();

    api.perform(get("/api/public/success-cases/pasarela-2026"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.description").isString())
        .andExpect(jsonPath("$.images[*].alt").value(contains("A", "B")))
        .andExpect(jsonPath("$.relatedOfferings", hasSize(1)))
        .andExpect(jsonPath("$.relatedOfferings[0].slug").value("plisado"))
        .andExpect(jsonPath("$.relatedOfferings[0].name").value("Plisado"));
  }

  @Test
  void draftAndUnknownSlugsAreNotFound() throws Exception {
    insertSuccessCase(jdbc, "borrador", "Borrador", 1, false, false);

    api.perform(get("/api/public/success-cases/borrador")).andExpect(status().isNotFound());
    api.perform(get("/api/public/success-cases/no-existe")).andExpect(status().isNotFound());
  }
}
