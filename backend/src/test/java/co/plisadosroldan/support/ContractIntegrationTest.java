package co.plisadosroldan.support;

import static com.atlassian.oai.validator.mockmvc.OpenApiValidationMatchers.openApi;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import com.atlassian.oai.validator.OpenApiInteractionValidator;
import com.atlassian.oai.validator.report.LevelResolver;
import com.atlassian.oai.validator.report.ValidationReport;
import java.nio.file.Path;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/**
 * Base for endpoint integration tests. Every request and response made through {@link #api} is
 * validated against the project's single API contract in {@code ../specs} (research R18), so code
 * that drifts from {@code openapi.yaml} fails the test.
 */
public abstract class ContractIntegrationTest extends IntegrationTest {

  public static final String CONTRACT =
      Path.of("..", "specs", "001-business-info-site", "contracts", "openapi.yaml")
          .toAbsolutePath()
          .toUri()
          .toString();

  @Autowired private WebApplicationContext context;

  /** MockMvc that validates every exchange against the contract. */
  protected MockMvc api;

  /**
   * The validator reports false positives for {@code additionalProperties} on {@code allOf} schemas
   * (see its README FAQ), so only that rule is ignored; types, required fields, formats,
   * nullability and status codes are still enforced.
   */
  private static final OpenApiInteractionValidator VALIDATOR =
      OpenApiInteractionValidator.createForSpecificationUrl(CONTRACT)
          .withLevelResolver(
              LevelResolver.create()
                  .withLevel(
                      "validation.schema.additionalProperties", ValidationReport.Level.IGNORE)
                  // The validator cannot read multipart bodies built by MockMvc.
                  .withLevel("validation.request.body.missing", ValidationReport.Level.IGNORE)
                  .build())
          .build();

  /** An authenticated admin request carrying a real CSRF token. */
  protected RequestPostProcessor asAdmin() throws Exception {
    RequestPostProcessor token = xsrf();
    RequestPostProcessor admin =
        SecurityMockMvcRequestPostProcessors.user("owner@example.com").roles("ADMIN");
    return request -> token.postProcessRequest(admin.postProcessRequest(request));
  }

  @BeforeEach
  void buildContractValidatingMockMvc() {
    api =
        MockMvcBuilders.webAppContextSetup(context)
            .apply(springSecurity())
            .alwaysExpect(openApi().isValid(VALIDATOR))
            .build();
  }
}
