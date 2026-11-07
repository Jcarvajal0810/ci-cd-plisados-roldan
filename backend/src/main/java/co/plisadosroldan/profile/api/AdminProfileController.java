package co.plisadosroldan.profile.api;

import co.plisadosroldan.profile.application.ProfileCommands;
import co.plisadosroldan.profile.application.ProfileQueries;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/profile")
class AdminProfileController {

  private final ProfileQueries queries;
  private final ProfileCommands commands;

  AdminProfileController(ProfileQueries queries, ProfileCommands commands) {
    this.queries = queries;
    this.commands = commands;
  }

  @GetMapping
  BusinessProfileResponse get() {
    return BusinessProfileResponse.from(queries.get());
  }

  @PutMapping
  BusinessProfileResponse update(@Valid @RequestBody BusinessProfileRequest body) {
    return BusinessProfileResponse.from(commands.update(body.toProfile()));
  }
}
