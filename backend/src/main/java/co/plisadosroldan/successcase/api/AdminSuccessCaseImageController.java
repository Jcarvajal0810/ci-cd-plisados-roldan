package co.plisadosroldan.successcase.api;

import co.plisadosroldan.media.api.ImageResponse;
import co.plisadosroldan.media.api.ImageUploads;
import co.plisadosroldan.media.application.GalleryService;
import co.plisadosroldan.media.domain.GalleryOwner;
import co.plisadosroldan.shared.api.OrderRequest;
import co.plisadosroldan.successcase.application.SuccessCaseQueries;
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

/** Gallery of one success case (same rules as offering galleries, via GalleryService). */
@RestController
@RequestMapping("/api/admin/success-cases/{id}/images")
class AdminSuccessCaseImageController {

  private final SuccessCaseQueries cases;
  private final GalleryService galleries;

  AdminSuccessCaseImageController(SuccessCaseQueries cases, GalleryService galleries) {
    this.cases = cases;
    this.galleries = galleries;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  ImageResponse upload(
      @PathVariable long id,
      @RequestPart("file") MultipartFile file,
      @RequestParam(value = "altText", required = false) String altText) {
    String title = cases.byId(id).title();
    return ImageResponse.from(
        galleries.add(GalleryOwner.SUCCESS_CASE, id, ImageUploads.from(file, altText)), title);
  }

  @PutMapping("/order")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void reorder(@PathVariable long id, @Valid @RequestBody OrderRequest body) {
    cases.byId(id);
    galleries.reorder(GalleryOwner.SUCCESS_CASE, id, body.ids());
  }

  @PatchMapping("/{imageId}")
  ImageResponse altText(
      @PathVariable long id,
      @PathVariable long imageId,
      @RequestBody ImageUploads.AltTextRequest body) {
    String title = cases.byId(id).title();
    return ImageResponse.from(
        galleries.updateAltText(GalleryOwner.SUCCESS_CASE, id, imageId, body.altText()), title);
  }

  @DeleteMapping("/{imageId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void remove(@PathVariable long id, @PathVariable long imageId) {
    cases.byId(id);
    galleries.remove(GalleryOwner.SUCCESS_CASE, id, imageId);
  }
}
