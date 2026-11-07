package co.plisadosroldan.profile.api;

import co.plisadosroldan.profile.domain.BusinessProfile;

/** Contract schema {@code BusinessProfile}. */
public record BusinessProfileResponse(
    String businessName,
    String slogan,
    String aboutText,
    String whatsappNumber,
    String locationText,
    String scheduleText) {

  public static BusinessProfileResponse from(BusinessProfile profile) {
    return new BusinessProfileResponse(
        profile.businessName(),
        profile.slogan(),
        profile.aboutText(),
        profile.whatsappNumber(),
        profile.locationText(),
        profile.scheduleText());
  }
}
