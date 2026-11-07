package co.plisadosroldan.auth.infrastructure;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.function.Supplier;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.util.StringUtils;

/**
 * CSRF handling for a single-page app (Spring Security reference, "Single-Page Applications"): the
 * token is loaded on every request so the {@code XSRF-TOKEN} cookie is always issued, the raw
 * cookie value is accepted from the {@code X-XSRF-TOKEN} header, and BREACH protection still
 * applies to tokens rendered in responses.
 */
final class SpaCsrfTokenRequestHandler implements CsrfTokenRequestHandler {

  private final CsrfTokenRequestHandler plain = new CsrfTokenRequestAttributeHandler();
  private final CsrfTokenRequestHandler xor = new XorCsrfTokenRequestAttributeHandler();

  @Override
  public void handle(
      HttpServletRequest request, HttpServletResponse response, Supplier<CsrfToken> csrfToken) {
    xor.handle(request, response, csrfToken);
    csrfToken.get();
  }

  @Override
  public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
    String candidate = plain.resolveCsrfTokenValue(request, csrfToken); // header, else parameter
    if (StringUtils.hasText(candidate) && candidate.equals(csrfToken.getToken())) {
      // Raw cookie value echoed by the SPA (Angular HttpClient XSRF support).
      return candidate;
    }
    // Masked token (e.g. rendered into a response) is decoded by the XOR handler.
    return xor.resolveCsrfTokenValue(request, csrfToken);
  }
}
