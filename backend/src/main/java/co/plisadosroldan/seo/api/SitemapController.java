package co.plisadosroldan.seo.api;

import co.plisadosroldan.seo.application.SitemapQuery;
import co.plisadosroldan.shared.infrastructure.AppProperties;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;

/** {@code /sitemap.xml} with absolute URLs from {@code app.public-base-url} (research R13). */
@RestController
class SitemapController {

  private final SitemapQuery sitemap;
  private final String baseUrl;

  SitemapController(SitemapQuery sitemap, AppProperties properties) {
    this.sitemap = sitemap;
    this.baseUrl = properties.publicBaseUrl().replaceAll("/+$", "");
  }

  @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
  String sitemap() {
    StringBuilder xml =
        new StringBuilder(
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                + "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
    for (String path : sitemap.publicPaths()) {
      xml.append("  <url><loc>")
          .append(HtmlUtils.htmlEscape(baseUrl + path))
          .append("</loc></url>\n");
    }
    return xml.append("</urlset>\n").toString();
  }
}
