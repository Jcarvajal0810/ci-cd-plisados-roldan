package co.plisadosroldan.auth.infrastructure;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

/** Answers unauthenticated requests with a 401 Problem Details body instead of a login page. */
public class ProblemDetailsAuthenticationEntryPoint implements AuthenticationEntryPoint {

  private static final String BODY =
      "{\"type\":\"about:blank\",\"title\":\"No autenticado\",\"status\":401,"
          + "\"detail\":\"Inicia sesión para continuar\"}";

  @Override
  public void commence(
      HttpServletRequest request,
      HttpServletResponse response,
      AuthenticationException authException)
      throws IOException {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
    response.getWriter().write(BODY);
  }
}
