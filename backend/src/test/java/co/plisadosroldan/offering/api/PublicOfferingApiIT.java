package co.plisadosroldan.offering.api;

import static co.plisadosroldan.support.Fixtures.addToOfferingGallery;
import static co.plisadosroldan.support.Fixtures.insertImage;
import static co.plisadosroldan.support.Fixtures.insertOffering;
import static co.plisadosroldan.support.Fixtures.offeringId;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.plisadosroldan.support.ContractIntegrationTest;
import java.util.UUID;
import org.junit.jupiter.api.Test;

/** US1: public catalog of offerings (FR-004, FR-009). */
class PublicOfferingApiIT extends ContractIntegrationTest {

  private static final UUID COVER = UUID.fromString("00000000-0000-4000-8000-0000000000c1");
  private static final UUID SECOND = UUID.fromString("00000000-0000-4000-8000-0000000000c2");

  @Test
  void listsPublishedOfferingsInDisplayOrder() throws Exception {
    insertOffering(jdbc, "borrador", "Borrador", 7, false);

    api.perform(get("/api/public/offerings"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(6)))
        .andExpect(
            jsonPath("$[*].slug")
                .value(
                    contains(
                        "plisado",
                        "trillado",
                        "craquelado",
                        "corte-laser",
                        "grabado-laser",
                        "linea-plissee")))
        .andExpect(jsonPath("$[*].slug", not(hasItem("borrador"))))
        .andExpect(jsonPath("$[0].name").value("Plisado"))
        .andExpect(jsonPath("$[0].summary").isString())
        .andExpect(jsonPath("$[0].referencePriceCop").isEmpty())
        .andExpect(jsonPath("$[0].coverImage").doesNotExist());
  }

  @Test
  void coverImageIsTheFirstGalleryImageByPosition() throws Exception {
    long plisado = offeringId(jdbc, "plisado");
    addToOfferingGallery(jdbc, plisado, insertImage(jdbc, SECOND, 1600, 1200, null), 2);
    addToOfferingGallery(jdbc, plisado, insertImage(jdbc, COVER, 1600, 1200, "Portada"), 1);

    api.perform(get("/api/public/offerings"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].coverImage.url").value("/media/" + COVER + "-960.jpg"))
        .andExpect(jsonPath("$[0].coverImage.alt").value("Portada"));
  }

  @Test
  void showsReferencePriceWhenSet() throws Exception {
    jdbc.sql("UPDATE offering SET reference_price_cop = 120000 WHERE slug = 'plisado'").update();

    api.perform(get("/api/public/offerings/plisado"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.referencePriceCop").value(120000));
  }

  @Test
  void detailReturnsDescriptionAndOrderedImagesWithAltFallback() throws Exception {
    long plisado = offeringId(jdbc, "plisado");
    addToOfferingGallery(jdbc, plisado, insertImage(jdbc, SECOND, 1600, 1200, null), 2);
    addToOfferingGallery(jdbc, plisado, insertImage(jdbc, COVER, 1600, 1200, "Portada"), 1);

    api.perform(get("/api/public/offerings/plisado"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.slug").value("plisado"))
        .andExpect(jsonPath("$.description").isString())
        .andExpect(jsonPath("$.images", hasSize(2)))
        .andExpect(jsonPath("$.images[0].alt").value("Portada"))
        .andExpect(jsonPath("$.images[1].alt").value("Plisado"))
        .andExpect(jsonPath("$.coverImage.alt").value("Portada"));
  }

  @Test
  void draftAndUnknownSlugsAreNotFound() throws Exception {
    insertOffering(jdbc, "borrador", "Borrador", 7, false);

    api.perform(get("/api/public/offerings/borrador")).andExpect(status().isNotFound());
    api.perform(get("/api/public/offerings/no-existe")).andExpect(status().isNotFound());
  }
}
