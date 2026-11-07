package co.plisadosroldan.auth.api;

import co.plisadosroldan.auth.application.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
class AuthController {

  record LoginRequest(@NotBlank String email, @NotBlank String password) {}

  record AdminMeResponse(String email) {}

  private final AuthService authService;
  private final SecurityContextRepository securityContextRepository;

  AuthController(AuthService authService, SecurityContextRepository securityContextRepository) {
    this.authService = authService;
    this.securityContextRepository = securityContextRepository;
  }

  @PostMapping("/login")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void login(
      @Valid @RequestBody LoginRequest body,
      HttpServletRequest request,
      HttpServletResponse response) {
    Authentication authentication =
        authService.login(body.email(), body.password(), request.getRemoteAddr());
    if (request.getSession(false) != null) {
      request.changeSessionId(); // session fixation protection
    }
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(authentication);
    SecurityContextHolder.setContext(context);
    securityContextRepository.saveContext(context, request, response);
  }

  @PostMapping("/logout")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void logout(HttpServletRequest request, HttpServletResponse response) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    new SecurityContextLogoutHandler().logout(request, response, authentication);
  }

  @GetMapping("/me")
  AdminMeResponse me(Principal principal) {
    return new AdminMeResponse(principal.getName());
  }
}
