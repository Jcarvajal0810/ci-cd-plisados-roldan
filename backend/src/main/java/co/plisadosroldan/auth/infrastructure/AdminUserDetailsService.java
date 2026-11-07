package co.plisadosroldan.auth.infrastructure;

import co.plisadosroldan.auth.domain.AdminUserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

/** Loads the admin account for Spring Security; emails match case-insensitively. */
@Component
class AdminUserDetailsService implements UserDetailsService {

  private final AdminUserRepository admins;

  AdminUserDetailsService(AdminUserRepository admins) {
    this.admins = admins;
  }

  @Override
  public UserDetails loadUserByUsername(String email) {
    return admins
        .findByEmailIgnoreCase(email)
        .map(
            admin ->
                User.withUsername(admin.email())
                    .password(admin.passwordHash())
                    .roles("ADMIN")
                    .build())
        .orElseThrow(() -> new UsernameNotFoundException("Unknown admin"));
  }
}
