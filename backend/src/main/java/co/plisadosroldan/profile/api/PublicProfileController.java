package co.plisadosroldan.profile.api;

import co.plisadosroldan.profile.application.HomeQuery;
import co.plisadosroldan.profile.application.ProfileQueries;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
class PublicProfileController {

  private final ProfileQueries profileQueries;
  private final HomeQuery homeQuery;

  PublicProfileController(ProfileQueries profileQueries, HomeQuery homeQuery) {
    this.profileQueries = profileQueries;
    this.homeQuery = homeQuery;
  }

  @GetMapping("/profile")
  BusinessProfileResponse profile() {
    return BusinessProfileResponse.from(profileQueries.get());
  }

  @GetMapping("/home")
  HomeResponse home() {
    return HomeResponse.from(homeQuery.get());
  }
}
