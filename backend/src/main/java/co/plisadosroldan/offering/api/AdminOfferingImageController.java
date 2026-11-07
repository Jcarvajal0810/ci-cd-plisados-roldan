package co.plisadosroldan.offering.api;

import co.plisadosroldan.media.api.ImageResponse;
import co.plisadosroldan.media.api.ImageUploads;
import co.plisadosroldan.media.application.GalleryService;
import co.plisadosroldan.media.domain.GalleryOwner;
import co.plisadosroldan.offering.application.OfferingQueries;
import co.plisadosroldan.shared.api.OrderRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** Gallery of one offering (contract paths {@code /api/admin/offerings/{id}/images...}). */
@RestController
@RequestMapping("/api/admin/offerings/{id}/images")
class AdminOfferingImageController {

  private final OfferingQueries offerings;
  private final GalleryService galleries;

  AdminOfferingImageController(OfferingQueries offerings, GalleryService galleries) {
    this.offerings = offerings;
    this.galleries = galleries;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  ImageResponse upload(
      @PathVariable long id,
      @RequestPart("file") MultipartFile file,
      @RequestParam(value = "altText", required = false) String altText) {
    String name = offerings.byId(id).name();
    return ImageResponse.from(
        galleries.add(GalleryOwner.OFFERING, id, ImageUploads.from(file, altText)), name);
  }

  @PutMapping("/order")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void reorder(@PathVariable long id, @Valid @RequestBody OrderRequest body) {
    offerings.byId(id);
    galleries.reorder(GalleryOwner.OFFERING, id, body.ids());
  }

  @PatchMapping("/{imageId}")
  ImageResponse altText(
      @PathVariable long id,
      @PathVariable long imageId,
      @RequestBody ImageUploads.AltTextRequest body) {
    String name = offerings.byId(id).name();
    return ImageResponse.from(
        galleries.updateAltText(GalleryOwner.OFFERING, id, imageId, body.altText()), name);
  }

  @DeleteMapping("/{imageId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void remove(@PathVariable long id, @PathVariable long imageId) {
    offerings.byId(id);
    galleries.remove(GalleryOwner.OFFERING, id, imageId);
  }
}
