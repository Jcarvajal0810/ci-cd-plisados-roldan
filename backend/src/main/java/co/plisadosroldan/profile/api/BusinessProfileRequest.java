package co.plisadosroldan.profile.api;

import co.plisadosroldan.profile.domain.BusinessProfile;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Contract schema {@code BusinessProfile} as a request; limits mirror data-model.md. */
record BusinessProfileRequest(
    @NotBlank(message = "Este campo es obligatorio")
        @Size(max = 80, message = "Máximo 80 caracteres")
        String businessName,
    @NotBlank(message = "Este campo es obligatorio")
        @Size(max = 120, message = "Máximo 120 caracteres")
        String slogan,
    @NotBlank(message = "Este campo es obligatorio")
        @Size(max = 8000, message = "Máximo 8000 caracteres")
        String aboutText,
    @NotBlank(message = "Este campo es obligatorio")
        @Pattern(
            regexp = "^[0-9]{10,15}$",
            message = "Solo números, con indicativo de país (10 a 15 dígitos)")
        String whatsappNumber,
    @NotBlank(message = "Este campo es obligatorio")
        @Size(max = 200, message = "Máximo 200 caracteres")
        String locationText,
    @NotBlank(message = "Este campo es obligatorio")
        @Size(max = 300, message = "Máximo 300 caracteres")
        String scheduleText) {

  BusinessProfile toProfile() {
    return new BusinessProfile(
        businessName, slogan, aboutText, whatsappNumber, locationText, scheduleText);
  }
}
