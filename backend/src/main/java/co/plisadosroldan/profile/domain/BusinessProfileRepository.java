package co.plisadosroldan.profile.domain;

/** Persistence port for the single business profile record. */
public interface BusinessProfileRepository {

  BusinessProfile get();

  void update(BusinessProfile profile);
}
