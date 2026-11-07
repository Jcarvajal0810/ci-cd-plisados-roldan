package co.plisadosroldan.profile.application;

import co.plisadosroldan.profile.domain.BusinessProfile;
import co.plisadosroldan.profile.domain.BusinessProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** The owner edits the business information (FR-019). */
@Service
@Transactional
public class ProfileCommands {

  private final BusinessProfileRepository profiles;

  public ProfileCommands(BusinessProfileRepository profiles) {
    this.profiles = profiles;
  }

  public BusinessProfile update(BusinessProfile profile) {
    profiles.update(profile);
    return profiles.get();
  }
}
