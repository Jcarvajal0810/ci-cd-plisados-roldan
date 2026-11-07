package co.plisadosroldan.offering.api;

import static co.plisadosroldan.support.Fixtures.insertOffering;
import static co.plisadosroldan.support.Fixtures.offeringId;
import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.plisadosroldan.support.ContractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

/** US2: the owner manages offerings (FR-015). */
class AdminOfferingApiIT extends ContractIntegrationTest {

  private static final String NEW_OFFERING =
      """
      {"name":"Plisado acordeón","summary":"Pliegues en abanico",
       "description":"Plisado tipo acordeón para faldas y vestidos.","referencePriceCop":null}
      """;

  @Test
  void listIncludesDraftsInDisplayOrder() throws Exception {
    insertOffering(jdbc, "borrador", "Borrador", 7, false);

    api.perform(get("/api/admin/offerings").with(asAdmin()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(7)))
        .andExpect(jsonPath("$[6].slug").value("borrador"))
        .andExpect(jsonPath("$[6].published").value(false))
        .andExpect(jsonPath("$[0].id").isNumber())
        .andExpect(jsonPath("$[0].updatedAt").isString());
  }

  @Test
  void createReturns201WithLocationAndADraftAtTheEnd() throws Exception {
    api.perform(
            post("/api/admin/offerings")
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content(NEW_OFFERING))
        .andExpect(status().isCreated())
        .andExpect(header().string("Location", endsWith("/api/admin/offerings/7")))
        .andExpect(jsonPath("$.slug").value("plisado-acordeon"))
        .andExpect(jsonPath("$.published").value(false))
        .andExpect(jsonPath("$.displayOrder").value(7));
  }

  @Test
  void invalidInputIs400WithFieldErrors() throws Exception {
    // Plain MockMvc: this request breaks the contract on purpose.
    mockMvc
        .perform(
            post("/api/admin/offerings")
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"name\":\"\",\"summary\":\"s\",\"description\":\"d\","
                        + "\"referencePriceCop\":0}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.name").isString())
        .andExpect(jsonPath("$.errors.referencePriceCop").isString());
  }

  @Test
  void getUpdateAndDeleteById() throws Exception {
    long plisado = offeringId(jdbc, "plisado");

    api.perform(get("/api/admin/offerings/" + plisado).with(asAdmin()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Plisado"));

    api.perform(
            put("/api/admin/offerings/" + plisado)
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"name\":\"Plisado fino\",\"summary\":\"Nuevo\",\"description\":\"Texto\","
                        + "\"referencePriceCop\":120000}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.slug").value("plisado"))
        .andExpect(jsonPath("$.name").value("Plisado fino"))
        .andExpect(jsonPath("$.referencePriceCop").value(120000));

    api.perform(delete("/api/admin/offerings/" + plisado).with(asAdmin()))
        .andExpect(status().isNoContent());
    api.perform(get("/api/admin/offerings/" + plisado).with(asAdmin()))
        .andExpect(status().isNotFound());
  }

  @Test
  void unknownIdsAreNotFound() throws Exception {
    api.perform(get("/api/admin/offerings/999").with(asAdmin())).andExpect(status().isNotFound());
    api.perform(delete("/api/admin/offerings/999").with(asAdmin()))
        .andExpect(status().isNotFound());
  }

  @Test
  void publicationControlsPublicVisibility() throws Exception {
    long plisado = offeringId(jdbc, "plisado");

    api.perform(
            put("/api/admin/offerings/" + plisado + "/publication")
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"published\":false}"))
        .andExpect(status().isNoContent());

    api.perform(get("/api/public/offerings/plisado")).andExpect(status().isNotFound());
    api.perform(get("/api/admin/offerings").with(asAdmin()))
        .andExpect(jsonPath("$[*].slug", hasItem("plisado")));
  }

  @Test
  void reorderRewritesPositionsOrRejectsMismatches() throws Exception {
    String ids =
        jdbc.sql("SELECT string_agg(id::text, ',' ORDER BY display_order DESC) FROM offering")
            .query(String.class)
            .single();

    api.perform(
            put("/api/admin/offerings/order")
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"ids\":[" + ids + "]}"))
        .andExpect(status().isNoContent());
    api.perform(get("/api/public/offerings"))
        .andExpect(jsonPath("$[0].slug").value("linea-plissee"));

    api.perform(
            put("/api/admin/offerings/order")
                .with(asAdmin())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"ids\":[1,2]}"))
        .andExpect(status().isConflict());
  }

  @Test
  void everyEndpointRequiresAuthentication() throws Exception {
    // Plain MockMvc: the contract documents 401 globally, not per operation.
    mockMvc.perform(get("/api/admin/offerings")).andExpect(status().isUnauthorized());
    mockMvc.perform(get("/api/admin/offerings/1")).andExpect(status().isUnauthorized());
  }
}
