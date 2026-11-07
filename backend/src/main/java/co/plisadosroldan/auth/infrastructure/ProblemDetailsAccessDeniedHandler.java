package co.plisadosroldan.auth.infrastructure;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

/** 403 as Problem Details (e.g. missing or invalid CSRF token). */
class ProblemDetailsAccessDeniedHandler implements AccessDeniedHandler {

  private static final String BODY =
      "{\"type\":\"about:blank\",\"title\":\"Acceso denegado\",\"status\":403,"
          + "\"detail\":\"Recarga la página e inténtalo de nuevo\"}";

  @Override
  public void handle(
      HttpServletRequest request,
      HttpServletResponse response,
      AccessDeniedException accessDeniedException)
      throws IOException {
    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
    response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
    response.getWriter().write(BODY);
  }
}
