package co.plisadosroldan.profile.application;

import co.plisadosroldan.profile.domain.BusinessProfile;
import co.plisadosroldan.profile.domain.BusinessProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProfileQueries {

  private final BusinessProfileRepository profiles;

  public ProfileQueries(BusinessProfileRepository profiles) {
    this.profiles = profiles;
  }

  public BusinessProfile get() {
    return profiles.get();
  }
}
