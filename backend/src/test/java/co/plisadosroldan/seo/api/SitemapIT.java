package co.plisadosroldan.seo.api;

import static co.plisadosroldan.support.Fixtures.insertOffering;
import static co.plisadosroldan.support.Fixtures.insertSuccessCase;
import static co.plisadosroldan.support.Fixtures.insertTestimonial;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.plisadosroldan.support.ContractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;

/** US5 / FR-011: every published public page is listed with absolute URLs. */
@TestPropertySource(properties = "app.public-base-url=https://plisados.example")
class SitemapIT extends ContractIntegrationTest {

  private static final String BASE = "https://plisados.example";

  @Test
  void listsStaticPagesAndPublishedOfferings() throws Exception {
    insertOffering(jdbc, "borrador", "Borrador", 7, false);

    String xml = sitemap();

    assertThat(xml).startsWith("<?xml").contains("<urlset");
    assertThat(xml)
        .contains("<loc>" + BASE + "/</loc>")
        .contains("<loc>" + BASE + "/nosotros</loc>")
        .contains("<loc>" + BASE + "/servicios</loc>")
        .contains("<loc>" + BASE + "/contacto</loc>")
        .contains("<loc>" + BASE + "/servicios/plisado</loc>")
        .contains("<loc>" + BASE + "/servicios/linea-plissee</loc>")
        .doesNotContain("/servicios/borrador")
        .doesNotContain("/casos-de-exito")
        .doesNotContain("/testimonios");
  }

  @Test
  void includesSuccessCasesAndTestimonialsOnlyWhenPublished() throws Exception {
    insertSuccessCase(jdbc, "pasarela-2026", "Pasarela 2026", 1, false, true);
    insertSuccessCase(jdbc, "borrador", "Borrador", 2, false, false);
    insertTestimonial(jdbc, "Laura", null, 1, false, true);

    String xml = sitemap();

    assertThat(xml)
        .contains("<loc>" + BASE + "/casos-de-exito</loc>")
        .contains("<loc>" + BASE + "/casos-de-exito/pasarela-2026</loc>")
        .doesNotContain("/casos-de-exito/borrador")
        .contains("<loc>" + BASE + "/testimonios</loc>");
  }

  private String sitemap() throws Exception {
    return api.perform(get("/sitemap.xml"))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_XML))
        .andReturn()
        .getResponse()
        .getContentAsString();
  }
}
